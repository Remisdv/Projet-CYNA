---
applyTo: "service/api/**/*.ts"
---

# Architecture cible — Services back-end NestJS

Ce document décrit l'architecture **idéale** à appliquer à tous les services back-end du monorepo (`cyna-bo-api`, `cyna-webapp-api`, `cyna-service-api`, `cyna-gateway-api`).

La référence est `cyna-bo-api`, qui respecte déjà la séparation des couches. Il manque uniquement la couche **Repository** (à ajouter partout).

---

## 1. Couches & responsabilités

```
HTTP Request
    │
    ▼
┌─────────────────┐
│   Controller    │  Couche HTTP : routes, codes, validation DTO d'entrée
└────────┬────────┘
         │ DTO
         ▼
┌─────────────────┐
│     Service     │  Logique métier, orchestration, règles, exceptions
└────────┬────────┘
         │ Entity / Filtres
         ▼
┌─────────────────┐
│   Repository    │  Accès données : encapsule TypeORM (Repository<T>)
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│      ORM        │  TypeORM + entité
└─────────────────┘
```

| Couche | Rôle | Connaît | Ne connaît PAS |
|---|---|---|---|
| **Controller** | Mappe HTTP ↔ Service. Valide les DTO. Gère les codes HTTP. | DTOs, Service | Entity, ORM, Repository |
| **Service** | Logique métier. Lance les exceptions (`NotFoundException`, etc.). Orchestre Repository + Mapper. | DTOs, Entity, Repository, Mapper | TypeORM, requêtes SQL |
| **Repository** | Accès BDD. Expose des méthodes métier (`findActiveBySlug`, etc.). | Entity, TypeORM | DTOs, HTTP |
| **Mapper** | Conversions Entity ↔ DTO. Pas d'effets de bord. | DTOs, Entity | Service, Repository |
| **Entity** | Modèle TypeORM. Décorateurs colonnes/relations uniquement. | TypeORM | DTOs, Service |
| **DTO** | Contrat d'entrée/sortie HTTP. Validations `class-validator`. | rien | Entity, ORM |

**Règle d'or :** un appel ne saute jamais une couche. `Controller → Service → Repository → ORM`.

---

## 2. Arborescence type d'un module (ex. `Category`)

Tout ce qui appartient à un domaine est **regroupé sous `service/<Domain>/`**, avec des sous-dossiers `dtos/` et `mappers/` dédiés.

```
src/
├── endpoint/Category/
│   └── Category.controller.ts
├── service/Category/
│   ├── Category.service.ts
│   ├── dtos/
│   │   └── Category.dto.ts
│   └── mappers/
│       └── Category.mapper.ts
├── repository/Category/                 ← À AJOUTER
│   └── Category.repository.ts
├── database/entity/Category/
│   └── Category.entity.ts
└── module/
    └── Category.module.ts
```

> ⚠️ L'organisation actuelle de `cyna-bo-api` utilise des dossiers transverses `service/dtos/<Domain>/` et `service/mappers/`. **C'est l'ancienne convention.** La nouvelle cible co-localise tout par domaine : `service/<Domain>/dtos/` et `service/<Domain>/mappers/`.

**Convention de nommage** (à respecter strictement) :
- `<Domain>.controller.ts` — un par module
- `<Domain>.service.ts`
- `<Domain>.repository.ts`
- `<Domain>.mapper.ts`
- `<Domain>.dto.ts` (peut contenir plusieurs classes : `CreateXDto`, `UpdateXDto`, `XDto`)
- `<Domain>.entity.ts`
- `<Domain>.module.ts`

---

## 3. Patterns par couche

### 3.1 Controller — minimal, sans logique

```ts
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(): Promise<CategoryDto[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoryService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUpdateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
```

**Règles Controller :**
- **Aucune** logique métier, aucune transformation, aucun `try/catch`.
- N'injecte **que** des `Service`. Jamais de `Repository` ni d'entité.
- Utilise les DTO d'entrée (`@Body() dto: CreateXDto`) — la validation est globale via `ValidationPipe`.
- Retourne uniquement des **DTOs** ou `void`.

### 3.2 Service — logique métier, exceptions

```ts
@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly mapper: CategoryMapper,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.findAllOrdered();
    return this.mapper.toDtoArray(categories);
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return this.mapper.toDto(category);
  }

  async create(data: CreateUpdateCategoryDto): Promise<CategoryDto> {
    const entity = this.mapper.toEntity(data);
    const saved = await this.categoryRepository.save(entity);
    return this.mapper.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.categoryRepository.findById(id);
    if (!entity) throw new NotFoundException(`Category ${id} not found`);
    await this.categoryRepository.remove(entity);
  }
}
```

**Règles Service :**
- N'injecte **que** des `Repository` et `Mapper` (et d'autres `Service` si besoin de composition).
- **Jamais** de `@InjectRepository` ni d'appels TypeORM directs ici.
- Lance les exceptions HTTP NestJS (`NotFoundException`, `ConflictException`, `ForbiddenException`...).
- Reçoit des DTO, retourne des DTO.

### 3.3 Repository — encapsule TypeORM

C'est la **couche manquante** dans la plupart des services actuels. Toute interaction TypeORM doit y être déplacée.

```ts
@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAllOrdered(): Promise<Category[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  findById(id: string): Promise<Category | null> {
    return this.repo.findOneBy({ id });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOneBy({ slug });
  }

  save(entity: Partial<Category>): Promise<Category> {
    const created = this.repo.create(entity);
    return this.repo.save(created);
  }

  async update(id: string, patch: Partial<Category>): Promise<Category | null> {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) return null;
    const merged = this.repo.merge(existing, patch);
    return this.repo.save(merged);
  }

  remove(entity: Category): Promise<Category> {
    return this.repo.remove(entity);
  }
}
```

**Règles Repository :**
- **Seul** endroit autorisé à utiliser `@InjectRepository` et `Repository<T>` de TypeORM.
- Méthodes **expressives métier** (`findActiveBySlug`, `countByStatus`) plutôt que de réexposer `find()` brut.
- Retourne des **entités** ou primitifs. Pas de DTO. Pas d'exceptions HTTP (renvoyer `null` ou `[]`).
- Pas de logique métier ni de mapping.

### 3.4 Mapper — conversions pures

```ts
@Injectable()
export class CategoryMapper {
  toDto(entity: Category): CategoryDto { /* ... */ }
  toDtoArray(entities: Category[]): CategoryDto[] { return entities.map(e => this.toDto(e)); }
  toEntity(dto: CreateUpdateCategoryDto): Partial<Category> { /* ... */ }
}
```

**Règles Mapper :**
- Méthodes **pures** (pas d'I/O, pas d'async).
- Pas d'injection autre que d'autres mappers.
- `toEntity` retourne `Partial<Entity>` — la création réelle est faite par le Repository.

### 3.5 DTO — contrat HTTP

```ts
export class CreateUpdateCategoryDto {
  @IsString() slug: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsArray() @ValidateNested({ each: true })
  @Type(() => CategoryTranslationInputDto)
  translations: CategoryTranslationInputDto[];
}

export class CategoryDto {
  id: string;
  slug: string;
  isActive: boolean;
  translations: CategoryTranslationDto[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Règles DTO :**
- DTO d'entrée → **toujours** validé avec `class-validator` (`@IsString`, `@IsBoolean`, `@ValidateNested`...).
- DTO de sortie → simple POJO typé.
- Pas de logique, pas de méthodes.

### 3.6 Entity — modèle TypeORM

Décorateurs `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, relations. **Aucune** méthode métier.

### 3.7 Module — câblage

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, CategoryMapper],
  exports: [CategoryService], // si réutilisé par un autre module
})
export class CategoryModule {}
```

**Règles Module :**
- `imports` : `TypeOrmModule.forFeature([...])` + autres modules dépendants.
- `providers` : Service + Repository + Mapper.
- `exports` : seulement le **Service** si un autre module en a besoin. **Jamais** le Repository.

---

## 4. Règles transverses

### Imports
- Les chemins relatifs sont autorisés (`../../service/...`) — c'est la convention actuelle.
- Pas d'import croisé entre modules au niveau Repository : passer par les **Services**.

### Erreurs
- Jeter les exceptions NestJS (`NotFoundException`, `ConflictException`, `BadRequestException`, `ForbiddenException`, `UnauthorizedException`).
- Jamais de `throw new Error('...')` dans un Service exposé via HTTP.

### Async
- Toujours `async/await`. Pas de `.then()` chainés.
- Les méthodes Repository renvoient `Promise<T | null>` plutôt que `Promise<T | undefined>`.

### Tests
- **Service** mocké avec un `Repository` factice (pas TypeORM). C'est l'intérêt principal de la couche Repository.
- **Controller** testé avec un `Service` mocké.
- **Mapper** testé en pur (entrée/sortie).

### Pureté des fichiers — chaque chose à sa place

**Règle stricte : un fichier ne contient QUE le type d'artefact correspondant à son nom.** Aucune déclaration "parasite" qui appartient à une autre couche.

| Fichier | Doit contenir | À PROSCRIRE absolument |
|---|---|---|
| `*.controller.ts` | Une classe `@Controller`. | Classes DTO, entités, mappers, helpers métier, requêtes TypeORM, types partagés |
| `*.service.ts` | Une classe `@Injectable` de logique métier. | Classes DTO, entités, décorateurs `@InjectRepository`, accès direct à TypeORM |
| `*.repository.ts` | Une classe `@Injectable` qui encapsule TypeORM. | DTO, mapping, exceptions HTTP, logique métier |
| `*.mapper.ts` | Une classe `@Injectable` de conversion pure. | DTO, accès BDD, async, exceptions HTTP |
| `*.dto.ts` | Classes DTO + leurs validateurs `class-validator`. | Logique, méthodes, accès BDD, décorateurs TypeORM (`@Entity`, `@Column`) |
| `*.entity.ts` | Une classe `@Entity` TypeORM. | DTOs, validateurs `class-validator`, méthodes métier |
| `*.module.ts` | Un `@Module` de câblage. | Toute autre déclaration |

**Exemples interdits :**

```ts
// ❌ category.controller.ts — DTO déclaré dans le controller
export class CreateCategoryDto { /* ... */ }   // → DOIT être dans dtos/Category.dto.ts

@Controller('categories')
export class CategoryController { /* ... */ }
```

```ts
// ❌ category.service.ts — entité ou DTO redéclarés
class CategoryEntity { /* ... */ }              // → entity/Category/Category.entity.ts
class CategoryResponseDto { /* ... */ }         // → dtos/Category.dto.ts
```

```ts
// ❌ category.dto.ts — décorateurs TypeORM
@Entity()                                       // → entity/Category/Category.entity.ts
export class CategoryDto { @Column() id: string; }
```

```ts
// ❌ category.mapper.ts — appel BDD dans un mapper
@Injectable()
export class CategoryMapper {
  constructor(@InjectRepository(Category) private repo) {}  // → mapper pur, jamais de repo
}
```

**Vérification rapide avant de commit un fichier :**
1. Le nom du fichier indique-t-il son rôle unique ? (`*.controller.ts` → 1 controller, rien d'autre)
2. Ai-je des classes/types dont le suffixe (`Dto`, `Entity`, `Mapper`) ne correspond pas au fichier ? → Déplacer.
3. Y a-t-il des décorateurs étrangers à la couche ? (`@Column` hors entité, `@InjectRepository` hors repository, `@IsString` hors DTO) → Déplacer.

**Types partagés** : si un type est utilisé par plusieurs domaines, créer `service/shared/` ou `service/common/` — **jamais** le redéclarer ailleurs.

---

## 5. Checklist de refactoring (par module à reprendre)

Pour chaque module qui fait encore du TypeORM dans le Service :

- [ ] Créer `src/repository/<Domain>/<Domain>.repository.ts` annoté `@Injectable()`.
- [ ] Y déplacer **toutes** les méthodes utilisant `this.repo.*` du Service.
- [ ] Remplacer dans le Service `@InjectRepository(...)` par `private readonly xxxRepository: XxxRepository`.
- [ ] Vérifier que le Service n'importe plus `typeorm` ni `@nestjs/typeorm`.
- [ ] Ajouter le Repository dans `providers` du Module correspondant.
- [ ] Vérifier que le Controller n'a aucune logique (tout est délégué au Service).
- [ ] Vérifier que le Mapper est pur (pas d'async, pas d'injection BDD).
- [ ] Vérifier que les DTOs d'entrée ont des validateurs `class-validator`.
- [ ] Lancer les tests fonctionnels (`docker/test/run-tests.ps1`).

---

## 6. Anti-patterns à proscrire

| ❌ À éviter | ✅ Faire à la place |
|---|---|
| Controller qui fait `repo.find(...)` | Controller appelle `service.findAll()` |
| Service avec `@InjectRepository(...)` | Service injecte `XxxRepository` (custom) |
| Repository qui retourne un DTO | Repository retourne l'Entity, le Mapper convertit |
| Mapper async ou avec injection BDD | Mapper pur, méthodes synchrones |
| `throw new Error('not found')` dans un Service | `throw new NotFoundException(...)` |
| Module qui exporte un Repository | N'exporter que le Service |
| Logique métier dans une Entity | Logique dans le Service |

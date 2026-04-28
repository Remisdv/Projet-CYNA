# Mémoire de fin d'études — Compte rendu d'activité

**Titre professionnel : Coordinateur de Projets Informatiques**
**Année 2025-2026**

> Document de travail — base structurée pour la rédaction du mémoire final (30 pages hors annexes, Arial 12, interligne 1,5, marges 2,5 cm).
> Nommage du fichier final attendu : `VILLEDUCAMPUS_NOM_Prénom_Promo_2024.pdf`

---

## Page de couverture

- Nom / Prénom : **LHUILLIER Rémi**
- Formation : **Coordinateur de Projets Informatiques — Promotion 2025-2026**
- Campus : **Rennes**
- Entreprise d'accueil : **Erium**
- Maître d'apprentissage : **Kévin Kampion**
- Tuteur pédagogique : **Chloé Piron**

---

## Remerciements

*(À rédiger — rester sobre. Remercier le maître d'apprentissage Kévin Kampion, le tuteur école Chloé Piron, l'équipe technique et QA d'Erium, ainsi que les développeurs ayant reviewé les contributions.)*

---

## Avant-propos

Ce mémoire s'inscrit dans le cadre de la validation du titre professionnel **Coordinateur de Projets Informatiques**. Il retrace une année d'alternance chez **Erium** en qualité de **Testeur QA / Développeur QA**, au cours de laquelle j'ai fiabilisé puis étendu une suite de tests End-to-End Cypress, conçu un outil interne de tests de charge multiplateforme (Tauri / Rust / React), puis finalisé l'intégration en CI/CD de la suite E2E.

Au-delà de la restitution des missions, ce document vise à démontrer la capacité à **piloter, structurer et industrialiser** une démarche qualité logicielle dans un contexte de projet réel, en conjuguant la rigueur de la QA et la coordination technique attendue d'un futur Coordinateur de Projets Informatiques.

---

## Table des matières

1. Introduction générale
2. Présentation de l'entreprise et de son contexte
3. Problématique et cadre du mémoire
4. Mission 1 — Reprise et refonte de la base de tests E2E Cypress
5. Mission 2 — Outillage QA et amélioration de la lisibilité des erreurs
6. Mission 3 — Re-découpage et industrialisation de la suite E2E
7. Mission 4 — Application Tauri de load testing (projet transverse)
8. Mission 5 — Déploiement et build automatisé de l'application Tauri (pipeline multi-OS)
9. Mission 6 — Intégration des tests E2E en CI/CD
10. Bilan transverse : collaboration IA, veille et autonomie
11. Résultats, retour d'expérience et recommandations
12. Conclusion générale
13. Bibliographie
14. Annexes

---

## 1. Introduction générale

### 1.1 Contexte

Mon alternance s'est déroulée chez **Erium**, éditeur d'une plateforme SaaS modulaire de cybersécurité (webapp publique React, back-office React, API NestJS en micro-services : gateway, webapp-api, service-api, bo-api). À mon arrivée, un socle de tests End-to-End Cypress existait mais souffrait de problèmes structurels majeurs : instabilité chronique, absence de commandes Cypress personnalisées, `cy.wait()` hardcodés en lieu et place de vrais timeouts, specs monolithiques, aucune intégration CI.

### 1.2 Problématique centrale

> **Comment fiabiliser, outiller et industrialiser une suite de tests End-to-End sur une application SaaS multi-services, la rendre exploitable par des profils non-QA, puis l'intégrer en CI/CD ; tout en produisant en parallèle un outil interne de tests de charge accessible à toute l'équipe ?**

Cette problématique se décline en quatre axes :

1. **Fiabilité** — supprimer la *flakiness*, garantir la reproductibilité.
2. **Maintenabilité** — rendre les tests modulaires, conformes aux conventions Cypress.
3. **Accessibilité** — permettre aux profils non-techniques d'exécuter et d'interpréter les tests.
4. **Industrialisation** — packager et déployer l'outil de load testing, puis brancher la suite E2E en CI/CD.

### 1.3 Annonce du plan

Le mémoire présente l'entreprise et sa stratégie, puis déroule **chronologiquement** les six missions réalisées — de la reprise du socle QA jusqu'à l'intégration CI/CD finale, en passant par le projet transverse Tauri et sa pipeline multi-OS. Il se clôt sur un bilan et des recommandations.

---

## 2. Présentation de l'entreprise et du contexte *(≈ 6 pages)*

*(À compléter avec une analyse personnelle — ne pas recopier de plaquette commerciale.)*

### 2.1 Erium : dix ans d'expertise en cybersécurité

Fondée il y a plus de dix ans et basée à Rennes, **Erium** est une entreprise spécialisée dans la cybersécurité. Son activité s'articule autour de deux axes complémentaires.

Le premier axe est celui du **conseil et de l'expertise** : Erium accompagne ses clients sur des sujets critiques tels que la gestion de crise, l'IAM & PAM (gestion des identités et des accès à privilèges), la sécurité cloud et la GRC (Gouvernance, Risque et Conformité). Ces missions s'appuient sur une équipe d'experts reconnus dans l'écosystème cyber français.

Le second axe est celui de l'**édition logicielle** : Erium développe et commercialise deux solutions SaaS propriétaires à destination des entreprises souhaitant renforcer et valider leur posture de sécurité.

### 2.2 Les deux solutions produit

**BlackNoise** est une plateforme de *Breach and Attack Simulation* (BAS), positionnée comme leader européen sur son segment. Elle permet aux équipes de sécurité de simuler des attaques réelles sur leurs environnements (cloud, réseaux, endpoints) afin de mesurer l'efficacité réelle de leurs défenses, leurs temps de détection et leurs capacités de réaction. BlackNoise offre ainsi une vue objective et continue du niveau de sécurité opérationnel d'une organisation.

**Cyber Investigation** est une plateforme de *social awareness training* dédiée à la sensibilisation et à la formation des collaborateurs. Elle couvre l'ensemble des enjeux de culture cyber : simulation de phishing, modules de formation, évaluation des compétences en conditions réelles, et suivi de la progression à l'échelle de l'entreprise.

C'est sur **BlackNoise** que s'est déroulée mon alternance.

### 2.3 L'équipe BlackNoise

L'équipe produit BlackNoise est de taille réduite, ce qui implique une forte polyvalence et une grande autonomie de chacun de ses membres. Elle est composée de :

- **2 développeurs back-end**
- **1 développeur front-end**
- **1 lead tech / DevOps** — Kévin Kampion, maître d'apprentissage, garant de l'architecture, du déploiement et de la qualité technique globale

Cette organisation en équipe resserrée rend d'autant plus stratégique le travail de QA et d'automatisation : chaque régression non détectée a un impact direct sur la stabilité d'un produit exposé à des clients entreprises dans un domaine sensible.

### 2.4 Ma position

J'ai intégré l'équipe BlackNoise en tant que **Testeur QA / Développeur QA**, rattaché directement à Kévin Kampion. Mes missions couvraient l'ensemble du cycle QA : de la reprise et fiabilisation des tests existants jusqu'à l'industrialisation de la suite E2E en CI/CD, en passant par la conception d'un outil interne de tests de charge.

---

## 3. Problématique et cadre du mémoire

### 3.1 État des lieux à mon arrivée

| Indicateur | Constat initial |
|------------|-----------------|
| Couverture E2E estimée | ~60 % des parcours fonctionnels |
| Stabilité des tests | Majoritairement *flaky* — crash fréquent dès la 1ʳᵉ itération |
| Commandes Cypress personnalisées | Aucune (`cypress/support/commands.ts` quasi vide) |
| Gestion des attentes | `cy.wait(ms)` hardcodés partout, aucun `cy.intercept()` ou assertion d'état |
| Architecture des specs | Fichiers monolithiques (jusqu'à ~1000 lignes) couvrant plusieurs parcours |
| Lisibilité des erreurs | Messages Cypress bruts, incompréhensibles pour un profil non-QA |
| Intégration CI/CD | Absente |
| Tests de charge | Inexistants |

### 3.2 Objectifs que je me suis fixés

1. Se réapproprier l'existant en corrigeant les tests cassés.
2. Augmenter la couverture fonctionnelle.
3. Normaliser (commandes Cypress, timeouts, sélecteurs `data-testid`).
4. Outiller l'exécution et le diagnostic pour les non-techniques.
5. Re-découper en tests atomiques (1 test = 1 comportement).
6. Concevoir un outil interne de tests de charge multiplateforme.
7. Industrialiser son build et sa distribution.
8. Intégrer la suite E2E en CI/CD.

### 3.3 Méthode projet

N'ayant pas de chef de projet dédié pour ces sujets, j'ai travaillé **en mode projet autonome** : création et priorisation de mes tickets sur le Kanban, rédaction de User Stories, démos régulières au tuteur, et **revue de code systématique par un développeur senior avant merge**. Les arbitrages structurants ont été validés par le maître d'apprentissage.

---

## 4. Mission 1 — Reprise et refonte de la base de tests E2E Cypress

### 4.1 Contexte

Le socle Cypress existant couvrait environ 60 % de l'application mais était **non exécutable de manière fiable** : la plupart des specs échouaient dès la première exécution. Aucune convention Cypress n'était appliquée.

### 4.2 Démarche

1. **Audit de l'existant** : cartographie des specs, relevé des parcours couverts / non couverts, identification des *anti-patterns* (waits hardcodés, sélecteurs CSS fragiles, absence d'idempotence).
2. **Réparation progressive** :
   - Remplacement des `cy.wait(ms)` par des assertions conditionnelles et `cy.intercept()` + `cy.wait('@alias')`.
   - Ajout de `timeout` explicites sur les opérations réseau lentes.
   - Introduction des **commandes Cypress personnalisées** (`cy.loginAs()`, `cy.seedOrder()`, `cy.resetFixture()`, etc.).
   - Remplacement progressif des sélecteurs par des `data-testid` côté front, en coordination avec l'équipe Front.
3. **Extension de la couverture** : une fois la base stabilisée, ajout de nouveaux tests pour les pages / besoins métier non couverts, en alternant cycles de *fix* et cycles d'*ajout*.

### 4.3 Résultats

- Taux de réussite local passé d'*aléatoire* à **> 95 %**.
- Suppression d'environ 80 % des `cy.wait()` aveugles.
- Mise en place d'une convention `data-testid` partagée avec le Front.
- Couverture fonctionnelle étendue (aboutissant à ~83 tests après découpage — cf. Mission 3).

### 4.4 Livrables

- Specs corrigées et nouvelles specs.
- `cypress/support/commands.ts` enrichi.
- Document de conventions QA (annexe).

---

## 5. Mission 2 — Outillage QA et amélioration de la lisibilité des erreurs

### 5.1 Problématique

Lorsqu'un test échouait, le message Cypress brut (stack trace, sélecteur, assertion) était **incompréhensible pour les profils non-QA** : développeurs peu familiers de Cypress, PO, tuteur métier. Cela ralentissait la boucle de feedback et limitait l'adoption des tests par l'équipe.

### 5.2 Démarche

1. Conception d'un **système de description automatique des erreurs** : mapping entre les erreurs Cypress fréquentes (timeout, élément introuvable, assertion échouée, requête réseau non interceptée…) et un message **en langage naturel** orienté parcours utilisateur.
2. Développement de **scripts de lancement** (Bash + TypeScript) facilitant :
   - le lancement ciblé (1 spec, 1 tag, 1 fichier) ;
   - la sélection de l'environnement (local, stack Docker de test) ;
   - la génération de rapports lisibles (résumé humain + lien vers vidéo / screenshot).
3. Intégration de ces outils au flux de travail : un non-QA peut désormais lancer et interpréter un test via une commande simple.

### 5.3 Résultats

- Réduction significative du temps de diagnostic d'un échec pour un profil non-QA.
- Augmentation du nombre de personnes capables de relancer et d'interpréter les tests.

### 5.4 Livrables

- Scripts `run-tests.sh` / `.ps1` harmonisés (cf. [docker/test/run-tests.sh](docker/test/run-tests.sh) et [docker/test/run-tests.ps1](docker/test/run-tests.ps1)).
- Fichier de mapping d'erreurs + générateur de rapports.

---

## 6. Mission 3 — Re-découpage et industrialisation de la suite E2E

### 6.1 Problématique

La suite initiale contenait des specs **monolithiques** (jusqu'à ~1000 lignes). Un échec à la ligne 100 **skippait les 900 lignes suivantes**, masquant d'autres régressions et rendant les rapports inexploitables.

### 6.2 Démarche

1. **Règle adoptée** : *un fichier de test = un comportement métier = un `it()` significatif*.
2. Découpage de la vingtaine de specs existantes en **specs atomiques** — aboutissant à **~83 tests** courts et ciblés.
3. Mutualisation des prérequis via `beforeEach` idempotents et commandes Cypress personnalisées (seed, login, reset).
4. Tagging des tests (smoke / regression / critique) pour exécution conditionnelle.
5. Exécution **conteneurisée** via Docker Compose de test (cf. [docker/test/docker-compose.yml](docker/test/docker-compose.yml)) : chaque run démarre une stack isolée, seedée, jetable.

### 6.3 Résultats

- Isolation des échecs : un fail ne masque plus les autres.
- Parallélisation désormais possible — prérequis clé pour la CI/CD (Mission 6).
- Temps de diagnostic d'un fail divisé de manière significative.

### 6.4 Livrables

- Suite E2E re-découpée (~83 tests atomiques).
- Stack Docker de test (arborescence `docker/test/`).
- Conventions de nommage et de tagging.

---

## 7. Mission 4 — Application Tauri de load testing (projet transverse)

### 7.1 Origine et besoin

En parallèle de la consolidation de la suite E2E, un besoin transverse a émergé : disposer d'une **application desktop multiplateforme (Linux / macOS)** permettant à des profils **techniques et non-techniques** de :

- lancer des **tests de charge** sur les différentes plateformes d'Erium ;
- **monitorer** en temps réel les métriques (latence, taux d'erreur, throughput) ;
- produire des rapports exploitables par le management et la direction technique.

L'enjeu est double : **simplicité** pour les profils non-techniques (UX guidée), **profondeur** pour les profils techniques (paramétrage fin, export brut).

### 7.2 Choix techniques

- **Tauri** — framework desktop multiplateforme léger (binaire natif, empreinte mémoire réduite, surface d'attaque réduite ; cohérent pour un éditeur cybersécurité).
- **Rust** côté cœur — génération de charge concurrente, collecte des métriques, performance prévisible.
- **React** côté UI — cohérence avec la stack front d'Erium, courbe d'apprentissage minimale pour l'équipe.

### 7.3 Démarche

1. Cadrage du besoin avec le maître d'apprentissage et les futurs utilisateurs (techniques + non techniques).
2. Création d'un **repo dédié** avec scaffolding Tauri.
3. Développement itératif : parcours de configuration → exécution → monitoring temps réel → rapport.
4. Deux modes d'usage dans l'UI : *simplifié* (scénarios pré-configurés, résultats visuels) et *avancé* (paramétrage fin, export brut).

### 7.4 État d'avancement

Une **V1 satisfaisante** est livrée : parcours utilisateur complet, packaging Linux et macOS opérationnels. Les itérations se poursuivront sur la durée restante de l'alternance avec comme cibles V2 : scénarios paramétrables enrichis, comparaisons de runs, export CSV / JSON, éventuel mode CI (exécution headless intégrable à une pipeline nocturne).

### 7.5 Livrables

- Application Tauri V1 (repo dédié).
- Guide utilisateur (profil technique / profil non-technique).
- Socle de la pipeline multi-OS (cf. Mission 5).

---

## 8. Mission 5 — Déploiement et build automatisé de l'application Tauri (pipeline multi-OS)

> Cette mission est traitée à part car elle concentre la plus grande complexité technique et de coordination du projet Tauri : **construire et distribuer une application desktop macOS depuis une infrastructure CI/CD Linux *on-premise*.**

### 8.1 Problématique

Le build d'une application Tauri pour **macOS** exige un environnement **macOS** (contrainte Apple : SDK, signature, notarisation). Or l'infrastructure CI/CD d'Erium repose exclusivement sur des **runners GitLab CI *on-premise* Linux**. Aucun runner macOS n'est disponible, et aucune cross-compilation fiable n'est supportée pour produire un bundle `.app` signé.

### 8.2 Contraintes additionnelles

- Le dépôt source de l'application Tauri est hébergé sur **GitLab** (CI GitLab = source de vérité).
- Les runners macOS hébergés ne sont proposés que par certaines plateformes externes (notamment **GitHub Actions**, qui fournit une image `macos-latest`).
- La pipeline doit rester **pilotée depuis GitLab**, afin de ne pas fragmenter le workflow de l'équipe.

### 8.3 Architecture retenue

J'ai mis en place un **schéma hybride GitLab ↔ GitHub** dont le principe est :

1. Un **miroir synchronisé** du repo GitLab vers un repo GitHub est configuré : chaque push GitLab déclenche une synchronisation vers GitHub.
2. Sur GitHub, un **workflow GitHub Actions** dédié ne contient **qu'un seul job** : le build macOS sur `macos-latest` (compilation Rust, bundling Tauri, signature, production d'un artefact `.dmg` / `.app`).
3. Côté GitLab, le pipeline principal :
   - exécute les jobs Linux natifs (lint, tests, build Linux `.AppImage` / `.deb`) ;
   - **déclenche** le workflow GitHub via son API ;
   - **attend la complétion** du job macOS (polling de statut) ;
   - **rapatrie** l'artefact macOS produit par GitHub Actions ;
   - **agrège** tous les artefacts (Linux + macOS) et publie la release.

### 8.4 Difficultés rencontrées et levées

- **Synchronisation des repos** : garantir qu'aucun commit ne soit perdu et que le miroir reflète l'état exact de la branche en cours de build.
- **Attente cross-plateforme** : concevoir un job GitLab capable d'interroger proprement l'API GitHub Actions (authentification par token, gestion des timeouts, gestion des reruns).
- **Cohérence des artefacts** : versioning unifié entre Linux et macOS pour publier une release cohérente.
- **Signature macOS** : gestion sécurisée des certificats Apple côté GitHub (secrets chiffrés), sans les exposer côté GitLab.

### 8.5 Résultats

- Pipeline multi-OS opérationnelle : **une seule action (push / tag)** produit les bundles Linux **et** macOS.
- GitLab reste la source de vérité ; GitHub Actions est transparent pour l'utilisateur final.
- Distribution aux utilisateurs internes industrialisée.

### 8.6 Valeur ajoutée pour Erium

- Déblocage d'un cas d'usage qui aurait nécessité l'achat d'un Mac de build ou un abonnement externe coûteux.
- Schéma **réutilisable** pour tout futur projet desktop cross-platform d'Erium.

### 8.7 Livrables

- Configuration GitLab CI (`.gitlab-ci.yml` multi-stages).
- Workflow GitHub Actions macOS.
- Script de synchronisation des repos et d'attente croisée.
- Documentation de la pipeline (annexe).

---

## 9. Mission 6 — Intégration des tests E2E en CI/CD

### 9.1 Objectif

Exécuter automatiquement la suite E2E sur chaque merge request et sur `develop`, afin de :

- détecter les régressions **avant merge** ;
- libérer du temps humain sur la QA manuelle ;
- donner un signal de qualité partagé à toute l'équipe.

### 9.2 Premier essai et report

Une première tentative a buté sur plusieurs blocages techniques (stack multi-conteneurs, seeds dans un runner éphémère, conflits de ports et de noms de conteneurs, secrets). Dans une logique de priorisation projet, la mission a été **temporairement reportée** au profit du projet transverse Tauri (Missions 4 et 5). Une fois la V1 Tauri livrée, **j'ai repris la mission à mon compte et l'ai menée à terme.**

### 9.3 Démarche de reprise

1. **Audit des blocages précédents** et découpage en sous-problèmes traitables.
2. **Override du process de lancement de la stack micro-services** pour la CI :
   - démarrage **uniquement du sous-ensemble de services** nécessaires aux tests E2E (et non de l'intégralité du repo, contrairement au dev local) ;
   - adaptation de la configuration Docker Compose de test pour un contexte éphémère.
3. **Refonte de la logique des seeds E2E** : alignement sur le sous-ensemble de services effectivement démarrés, suppression des dépendances implicites vers des services absents.
4. **Isolation multi-pipeline** — plusieurs pipelines pouvant s'exécuter en parallèle :
   - **noms de conteneurs aléatoires** dérivés du nom du job CI/CD ;
   - **URLs internes aléatoires** pour éviter les collisions sur les runners partagés ;
   - réseaux Docker dédiés par run.
5. **Orchestration** : séquence CI `lancement stack → seeds → exécution Cypress → collecte des rapports → teardown`.
6. **Collecte et publication** des rapports (screenshots, vidéos, sortie `mochawesome`) comme artefacts GitLab.

### 9.4 État actuel (mission réussie, optimisation en cours)

La pipeline est **fonctionnelle de bout en bout** : sur un push, les tests E2E sont lancés automatiquement dans un environnement isolé et produisent un rapport exploitable. Les temps actuels (sous-ensemble de ~10 tests sur 83) :

| Étape | Durée observée |
|-------|----------------|
| Lancement de la stack | ~10 min |
| Seeds | ~5 min |
| Exécution Cypress (10 tests) | ~10 min |
| **Total** | **~25 min** |

La prochaine étape est l'**optimisation** pour tenir l'intégralité des 83 tests dans un budget temps acceptable : parallélisation Cypress, images Docker pré-buildées, caches de seeds, dépendances de services allégées.

### 9.5 Résultats

- Régressions détectées automatiquement à chaque merge request.
- Isolation robuste entre pipelines concurrents (plus de collisions de conteneurs / ports).
- Capitalisation : la mécanique d'override de stack est désormais **réutilisable** pour d'autres suites de tests.

### 9.6 Livrables

- Pipeline GitLab CI pour l'exécution E2E.
- Variante paramétrable du `docker-compose.yml` de test (variables CI).
- Refonte des scripts de seed E2E.
- Documentation d'exploitation (annexe).

### 9.7 Retour d'expérience

La valeur de cette mission tient autant à sa **réussite technique** qu'à son **parcours projet** : report initial, réouverture après montée en compétence, reprise en autonomie, livraison. Elle illustre concrètement une **capacité de coordination** et une **ténacité projet** attendues du rôle de Coordinateur de Projets Informatiques.

---

## 10. Bilan transverse : collaboration IA, veille et autonomie

### 10.1 Collaboration avec les outils IA

Tout au long de l'alternance, j'ai travaillé **en binôme avec des outils d'IA** (GitHub Copilot, agents personnalisés) pour :

- accélérer la génération de code de test répétitif (fixtures, mocks, helpers) ;
- documenter automatiquement les parcours ;
- explorer des solutions de pipeline complexes (cross-build Tauri, synchronisation GitLab ↔ GitHub, override de stack CI).

Cette collaboration a été **encadrée** : chaque sortie d'IA a été revue, adaptée au contexte et soumise à la revue de code humaine. L'IA a été un **accélérateur**, non un substitut au raisonnement d'ingénierie.

### 10.2 Veille technologique

Veille régulière sur : Cypress (évolutions API, bonnes pratiques), Playwright (benchmark comparatif), Tauri (écosystème Rust desktop), stratégies de load testing (k6, Artillery), CI/CD (GitLab CI, GitHub Actions, patterns cross-platform).

### 10.3 Autonomie et coordination

- **Gestion autonome du Kanban** : création, priorisation et suivi de mes propres tickets.
- **Revue systématique** : chaque contribution passait par la revue d'un développeur senior avant merge.
- **Validation du maître d'apprentissage** : points réguliers, démos, arbitrages sur les reports / reprises de mission.

Cette posture illustre les compétences attendues d'un **Coordinateur de Projets Informatiques** : autonomie sur le périmètre, transparence sur les blocages, escalade maîtrisée, capacité à reprendre une mission reportée.

---

## 11. Résultats, retour d'expérience et recommandations

### 11.1 Résultats consolidés (à chiffrer pour la version finale)

| Indicateur | Avant | Après |
|------------|-------|-------|
| Couverture E2E | ~60 % | ~83 tests atomiques, couverture étendue |
| Stabilité (taux de succès local) | Aléatoire | > 95 % |
| Taille moyenne d'une spec | Jusqu'à ~1000 lignes | 1 comportement / fichier |
| Temps de diagnostic d'un fail (non-QA) | Quasi impossible | Message humain + rapport |
| Intégration CI/CD E2E | Absente | **Opérationnelle** (10/83 tests, optimisation en cours) |
| Outil de load testing | Inexistant | **Application Tauri V1 livrée** |
| Build desktop multi-OS | Inexistant | Pipeline GitLab ↔ GitHub Actions opérationnelle |

### 11.2 Facteurs de réussite

- Adoption progressive (pas de *big bang*).
- Coordination étroite avec l'équipe Front pour les `data-testid`.
- Mode projet autonome avec revues régulières.
- Outillage orienté utilisateur (lisibilité des erreurs pour non-QA).
- Ténacité sur la CI/CD après le premier report.

### 11.3 Facteurs d'échec ou limites

- **Temps d'exécution CI E2E** encore élevé (~25 min pour 10 tests) — optimisation à mener.
- **Complexité de la pipeline multi-OS** Tauri : dépendance à GitHub Actions pour macOS, dette de maintenance.
- **Dette technique front** initiale (absence de `data-testid`) a ralenti les premières semaines.

### 11.4 Recommandations / pistes d'amélioration

1. **Optimiser la CI E2E** : images Docker pré-buildées, parallélisation Cypress, cache des seeds.
2. Mettre en place un **tableau de bord qualité** (taux de succès, couverture, flakiness) exposé à toute l'équipe.
3. Étendre la suite à des tests **contractuels d'API** (Pact / Schemathesis) côté gateway.
4. Faire évoluer l'application Tauri vers un **mode CI headless** pour intégrer le load testing en pipeline nocturne.
5. Formaliser un **processus QA partagé** (conventions `data-testid`, gabarit de spec, check-list de PR / MR).
6. Évaluer l'acquisition d'un runner macOS interne pour réduire la dépendance à GitHub Actions.

---

## 12. Conclusion générale

Cette année d'alternance chez Erium m'a permis de parcourir un cycle complet de **fiabilisation puis d'industrialisation** d'une démarche qualité : reprise d'un socle Cypress instable, refonte en tests atomiques, outillage pour les profils non-QA, conception d'un outil interne de tests de charge multiplateforme, mise en place d'une pipeline de build cross-OS inédite dans l'entreprise, et enfin intégration en CI/CD des tests E2E — mission initialement reportée puis **reprise et menée à terme**.

Au-delà des livrables, ce parcours a consolidé les compétences attendues d'un **Coordinateur de Projets Informatiques** : cadrage de problématique, pilotage autonome, coordination avec les parties prenantes (Front, DevOps, tuteur), arbitrage sur les blocages, reprise d'une mission reportée, et capitalisation (outils, conventions, documentation).

Les mois restants seront consacrés à l'**optimisation de la CI E2E** (passer de 10 à 83 tests dans un budget temps raisonnable), à la **V2 de l'application Tauri**, et à la consolidation d'un **tableau de bord qualité** partagé.

---

## 13. Bibliographie *(à enrichir)*

- Documentation officielle Cypress — <https://docs.cypress.io/>
- Documentation Tauri — <https://tauri.app/>
- The Rust Programming Language — S. Klabnik, C. Nichols
- Continuous Delivery — J. Humble, D. Farley
- Documentation GitLab CI / GitHub Actions
- Articles de veille (à lister lors de la version finale).

---

## 14. Annexes *(paginées séparément)*

- **Annexe A** — Extraits de `cypress/support/commands.ts` (commandes personnalisées).
- **Annexe B** — Exemple de mapping erreur Cypress → message humain.
- **Annexe C** — Extrait de la stack Docker de test ([docker/test/docker-compose.yml](docker/test/docker-compose.yml)).
- **Annexe D** — Architecture de l'application Tauri (schéma, dépendances Rust / React).
- **Annexe E** — Pipeline CI multi-OS **GitLab ↔ GitHub Actions** (schéma de séquence, `.gitlab-ci.yml`, workflow GitHub Actions).
- **Annexe F** — Pipeline CI/CD des tests E2E (schéma, `.gitlab-ci.yml`, scripts de seed).
- **Annexe G** — Captures d'écran avant / après (tests, rapports, application Tauri).
- **Annexe H** — Lexique technique (E2E, flakiness, runner, Tauri, seed, `data-testid`, notarisation, etc.).

---

## Check-list de conformité au guide méthodologique

- [ ] 30 pages (±10 %) hors annexes
- [ ] Police Arial 12, interligne 1,5, marges 2,5 cm
- [ ] Annexes et lexique paginés séparément
- [ ] Tableaux et schémas numérotés, titrés, sourcés et datés
- [ ] Rédaction en français, relecture orthographique
- [ ] Confidentialité respectée
- [ ] Fichier nommé selon le format `VILLEDUCAMPUS_NOM_Prénom_Promo_Année` (ex. `RENNES_LHUILLIER_Rémi_CPI_2026.pdf` — à valider avec l'école)
- [ ] Dépôt sur CESAR et envoi au tuteur avant la date butoir

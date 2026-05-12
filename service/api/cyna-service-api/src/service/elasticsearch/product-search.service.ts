import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ELASTICSEARCH_CLIENT } from '../../module/elasticsearch/elasticsearch.module';
import { ProductEntity, ProductStatus } from '../../database/entity/product';
import { ProductRepository } from '../../repository/product/product.repository';

const PRODUCTS_INDEX = 'products';

@Injectable()
export class ProductSearchService implements OnModuleInit {
  private readonly logger = new Logger(ProductSearchService.name);

  constructor(
    @Inject(ELASTICSEARCH_CLIENT) private readonly esClient: Client,
    private readonly productRepository: ProductRepository,
  ) { }

  async onModuleInit() {
    await this.reindexAll();
  }

  private async ensureIndex(): Promise<void> {
    try {
      // Always delete and recreate to ensure the mapping is current
      const exists = await this.esClient.indices.exists({ index: PRODUCTS_INDEX });
      if (exists) {
        await this.esClient.indices.delete({ index: PRODUCTS_INDEX });
        this.logger.log(`Elasticsearch index '${PRODUCTS_INDEX}' dropped for recreation`);
      }

      await this.esClient.indices.create({
        index: PRODUCTS_INDEX,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            // Use standard analyzer: no French stemming, no French stop words.
            // Product names are often technical terms (SOC, EDR, XDR, ...) that
            // the French stemmer would mangle. 'standard' simply lowercases and
            // tokenises on whitespace/punctuation, making prefix and fuzzy queries
            // fully predictable.
            nom: { type: 'text', analyzer: 'standard' },
            description_courte: { type: 'text', analyzer: 'standard' },
            description_longue: { type: 'text', analyzer: 'standard' },
            tags: { type: 'text', analyzer: 'standard' },
            keywords: { type: 'text', analyzer: 'standard' },
            meta_description: { type: 'text', analyzer: 'standard' },
            categorie: { type: 'keyword' },
            type: { type: 'keyword' },
            statut: { type: 'keyword' },
            slug: { type: 'keyword' },
            prix: { type: 'double' },
            prix_mensuel: { type: 'double' },
          },
        },
      });

      this.logger.log(`Elasticsearch index '${PRODUCTS_INDEX}' created`);
    } catch (err) {
      this.logger.warn(`Could not ensure Elasticsearch index: ${(err as Error).message}`);
    }
  }

  async reindexAll(): Promise<void> {
    try {
      // Drop & recreate the index so deleted products don't linger in ES
      await this.ensureIndex();

      const products = await this.productRepository.findAllPublished();
      if (products.length === 0) return;

      const operations = products.flatMap((p) => [
        { index: { _index: PRODUCTS_INDEX, _id: p.id } },
        {
          id: p.id,
          nom: p.nom,
          description_courte: p.description_courte,
          description_longue: p.description_longue ?? '',
          tags: Array.isArray(p.tags) ? p.tags.join(' ') : '',
          keywords: p.keywords ?? '',
          meta_description: p.meta_description ?? '',
          categorie: p.categorie,
          type: p.type,
          statut: p.statut,
          slug: p.slug,
          prix: p.prix ?? null,
          prix_mensuel: p.prix_mensuel ?? null,
        },
      ]);

      await this.esClient.bulk({ operations, refresh: true });
      this.logger.log(`Reindexed ${products.length} products into Elasticsearch`);
    } catch (err) {
      this.logger.warn(`Could not reindex products: ${(err as Error).message}`);
    }
  }

  async indexProduct(entity: ProductEntity): Promise<void> {
    try {
      await this.esClient.index({
        index: PRODUCTS_INDEX,
        id: entity.id,
        document: {
          id: entity.id,
          nom: entity.nom,
          description_courte: entity.description_courte,
          description_longue: entity.description_longue ?? '',
          tags: Array.isArray(entity.tags) ? entity.tags.join(' ') : '',
          keywords: entity.keywords ?? '',
          meta_description: entity.meta_description ?? '',
          categorie: entity.categorie,
          type: entity.type,
          statut: entity.statut,
          slug: entity.slug,
          prix: entity.prix ?? null,
          prix_mensuel: entity.prix_mensuel ?? null,
        },
      });
    } catch (err) {
      this.logger.warn(`Could not index product ${entity.id}: ${(err as Error).message}`);
    }
  }

  async removeProduct(id: string): Promise<void> {
    try {
      await this.esClient.delete({ index: PRODUCTS_INDEX, id });
    } catch (err) {
      this.logger.warn(`Could not remove product ${id} from index: ${(err as Error).message}`);
    }
  }

  /**
   * Search products by keyword with optional filters.
   * Returns ordered list of matching IDs, or null if Elasticsearch is unavailable.
   */
  async search(
    q: string,
    filters?: { categorie?: string; type?: string },
  ): Promise<string[] | null> {
    try {
      const filter: object[] = [{ term: { statut: ProductStatus.PUBLISHED } }];

      if (filters?.categorie) {
        filter.push({ term: { categorie: filters.categorie } });
      }

      if (filters?.type) {
        filter.push({ term: { type: filters.type } });
      }

      const searchFields = [
        'nom^3',
        'description_courte^2',
        'tags^2',
        'keywords^2',
        'description_longue',
        'meta_description',
      ];

      let queryClause: object;

      if (q && q.trim()) {
        const term = q.trim();
        // Combine prefix matching (handles partial input like "tes" → "test")
        // and fuzzy matching (handles typos like "tset" → "test")
        queryClause = {
          bool: {
            should: [
              {
                multi_match: {
                  query: term,
                  fields: searchFields,
                  type: 'phrase_prefix',
                  boost: 2,
                },
              },
              {
                multi_match: {
                  query: term,
                  fields: searchFields,
                  fuzziness: 'AUTO',
                  operator: 'or',
                },
              },
            ],
            minimum_should_match: 1,
          },
        };
      } else {
        queryClause = { match_all: {} };
      }

      const response = await this.esClient.search({
        index: PRODUCTS_INDEX,
        query: {
          bool: {
            must: [queryClause],
            filter,
          },
        },
        size: 200,
      });

      return response.hits.hits.map((hit) => hit._id);
    } catch (err) {
      this.logger.warn(`Elasticsearch search failed (falling back to SQL): ${(err as Error).message}`);
      return null;
    }
  }
}

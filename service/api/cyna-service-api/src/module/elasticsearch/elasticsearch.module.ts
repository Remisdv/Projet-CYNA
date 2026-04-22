import { Module } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

export const ELASTICSEARCH_CLIENT = 'ELASTICSEARCH_CLIENT';

const elasticsearchProvider = {
  provide: ELASTICSEARCH_CLIENT,
  useFactory: () => {
    return new Client({
      node: process.env.ELASTICSEARCH_URL ?? 'http://cyna-elasticsearch:9200',
    });
  },
};

@Module({
  providers: [elasticsearchProvider],
  exports: [elasticsearchProvider],
})
export class ElasticsearchClientModule {}

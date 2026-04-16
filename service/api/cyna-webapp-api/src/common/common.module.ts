import { Module, Global } from '@nestjs/common';
import { HttpClientService } from './services/http-client.service';

@Global()
@Module({
    providers: [HttpClientService],
    exports: [HttpClientService],
})
export class CommonModule { }

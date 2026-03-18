import { Controller, Get } from "@nestjs/common";
import { TextePromotionnelService } from "src/service/TextePromotionnel/TextePromotionnel.service";

@Controller('promotionnel')
export class TextePromotionnelController {
    constructor(private readonly service: TextePromotionnelService) {}

    @Get('active')
    getActive() {
        return this.service.findActive();
    }
}
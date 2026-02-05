import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'X-Request-Id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Utilise l'ID existant ou en génère un nouveau
    const requestId =
      (req.headers[REQUEST_ID_HEADER.toLowerCase()] as string) || randomUUID();

    // Ajoute l'ID à la requête pour utilisation dans les logs/services
    (req as any).requestId = requestId;

    // Ajoute l'ID dans la réponse pour traçabilité côté client
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}

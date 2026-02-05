import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // X-Content-Type-Options: Empêche le sniffing MIME
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options: Protection contre le clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection: Protection XSS (navigateurs legacy)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict-Transport-Security: Force HTTPS
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    // X-Download-Options: Empêche IE d'exécuter les téléchargements
    res.setHeader('X-Download-Options', 'noopen');

    // X-Permitted-Cross-Domain-Policies: Contrôle Adobe Flash/PDF
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // Referrer-Policy: Contrôle les informations envoyées dans le header Referer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content-Security-Policy: Politique de sécurité du contenu
    const csp = process.env.CSP_POLICY || "default-src 'self'";
    res.setHeader('Content-Security-Policy', csp);

    next();
  }
}

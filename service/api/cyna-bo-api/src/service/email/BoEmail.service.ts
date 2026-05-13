import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class BoEmailService {
    private readonly logger = new Logger(BoEmailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '1025', 10),
            secure: false,
            // Timeouts courts pour éviter que le login ne fige si SMTP est indispo.
            connectionTimeout: 3000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
        });
    }

    async sendTwoFactorCode(to: string, code: string): Promise<void> {
        // En dev on log toujours le code pour pouvoir se connecter même si SMTP/MailHog
        // est en rade. À retirer en prod (ou conditionner à NODE_ENV !== 'production').
        this.logger.log(`[2FA] Code pour ${to} : ${code}`);

        try {
            await this.transporter.sendMail({
                from: '"CYNA Admin" <noreply@cyna.com>',
                to,
                subject: 'CYNA - Code de connexion administrateur',
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Code de connexion</h2>
          <p>Votre code de vérification à deux facteurs est :</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; font-family: monospace;
                      background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center;
                      color: #1e40af; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #64748b;">Ce code est valide <strong>5 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 12px;">
            Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
          </p>
        </div>
      `,
            });
        } catch (err: any) {
            // On n'empêche PAS le login : le code est valide en base, l'admin peut
            // le lire dans les logs ou MailHog dès qu'il sera up.
            this.logger.warn(`Echec envoi email 2FA à ${to} : ${err?.message ?? err}`);
        }
    }
}

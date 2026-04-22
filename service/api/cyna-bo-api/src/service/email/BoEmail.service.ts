import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class BoEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: false,
    });
  }

  async sendTwoFactorCode(to: string, code: string): Promise<void> {
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
  }
}

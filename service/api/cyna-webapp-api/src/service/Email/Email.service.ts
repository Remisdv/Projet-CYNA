import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: false,
    });
  }

  async sendMail(to: string, subject: string, html: string, attachments?: any[]): Promise<void> {
    await this.transporter.sendMail({
      from: '"CYNA" <noreply@cyna.com>',
      to,
      subject,
      html,
      attachments,
    });
  }

  async send2FACode(to: string, firstName: string, code: string): Promise<void> {
    await this.sendMail(
      to,
      'CYNA - Votre code de vérification',
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e293b;">Bonjour ${firstName},</h2>
          <p>Voici votre code de vérification à deux facteurs :</p>
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
    );
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await this.sendMail(
      to,
      'CYNA - Réinitialisation de mot de passe',
      `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous (valide 1h) :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    );
  }

  async sendOrderConfirmation(to: string, order: { ref: string; amount: number; items: any[] }): Promise<void> {
    const itemsHtml = order.items
      .map((i) => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${i.subtotal.toFixed(2)} €</td></tr>`)
      .join('');

    await this.sendMail(
      to,
      `CYNA - Confirmation de commande ${order.ref}`,
      `
        <h2>Commande confirmée</h2>
        <p>Merci pour votre commande <strong>${order.ref}</strong>.</p>
        <table border="1" cellpadding="8" cellspacing="0">
          <thead><tr><th>Produit</th><th>Qté</th><th>Sous-total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total : ${order.amount.toFixed(2)} €</strong></p>
      `,
    );
  }

  async sendContactConfirmation(to: string, name: string): Promise<void> {
    await this.sendMail(
      to,
      'CYNA - Nous avons bien reçu votre message',
      `
        <h2>Merci ${name} !</h2>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p>L'équipe CYNA</p>
      `,
    );
  }

  async sendContactNotification(contactDest: string, data: { name: string; email: string; subject: string; message: string }): Promise<void> {
    await this.sendMail(
      contactDest,
      `[Contact CYNA] ${data.subject}`,
      `
        <h2>Nouveau message de contact</h2>
        <p><strong>De :</strong> ${data.name} (${data.email})</p>
        <p><strong>Sujet :</strong> ${data.subject}</p>
        <hr/>
        <p>${data.message.replace(/\n/g, '<br/>')}</p>
      `,
    );
  }

  async sendServiceCredentials(
    to: string,
    data: { ref: string; serviceName: string; credentials: { login: string; password: string; url: string } },
  ): Promise<void> {
    await this.sendMail(
      to,
      `CYNA - Vos identifiants pour ${data.serviceName}`,
      `
        <h2>Accès à votre service</h2>
        <p>Merci pour votre commande <strong>${data.ref}</strong>.</p>
        <p>Voici vos identifiants d'accès pour <strong>${data.serviceName}</strong> :</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <tr><td><strong>URL</strong></td><td><a href="${data.credentials.url}">${data.credentials.url}</a></td></tr>
          <tr><td><strong>Identifiant</strong></td><td><code>${data.credentials.login}</code></td></tr>
          <tr><td><strong>Mot de passe</strong></td><td><code>${data.credentials.password}</code></td></tr>
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 16px;">
          Nous vous recommandons de changer votre mot de passe dès la première connexion.
        </p>
        <p>L'équipe CYNA</p>
      `,
    );
  }

  async sendShippingUpdate(
    to: string,
    data: { ref: string; trackingNumber?: string; status: string },
  ): Promise<void> {
    const trackingHtml = data.trackingNumber
      ? `<p>Numéro de suivi : <strong>${data.trackingNumber}</strong></p>`
      : '';

    await this.sendMail(
      to,
      `CYNA - Mise à jour livraison ${data.ref}`,
      `
        <h2>Mise à jour de votre commande</h2>
        <p>Votre commande <strong>${data.ref}</strong> a été mise à jour :</p>
        <p>Nouveau statut : <strong>${data.status}</strong></p>
        ${trackingHtml}
        <p>L'équipe CYNA</p>
      `,
    );
  }

  async sendOrderConfirmationWithInvoice(
    to: string,
    order: { ref: string; amount: number; items: any[] },
    invoicePdf: Buffer,
  ): Promise<void> {
    const itemsHtml = order.items
      .map((i) => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${i.subtotal.toFixed(2)} €</td></tr>`)
      .join('');

    await this.sendMail(
      to,
      `CYNA - Confirmation de commande ${order.ref}`,
      `
        <h2>Merci pour votre commande !</h2>
        <p>Votre commande <strong>${order.ref}</strong> a bien été confirmée.</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
          <thead><tr><th>Produit</th><th>Qté</th><th>Sous-total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total : ${order.amount.toFixed(2)} €</strong></p>
        <p>Vous trouverez votre facture en pièce jointe.</p>
        <p>L'équipe CYNA</p>
      `,
      [
        {
          filename: `facture-${order.ref}.pdf`,
          content: invoicePdf,
          contentType: 'application/pdf',
        },
      ],
    );
  }
}

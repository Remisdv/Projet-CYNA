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

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"CYNA" <noreply@cyna.com>',
      to,
      subject,
      html,
    });
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
}

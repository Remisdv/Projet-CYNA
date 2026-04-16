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

    private async send(to: string, subject: string, html: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: '"CYNA" <noreply@cyna.com>',
                to,
                subject,
                html,
            });
        } catch (err) {
            console.error(`Failed to send email to ${to}:`, err?.message);
        }
    }

    async sendOrderStatusUpdate(
        to: string,
        order: { ref: string; status: string; trackingNumber?: string },
    ): Promise<void> {
        const statusLabels: Record<string, string> = {
            pending: 'En attente de traitement',
            confirmed: 'Confirmée',
            shipped: 'Expédiée',
            delivered: 'Livrée',
            cancelled: 'Annulée',
        };
        const label = statusLabels[order.status] || order.status;

        const trackingHtml = order.trackingNumber
            ? `<p>📦 Numéro de suivi : <strong>${order.trackingNumber}</strong></p>`
            : '';

        const statusColor: Record<string, string> = {
            confirmed: '#22c55e',
            shipped: '#3b82f6',
            delivered: '#16a34a',
            cancelled: '#ef4444',
            pending: '#f59e0b',
        };

        await this.send(
            to,
            `CYNA - Commande ${order.ref} : ${label}`,
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">CYNA</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2>Mise à jour de votre commande</h2>
            <p>Bonjour,</p>
            <p>Votre commande <strong>${order.ref}</strong> a été mise à jour :</p>
            <div style="background: white; border-left: 4px solid ${statusColor[order.status] || '#6b7280'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusColor[order.status] || '#6b7280'};">
                ${label}
              </p>
            </div>
            ${trackingHtml}
            ${order.status === 'cancelled' ? '<p>Si vous avez des questions concernant cette annulation, n\'hésitez pas à nous contacter.</p>' : ''}
            ${order.status === 'delivered' ? '<p>Nous espérons que vous êtes satisfait(e) de votre achat !</p>' : ''}
            <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par CYNA. Merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `,
        );
    }

    async sendPaymentStatusUpdate(
        to: string,
        order: { ref: string; paymentStatus: string; amount?: number },
    ): Promise<void> {
        const labels: Record<string, string> = {
            pending: 'En attente',
            paid: 'Confirmé',
            refunded: 'Remboursé',
            failed: 'Échoué',
        };
        const label = labels[order.paymentStatus] || order.paymentStatus;

        const amountHtml = order.amount
            ? `<p>Montant : <strong>${Number(order.amount).toFixed(2)} €</strong></p>`
            : '';

        await this.send(
            to,
            `CYNA - Paiement ${label.toLowerCase()} pour ${order.ref}`,
            `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">CYNA</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2>Mise à jour de paiement</h2>
            <p>Bonjour,</p>
            <p>Le paiement de votre commande <strong>${order.ref}</strong> est désormais : <strong>${label}</strong></p>
            ${amountHtml}
            ${order.paymentStatus === 'refunded' ? '<p>Le remboursement sera crédité sur votre moyen de paiement sous 5 à 10 jours ouvrés.</p>' : ''}
            ${order.paymentStatus === 'failed' ? '<p>Veuillez vérifier votre moyen de paiement ou nous contacter pour assistance.</p>' : ''}
            <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par CYNA.
            </p>
          </div>
        </div>
      `,
        );
    }
}


import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import {
    OrderEntity,
    OrderStatus,
    PaymentStatus,
} from '../entity/order/order.entity';
import { v4 as uuidv4 } from 'uuid';

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

async function seed() {
    const app = await NestFactory.create(AppModule);
    const dataSource = app.get(DataSource);
    const orderRepo = dataSource.getRepository(OrderEntity);

    try {
        console.log('Starting Service-API Orders seed (BO stats)...');

        // Idempotent: delete then reinsert
        await orderRepo.query('DELETE FROM orders');

        const orders = [
            {
                ref: 'CMD-2026-001',
                clientEmail: 'lucas@techcorp.fr',
                clientFirstName: 'Lucas',
                clientLastName: 'Martin',
                amount: 4980,
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_tech001',
                billingAddress: { street: '12 rue de la Paix', city: 'Paris', postalCode: '75001', country: 'FR' },
                items: [
                    { productName: 'Fortinet FortiGate 60F', productType: 'produit', quantity: 2, unitPrice: 890, subtotal: 1780 },
                    { productName: 'YubiKey 5C NFC x10', productType: 'produit', quantity: 10, unitPrice: 65, subtotal: 650 },
                    { productName: 'Formation ISO 27001', productType: 'produit', quantity: 3, unitPrice: 850, subtotal: 2550 },
                ],
                createdAt: daysAgo(92),
            },
            {
                ref: 'CMD-2026-002',
                clientEmail: 'remi.dupont@fintech.fr',
                clientFirstName: 'Rémi',
                clientLastName: 'Dupont',
                amount: 12450,
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_fin002',
                billingAddress: { street: '45 avenue Montaigne', city: 'Paris', postalCode: '75008', country: 'FR' },
                items: [
                    { productName: 'Pentest externe', productType: 'produit', quantity: 1, unitPrice: 2900, subtotal: 2900 },
                    { productName: 'Audit de conformité RGPD', productType: 'produit', quantity: 1, unitPrice: 1490, subtotal: 1490 },
                    { productName: 'Thales Luna HSM', productType: 'produit', quantity: 2, unitPrice: 3500, subtotal: 7000 },
                    { productName: 'Splunk Enterprise (1 an)', productType: 'produit', quantity: 1, unitPrice: 1060, subtotal: 1060 },
                ],
                createdAt: daysAgo(85),
            },
            {
                ref: 'CMD-2026-003',
                clientEmail: 'claire.bernard@sante.fr',
                clientFirstName: 'Claire',
                clientLastName: 'Bernard',
                amount: 2390,
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_san003',
                billingAddress: { street: '8 boulevard de l\'Hôpital', city: 'Lyon', postalCode: '69001', country: 'FR' },
                items: [
                    { productName: 'Simulation de phishing (500 cibles)', productType: 'produit', quantity: 1, unitPrice: 490, subtotal: 490 },
                    { productName: 'Formation sensibilisation cybersécurité', productType: 'produit', quantity: 76, unitPrice: 25, subtotal: 1900 },
                ],
                createdAt: daysAgo(78),
            },
            {
                ref: 'CMD-2026-004',
                clientEmail: 'thomas.lefebvre@industrie.fr',
                clientFirstName: 'Thomas',
                clientLastName: 'Lefebvre',
                amount: 8900,
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_ind004',
                billingAddress: { street: '22 rue Galilée', city: 'Bordeaux', postalCode: '33000', country: 'FR' },
                items: [
                    { productName: 'Exercice Red Team (3 jours)', productType: 'produit', quantity: 1, unitPrice: 8900, subtotal: 8900 },
                ],
                createdAt: daysAgo(71),
            },
            {
                ref: 'CMD-2026-005',
                clientEmail: 'marie.petit@consulting.fr',
                clientFirstName: 'Marie',
                clientLastName: 'Petit',
                amount: 5750,
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_con005',
                billingAddress: { street: '3 rue du Commerce', city: 'Nantes', postalCode: '44000', country: 'FR' },
                items: [
                    { productName: 'BeyondTrust Password Safe (1 an)', productType: 'produit', quantity: 1, unitPrice: 2200, subtotal: 2200 },
                    { productName: 'Okta Identity Engine (50 users)', productType: 'produit', quantity: 1, unitPrice: 750, subtotal: 750 },
                    { productName: 'Déploiement Microsoft 365 Security', productType: 'produit', quantity: 1, unitPrice: 1490, subtotal: 1490 },
                    { productName: 'ESET Endpoint Security (10 postes)', productType: 'produit', quantity: 1, unitPrice: 180, subtotal: 180 },
                    { productName: 'YubiKey 5 NFC', productType: 'produit', quantity: 20, unitPrice: 55, subtotal: 1100 },
                ],
                createdAt: daysAgo(64),
            },
            {
                ref: 'CMD-2026-006',
                clientEmail: 'julien.moreau@startup.fr',
                clientFirstName: 'Julien',
                clientLastName: 'Moreau',
                amount: 1490,
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_sta006',
                billingAddress: { street: '15 rue Oberkampf', city: 'Paris', postalCode: '75011', country: 'FR' },
                items: [
                    { productName: 'Audit de conformité RGPD', productType: 'produit', quantity: 1, unitPrice: 1490, subtotal: 1490 },
                ],
                createdAt: daysAgo(57),
            },
            {
                ref: 'CMD-2026-007',
                clientEmail: 'anne.girard@banque.fr',
                clientFirstName: 'Anne',
                clientLastName: 'Girard',
                amount: 24800,
                status: OrderStatus.SHIPPED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_ban007',
                billingAddress: { street: '1 place de la Bourse', city: 'Paris', postalCode: '75002', country: 'FR' },
                items: [
                    { productName: 'Pentest interne', productType: 'produit', quantity: 1, unitPrice: 2900, subtotal: 2900 },
                    { productName: 'Audit de conformité PCI-DSS', productType: 'produit', quantity: 1, unitPrice: 3200, subtotal: 3200 },
                    { productName: 'Thales Luna HSM', productType: 'produit', quantity: 4, unitPrice: 3500, subtotal: 14000 },
                    { productName: 'Imperva WAF Cloud (1 an)', productType: 'produit', quantity: 1, unitPrice: 1800, subtotal: 1800 },
                    { productName: 'DPO externalisé (1 an)', productType: 'produit', quantity: 1, unitPrice: 2900, subtotal: 2900 },
                ],
                createdAt: daysAgo(49),
            },
            {
                ref: 'CMD-2026-008',
                clientEmail: 'pierre.dubois@assurance.fr',
                clientFirstName: 'Pierre',
                clientLastName: 'Dubois',
                amount: 3900,
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_ass008',
                billingAddress: { street: '7 rue de Rivoli', city: 'Paris', postalCode: '75004', country: 'FR' },
                items: [
                    { productName: 'Accompagnement certification ISO 27001', productType: 'produit', quantity: 1, unitPrice: 3900, subtotal: 3900 },
                ],
                createdAt: daysAgo(42),
            },
            {
                ref: 'CMD-2026-009',
                clientEmail: 'sophie.renard@media.fr',
                clientFirstName: 'Sophie',
                clientLastName: 'Renard',
                amount: 690,
                status: OrderStatus.DELIVERED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_med009',
                billingAddress: { street: '28 rue des Abbesses', city: 'Paris', postalCode: '75018', country: 'FR' },
                items: [
                    { productName: 'Atelier Threat Hunting (1 jour)', productType: 'produit', quantity: 1, unitPrice: 690, subtotal: 690 },
                ],
                createdAt: daysAgo(35),
            },
            {
                ref: 'CMD-2026-010',
                clientEmail: 'nicolas.blanc@energie.fr',
                clientFirstName: 'Nicolas',
                clientLastName: 'Blanc',
                amount: 15690,
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_ene010',
                billingAddress: { street: '5 avenue de l\'Opéra', city: 'Paris', postalCode: '75001', country: 'FR' },
                items: [
                    { productName: 'Forensics & Incident Response', productType: 'produit', quantity: 1, unitPrice: 4900, subtotal: 4900 },
                    { productName: 'Intégration SIEM (clé en main)', productType: 'produit', quantity: 1, unitPrice: 3900, subtotal: 3900 },
                    { productName: 'Splunk Enterprise (1 an, 10 GB/j)', productType: 'produit', quantity: 1, unitPrice: 2400, subtotal: 2400 },
                    { productName: 'Cisco Firepower 1010', productType: 'produit', quantity: 2, unitPrice: 1200, subtotal: 2400 },
                    { productName: 'Hotline sécurité 24/7 (1 an)', productType: 'produit', quantity: 1, unitPrice: 1090, subtotal: 1090 },
                    { productName: 'Veeam Backup Enterprise (1 serveur)', productType: 'produit', quantity: 1, unitPrice: 890, subtotal: 890 },
                    { productName: 'Pack 5 YubiKeys 5C NFC', productType: 'produit', quantity: 2, unitPrice: 285, subtotal: 570 },
                ],
                createdAt: daysAgo(28),
            },
            {
                ref: 'CMD-2026-011',
                clientEmail: 'isabelle.henry@retail.fr',
                clientFirstName: 'Isabelle',
                clientLastName: 'Henry',
                amount: 960,
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                paymentRef: null,
                billingAddress: { street: '14 rue du Faubourg Saint-Antoine', city: 'Paris', postalCode: '75012', country: 'FR' },
                items: [
                    { productName: 'Formation RGPD & DPO (2 jours)', productType: 'produit', quantity: 1, unitPrice: 890, subtotal: 890 },
                    { productName: 'Sensibilisation cybersécurité (e-learning, 1 an)', productType: 'produit', quantity: 3, unitPrice: 25, subtotal: 75 },
                ],
                createdAt: daysAgo(21),
            },
            {
                ref: 'CMD-2026-012',
                clientEmail: 'francois.lemaire@pharma.fr',
                clientFirstName: 'François',
                clientLastName: 'Lemaire',
                amount: 7550,
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_phar012',
                billingAddress: { street: '33 boulevard Pasteur', city: 'Paris', postalCode: '75015', country: 'FR' },
                items: [
                    { productName: 'Plan Continuité / Reprise d\'Activité', productType: 'produit', quantity: 1, unitPrice: 2900, subtotal: 2900 },
                    { productName: 'Préparation certification CISM (5 jours)', productType: 'produit', quantity: 2, unitPrice: 2400, subtotal: 4800 },
                ],
                createdAt: daysAgo(17),
            },
            {
                ref: 'CMD-2026-013',
                clientEmail: 'nathalie.fontaine@telecom.fr',
                clientFirstName: 'Nathalie',
                clientLastName: 'Fontaine',
                amount: 2400,
                status: OrderStatus.CANCELLED,
                paymentStatus: PaymentStatus.REFUNDED,
                paymentRef: 'pi_tel013',
                billingAddress: { street: '90 rue de la Tour', city: 'Paris', postalCode: '75016', country: 'FR' },
                items: [
                    { productName: 'Splunk Enterprise (1 an, 10 GB/j)', productType: 'produit', quantity: 1, unitPrice: 2400, subtotal: 2400 },
                ],
                createdAt: daysAgo(12),
            },
            {
                ref: 'CMD-2026-014',
                clientEmail: 'antoine.roussel@logistique.fr',
                clientFirstName: 'Antoine',
                clientLastName: 'Roussel',
                amount: 4280,
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
                paymentRef: 'pi_log014',
                billingAddress: { street: '2 rue du Port', city: 'Marseille', postalCode: '13001', country: 'FR' },
                items: [
                    { productName: 'Fortinet FortiGate 60F', productType: 'produit', quantity: 2, unitPrice: 890, subtotal: 1780 },
                    { productName: 'Veeam Backup Enterprise (1 serveur)', productType: 'produit', quantity: 1, unitPrice: 890, subtotal: 890 },
                    { productName: 'Proofpoint Email Security (50 boîtes)', productType: 'produit', quantity: 1, unitPrice: 480, subtotal: 480 },
                    { productName: 'Dashlane Business (10 users)', productType: 'produit', quantity: 1, unitPrice: 120, subtotal: 120 },
                    { productName: 'Formation Pentest & Ethical Hacking (4 jours)', productType: 'produit', quantity: 1, unitPrice: 1990, subtotal: 1990 },
                ],
                createdAt: daysAgo(7),
            },
            {
                ref: 'CMD-2026-015',
                clientEmail: 'camille.lambert@juridique.fr',
                clientFirstName: 'Camille',
                clientLastName: 'Lambert',
                amount: 9600,
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                paymentRef: null,
                billingAddress: { street: '17 avenue des Champs-Élysées', city: 'Paris', postalCode: '75008', country: 'FR' },
                items: [
                    { productName: 'DPO externalisé (1 an)', productType: 'produit', quantity: 2, unitPrice: 4800, subtotal: 9600 },
                ],
                createdAt: daysAgo(2),
            },
        ];

        for (const orderData of orders) {
            const order = new OrderEntity();
            order.id = uuidv4();
            order.ref = orderData.ref;
            order.clientEmail = orderData.clientEmail;
            order.clientFirstName = orderData.clientFirstName;
            order.clientLastName = orderData.clientLastName;
            order.amount = orderData.amount;
            order.status = orderData.status;
            order.paymentStatus = orderData.paymentStatus;
            order.paymentRef = orderData.paymentRef;
            order.billingAddress = orderData.billingAddress;
            order.items = orderData.items;
            order.notes = null;
            order.history = [
                { action: 'created', date: orderData.createdAt.toISOString(), by: 'system' },
            ];
            order.credentials = null;
            order.trackingNumber = null;
            order.shippedAt = null;
            // Override createdAt using raw query after save
            await orderRepo.save(order);
            await orderRepo.query(
                `UPDATE orders SET "createdAt" = $1 WHERE id = $2`,
                [orderData.createdAt, order.id],
            );
            console.log(`Created order: ${orderData.ref} (${orderData.amount}€)`);
        }

        const total = orders.reduce((sum, o) => sum + o.amount, 0);
        const paid = orders.filter((o) => o.paymentStatus === PaymentStatus.PAID);
        console.log(`\nBO Orders seed completed!`);
        console.log(`Total: ${orders.length} orders, ${paid.length} paid, total revenue: ${total}€`);
    } catch (error) {
        console.error('Error seeding BO orders:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed();

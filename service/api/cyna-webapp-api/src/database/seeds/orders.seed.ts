import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { WebappUser } from '../entity/WebappUser/WebappUser.entity';
import { CustomerOrder, OrderStatus, PaymentStatus } from '../entity/Order/CustomerOrder.entity';
import { WebappSubscription, SubscriptionPlan, SubscriptionStatus } from '../entity/Subscription/WebappSubscription.entity';
import { v4 as uuidv4 } from 'uuid';

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function daysFromNow(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
}

async function seed() {
    const app = await NestFactory.create(AppModule);
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(WebappUser);
    const orderRepo = dataSource.getRepository(CustomerOrder);
    const subRepo = dataSource.getRepository(WebappSubscription);

    try {
        console.log('Starting Webapp Orders + Subscriptions seed...');

        // Find webapp users
        const lucas = await userRepo.findOneBy({ email: 'lucas@cyna.fr' });
        const titouan = await userRepo.findOneBy({ email: 'titouan@cyna.fr' });
        const remi = await userRepo.findOneBy({ email: 'remi@cyna.fr' });

        if (!lucas || !titouan || !remi) {
            throw new Error('Webapp users not found. Run seed:users first.');
        }

        // Find service products from products table (raw query)
        const serviceProducts = await dataSource.query(
            `SELECT id, nom, prix_mensuel, prix_annuel FROM products WHERE type = 'service' AND statut = 'publié' LIMIT 6`
        );
        const physicalProducts = await dataSource.query(
            `SELECT id, nom, prix FROM products WHERE type = 'produit' AND statut = 'publié' LIMIT 6`
        );

        const svc1 = serviceProducts[0] ?? { id: uuidv4(), nom: 'EDR Enterprise', prix_mensuel: 99, prix_annuel: 990 };
        const svc2 = serviceProducts[1] ?? { id: uuidv4(), nom: 'SOC 24/7 Managed', prix_mensuel: 249, prix_annuel: 2490 };
        const svc3 = serviceProducts[2] ?? { id: uuidv4(), nom: 'Threat Intelligence Premium', prix_mensuel: 99, prix_annuel: 990 };
        const prod1 = physicalProducts[0] ?? { id: uuidv4(), nom: 'YubiKey 5C NFC', prix: 65 };
        const prod2 = physicalProducts[1] ?? { id: uuidv4(), nom: 'Fortinet FortiGate 60F', prix: 890 };
        const prod3 = physicalProducts[2] ?? { id: uuidv4(), nom: 'Formation ISO 27001', prix: 1800 };

        // Clean up existing orders/subscriptions for these users (by userId AND by ref)
        const userIds = [lucas.id, titouan.id, remi.id];
        await subRepo.query(`DELETE FROM webapp_subscriptions WHERE "userId" = ANY($1)`, [userIds]);
        await orderRepo.query(`DELETE FROM customer_orders WHERE "userId" = ANY($1)`, [userIds]);
        // Also clean by ref in case users were re-seeded with different UUIDs
        await orderRepo.query(`DELETE FROM customer_orders WHERE ref IN ('WEB-2026-L001','WEB-2026-T001','WEB-2026-R001')`);

        // ──── Lucas — commande physique + abonnement EDR ─────────────────
        const lucasOrder = new CustomerOrder();
        lucasOrder.id = uuidv4();
        lucasOrder.ref = 'WEB-2026-L001';
        lucasOrder.userId = lucas.id;
        lucasOrder.items = [
            { productId: prod1.id, productName: prod1.nom, productType: 'produit', quantity: 2, unitPrice: Number(prod1.prix), subtotal: Number(prod1.prix) * 2 },
            { productId: prod2.id, productName: prod2.nom, productType: 'produit', quantity: 1, unitPrice: Number(prod2.prix), subtotal: Number(prod2.prix) },
        ];
        lucasOrder.amount = Number(prod1.prix) * 2 + Number(prod2.prix);
        lucasOrder.status = OrderStatus.DELIVERED;
        lucasOrder.paymentStatus = PaymentStatus.PAID;
        lucasOrder.paymentIntentId = 'pi_mock_lucas_001';
        lucasOrder.billingAddress = lucas.billingAddress;
        lucasOrder.shippingAddress = lucas.shippingAddress;
        lucasOrder.notes = null;
        lucasOrder.trackingNumber = 'TRK-LUCAS-2026';
        lucasOrder.shippedAt = daysAgo(5);
        await orderRepo.save(lucasOrder);
        await orderRepo.query(`UPDATE customer_orders SET "createdAt" = $1 WHERE id = $2`, [daysAgo(14), lucasOrder.id]);

        const lucasSub = new WebappSubscription();
        lucasSub.id = uuidv4();
        lucasSub.userId = lucas.id;
        lucasSub.productId = svc1.id;
        lucasSub.productName = svc1.nom;
        lucasSub.planType = SubscriptionPlan.MENSUEL;
        lucasSub.status = SubscriptionStatus.ACTIVE;
        lucasSub.price = Number(svc1.prix_mensuel);
        lucasSub.stripeSubscriptionId = 'sub_mock_lucas_edr';
        lucasSub.startDate = daysAgo(30);
        lucasSub.renewalDate = daysFromNow(0); // Due today (next month from start)
        await subRepo.save(lucasSub);
        console.log(`Created order + subscription for: lucas@cyna.fr`);

        // ──── Titouan — commande physique + abonnement SOC 24/7 ──────────
        const titouanOrder = new CustomerOrder();
        titouanOrder.id = uuidv4();
        titouanOrder.ref = 'WEB-2026-T001';
        titouanOrder.userId = titouan.id;
        titouanOrder.items = [
            { productId: prod3.id, productName: prod3.nom, productType: 'produit', quantity: 1, unitPrice: Number(prod3.prix), subtotal: Number(prod3.prix) },
        ];
        titouanOrder.amount = Number(prod3.prix);
        titouanOrder.status = OrderStatus.DELIVERED;
        titouanOrder.paymentStatus = PaymentStatus.PAID;
        titouanOrder.paymentIntentId = 'pi_mock_titouan_001';
        titouanOrder.billingAddress = titouan.billingAddress;
        titouanOrder.shippingAddress = titouan.shippingAddress;
        titouanOrder.notes = 'Livraison express demandée';
        titouanOrder.trackingNumber = 'TRK-TITOUAN-2026';
        titouanOrder.shippedAt = daysAgo(8);
        await orderRepo.save(titouanOrder);
        await orderRepo.query(`UPDATE customer_orders SET "createdAt" = $1 WHERE id = $2`, [daysAgo(20), titouanOrder.id]);

        const titouanSub = new WebappSubscription();
        titouanSub.id = uuidv4();
        titouanSub.userId = titouan.id;
        titouanSub.productId = svc2.id;
        titouanSub.productName = svc2.nom;
        titouanSub.planType = SubscriptionPlan.ANNUEL;
        titouanSub.status = SubscriptionStatus.ACTIVE;
        titouanSub.price = Number(svc2.prix_annuel ?? svc2.prix_mensuel * 12);
        titouanSub.stripeSubscriptionId = 'sub_mock_titouan_soc';
        titouanSub.startDate = daysAgo(60);
        titouanSub.renewalDate = daysFromNow(305);
        await subRepo.save(titouanSub);
        console.log(`Created order + subscription for: titouan@cyna.fr`);

        // ──── Rémi — commande physique + abonnement Threat Intelligence ───
        const remiOrder = new CustomerOrder();
        remiOrder.id = uuidv4();
        remiOrder.ref = 'WEB-2026-R001';
        remiOrder.userId = remi.id;
        remiOrder.items = [
            { productId: prod1.id, productName: prod1.nom, productType: 'produit', quantity: 5, unitPrice: Number(prod1.prix), subtotal: Number(prod1.prix) * 5 },
            { productId: prod2.id, productName: prod2.nom, productType: 'produit', quantity: 1, unitPrice: Number(prod2.prix), subtotal: Number(prod2.prix) },
        ];
        remiOrder.amount = Number(prod1.prix) * 5 + Number(prod2.prix);
        remiOrder.status = OrderStatus.CONFIRMED;
        remiOrder.paymentStatus = PaymentStatus.PAID;
        remiOrder.paymentIntentId = 'pi_mock_remi_001';
        remiOrder.billingAddress = remi.billingAddress;
        remiOrder.shippingAddress = remi.shippingAddress;
        remiOrder.notes = null;
        remiOrder.trackingNumber = null;
        remiOrder.shippedAt = null;
        await orderRepo.save(remiOrder);
        await orderRepo.query(`UPDATE customer_orders SET "createdAt" = $1 WHERE id = $2`, [daysAgo(5), remiOrder.id]);

        const remiSub = new WebappSubscription();
        remiSub.id = uuidv4();
        remiSub.userId = remi.id;
        remiSub.productId = svc3.id;
        remiSub.productName = svc3.nom;
        remiSub.planType = SubscriptionPlan.MENSUEL;
        remiSub.status = SubscriptionStatus.ACTIVE;
        remiSub.price = Number(svc3.prix_mensuel);
        remiSub.stripeSubscriptionId = 'sub_mock_remi_ti';
        remiSub.startDate = daysAgo(15);
        remiSub.renewalDate = daysFromNow(15);
        await subRepo.save(remiSub);
        console.log(`Created order + subscription for: remi@cyna.fr`);

        console.log('\nWebapp Orders + Subscriptions seed completed!');
    } catch (error) {
        console.error('Error seeding webapp orders:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed();

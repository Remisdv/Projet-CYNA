import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { WebappUser, WebappUserStatus } from '../entity/WebappUser/WebappUser.entity';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
    const app = await NestFactory.create(AppModule);
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(WebappUser);

    try {
        console.log('Starting Webapp Users seed...');

        // Idempotent: delete by email then reinsert
        await userRepo.query(`DELETE FROM webapp_users WHERE email IN ('lucas@cyna.fr', 'titouan@cyna.fr', 'remi@cyna.fr')`);

        const passwordHash = hashPassword('Password123!');

        const usersData = [
            {
                email: 'lucas@cyna.fr',
                firstName: 'Lucas',
                lastName: 'Martin',
                phone: '+33 6 12 34 56 78',
                billingAddress: {
                    street: '12 rue de la Paix',
                    city: 'Paris',
                    postalCode: '75001',
                    country: 'FR',
                    company: 'TechCorp SAS',
                },
                shippingAddress: {
                    street: '12 rue de la Paix',
                    city: 'Paris',
                    postalCode: '75001',
                    country: 'FR',
                    company: 'TechCorp SAS',
                },
            },
            {
                email: 'titouan@cyna.fr',
                firstName: 'Titouan',
                lastName: 'Bernard',
                phone: '+33 6 98 76 54 32',
                billingAddress: {
                    street: '45 avenue Montaigne',
                    city: 'Paris',
                    postalCode: '75008',
                    country: 'FR',
                    company: 'Bernard Consulting',
                },
                shippingAddress: {
                    street: '45 avenue Montaigne',
                    city: 'Paris',
                    postalCode: '75008',
                    country: 'FR',
                    company: 'Bernard Consulting',
                },
            },
            {
                email: 'remi@cyna.fr',
                firstName: 'Rémi',
                lastName: 'Dupont',
                phone: '+33 6 55 44 33 22',
                billingAddress: {
                    street: '8 boulevard de la République',
                    city: 'Lyon',
                    postalCode: '69001',
                    country: 'FR',
                    company: 'Dupont Industries',
                },
                shippingAddress: {
                    street: '8 boulevard de la République',
                    city: 'Lyon',
                    postalCode: '69001',
                    country: 'FR',
                    company: 'Dupont Industries',
                },
            },
        ];

        for (const userData of usersData) {
            const user = new WebappUser();
            user.email = userData.email;
            user.firstName = userData.firstName;
            user.lastName = userData.lastName;
            user.phone = userData.phone;
            user.passwordHash = passwordHash;
            user.billingAddress = userData.billingAddress;
            user.shippingAddress = userData.shippingAddress;
            user.status = WebappUserStatus.ACTIVE;
            user.twoFactorEnabled = false;
            user.twoFactorCode = null;
            user.twoFactorCodeExpiry = null;
            user.totpSecret = null;
            user.totpEnabled = false;
            await userRepo.save(user);
            console.log(`Created webapp user: ${userData.email}`);
        }

        console.log('Webapp Users seed completed!');
    } catch (error) {
        console.error('Error seeding webapp users:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed();

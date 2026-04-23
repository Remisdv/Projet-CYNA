import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../entity/User/User.entity';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  try {
    console.log('Starting BO Users seed...');

    // Idempotent: truncate then reinsert
    await userRepository.query('DELETE FROM "user"');

    const usersData = [
      {
        email: 'admin@cyna.fr',
        firstName: 'Admin',
        lastName: 'CYNA',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'lucas@cyna.fr',
        firstName: 'Lucas',
        lastName: 'Martin',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'titouan@cyna.fr',
        firstName: 'Titouan',
        lastName: 'Bernard',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'remi@cyna.fr',
        firstName: 'Rémi',
        lastName: 'Dupont',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'user2@cyna.fr',
        firstName: 'Marie',
        lastName: 'Martin',
        role: UserRole.COMMERCIAL,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'user3@cyna.fr',
        firstName: 'Pierre',
        lastName: 'Bernard',
        role: UserRole.COMMERCIAL,
        status: UserStatus.INACTIVE,
      },
      {
        email: 'user4@cyna.fr',
        firstName: 'Sophie',
        lastName: 'Durand',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    ];

    const passwordHash = hashPassword('Password123!');

    for (const userData of usersData) {
      const user = new User();
      user.email = userData.email;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.role = userData.role;
      user.status = userData.status;
      user.passwordHash = passwordHash;
      await userRepository.save(user);
      console.log(`Created BO user: ${userData.email}`);
    }

    console.log('BO Users seed completed!');
  } catch (error) {
    console.error('Error seeding BO users:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepository } from 'typeorm';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../entity/User/User.entity';
import * as crypto from 'crypto';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  try {
    console.log('Starting Users seed...');

    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist. Skipping seed.');
      await app.close();
      return;
    }

    const usersData = [
      {
        email: 'admin@cyna.fr',
        firstName: 'Admin',
        lastName: 'CYNA',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      {
        email: 'user1@cyna.fr',
        firstName: 'Jean',
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

    for (const userData of usersData) {
      const user = new User();
      user.email = userData.email;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.role = userData.role;
      user.status = userData.status;
      // Hash a default password
      const defaultPassword = 'TempPassword123!';
      user.passwordHash = crypto.createHash('sha256').update(defaultPassword).digest('hex');

      await userRepository.save(user);
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Users seed completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();

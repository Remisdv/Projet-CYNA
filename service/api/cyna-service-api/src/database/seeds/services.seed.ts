import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entity/category/category.entity';
import { ServiceEntity, ServiceStatus } from '../entity/service/service.entity';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const categoryRepository = dataSource.getRepository(CategoryEntity);
  const serviceRepository = dataSource.getRepository(ServiceEntity);

  try {
    console.log('Starting Services and Categories seed...');

    const existingCategories = await categoryRepository.count();
    if (existingCategories > 0) {
      console.log('Categories already exist. Skipping seed.');
      await app.close();
      return;
    }

    // Seed Categories
    const categoriesData = [
      {
        nom: 'Cybersécurité',
        description: 'Services et solutions de cybersécurité',
        slug: 'cybersecurite',
      },
      {
        nom: 'Audit de sécurité',
        description: 'Audits et tests de pénétration',
        slug: 'audit-securite',
      },
      {
        nom: 'Conformité',
        description: 'Services de conformité et gouvernance',
        slug: 'conformite',
      },
      {
        nom: 'Formation',
        description: 'Formations en sécurité informatique',
        slug: 'formation',
      },
    ];

    const categories: CategoryEntity[] = [];
    for (const catData of categoriesData) {
      const category = new CategoryEntity();
      category.id = uuidv4();
      category.nom = catData.nom;
      category.description = catData.description;
      category.slug = catData.slug;
      await categoryRepository.save(category);
      categories.push(category);
      console.log(`Created category: ${catData.nom}`);
    }

    // Seed Services
    const servicesData = [
      {
        nom: 'Threat Intelligence',
        categoryId: categories[0].id,
        description: 'Service de renseignement sur les menaces avec rapports quotidiens',
        statut: ServiceStatus.PUBLISHED,
        slug: 'threat-intelligence',
        meta_title: 'Threat Intelligence - Service CYNA',
        meta_description: 'Service de renseignement sur les menaces en cybersécurité',
        keywords: 'threat intelligence, sécurité, menaces',
      },
      {
        nom: 'EDR - Endpoint Detection and Response',
        categoryId: categories[0].id,
        description: 'Solution complète de détection et réponse aux incidents sur les postes clients',
        statut: ServiceStatus.PUBLISHED,
        slug: 'edr-endpoint-detection-response',
        meta_title: 'EDR - Solution de détection d\'incidents',
        meta_description: 'Endpoint Detection and Response pour protéger vos postes de travail',
        keywords: 'EDR, endpoint detection, réponse aux incidents',
      },
      {
        nom: 'XDR - Extended Detection and Response',
        categoryId: categories[0].id,
        description: 'Plateforme de sécurité intégrée couvrant tous les vecteurs d\'attaque',
        statut: ServiceStatus.PUBLISHED,
        slug: 'xdr-extended-detection-response',
        meta_title: 'XDR - Plateforme de détection étendue',
        meta_description: 'Extended Detection and Response pour une protection complète',
        keywords: 'XDR, security operations, détection',
      },
      {
        nom: 'Test de pénétration',
        categoryId: categories[1].id,
        description: 'Test de pénétration complet de votre infrastructure',
        statut: ServiceStatus.PUBLISHED,
        slug: 'test-penetration',
        meta_title: 'Test de pénétration professionnel',
        meta_description: 'Services de test de pénétration pour évaluer votre sécurité',
        keywords: 'pentest, test de pénétration, audit de sécurité',
      },
      {
        nom: 'Audit de conformité GDPR',
        categoryId: categories[2].id,
        description: 'Audit approfondi de votre conformité GDPR et recommandations',
        statut: ServiceStatus.PUBLISHED,
        slug: 'audit-conformite-gdpr',
        meta_title: 'Audit de conformité GDPR',
        meta_description: 'Audit complet de votre conformité GDPR et recommandations',
        keywords: 'GDPR, conformité, audit',
      },
      {
        nom: 'Audit de conformité ISO 27001',
        categoryId: categories[2].id,
        description: 'Certification et audit ISO 27001 pour votre organisation',
        statut: ServiceStatus.PUBLISHED,
        slug: 'audit-iso-27001',
        meta_title: 'Audit ISO 27001',
        meta_description: 'Services d\'audit et certification ISO 27001',
        keywords: 'ISO 27001, sécurité de l\'information, audit',
      },
      {
        nom: 'Formation cybersécurité niveau 1',
        categoryId: categories[3].id,
        description: 'Formation d\'introduction aux principes de cybersécurité',
        statut: ServiceStatus.PUBLISHED,
        slug: 'formation-cybersecurite-niveau-1',
        meta_title: 'Formation cybersécurité débutant',
        meta_description: 'Formation initiale en cybersécurité pour tous',
        keywords: 'formation, cybersécurité, débutant',
      },
      {
        nom: 'Formation cybersécurité niveau avancé',
        categoryId: categories[3].id,
        description: 'Formation avancée pour experts en cybersécurité',
        statut: ServiceStatus.DRAFT,
        slug: 'formation-cybersecurite-avance',
        meta_title: 'Formation cybersécurité avancée',
        meta_description: 'Formation avancée en cybersécurité pour professionnels',
        keywords: 'formation, cybersécurité, avancé',
      },
    ];

    for (const svcData of servicesData) {
      const service = new ServiceEntity();
      service.id = uuidv4();
      service.nom = svcData.nom;
      service.categoryId = svcData.categoryId;
      service.description = svcData.description;
      service.statut = svcData.statut;
      service.slug = svcData.slug;
      service.meta_title = svcData.meta_title;
      service.meta_description = svcData.meta_description;
      service.keywords = svcData.keywords;
      await serviceRepository.save(service);
      console.log(`Created service: ${svcData.nom}`);
    }

    console.log('Services and Categories seed completed successfully!');
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();

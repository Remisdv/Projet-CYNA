import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entity/category/category.entity';
import { ServiceEntity, ServiceStatus } from '../entity/service/service.entity';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const catRepo = dataSource.getRepository(CategoryEntity);
  const svcRepo = dataSource.getRepository(ServiceEntity);

  try {
    console.log('Starting Service-API Services + Categories seed...');

    // Idempotent: truncate then reinsert
    await svcRepo.query('DELETE FROM services');
    await catRepo.query('DELETE FROM categories');

    // ──── Service-API Categories (for BO service management) ─────────
    const cats: Record<string, CategoryEntity> = {};
    const catDefs = [
      { slug: 'edr', nom: 'EDR - Endpoint Detection & Response', desc: 'Détection et réponse sur les endpoints' },
      { slug: 'xdr', nom: 'XDR - Extended Detection & Response', desc: 'Détection étendue multi-vecteurs' },
      { slug: 'soc', nom: 'SOC / MDR - Security Operations', desc: 'Security Operations Center, MDR et outils SOC managés' },
      { slug: 'produit-physique', nom: 'Produits Physiques', desc: 'Matériel de sécurité : clés FIDO2, modules HSM et tokens' },
    ];

    for (const def of catDefs) {
      const cat = new CategoryEntity();
      cat.id = uuidv4();
      cat.nom = def.nom;
      cat.description = def.desc;
      cat.slug = def.slug;
      await catRepo.save(cat);
      cats[def.slug] = cat;
      console.log(`Created category: ${def.slug}`);
    }

    // ──── Services (BO service management table) ─────────────────────
    const svcDefs = [
      {
        nom: 'EDR Enterprise - Endpoint Protection',
        catSlug: 'edr',
        description: 'Protection avancée des endpoints avec détection comportementale par IA, isolation automatique et réponse aux incidents en temps réel.',
        slug: 'edr-enterprise-endpoint-protection',
        meta_title: 'EDR Enterprise - Protection endpoints nouvelle génération',
        meta_description: 'Solution EDR avec IA et réponse automatisée pour protéger vos endpoints',
        keywords: 'EDR, endpoint detection, réponse incidents, antivirus, ransomware',
      },
      {
        nom: 'XDR Extended Threat Defense Platform',
        catSlug: 'xdr',
        description: 'Plateforme XDR unifiée couvrant endpoints, réseau, cloud et identité pour détecter les attaques avancées invisibles aux outils en silos.',
        slug: 'xdr-extended-threat-defense',
        meta_title: 'XDR - Plateforme de défense étendue unifiée',
        meta_description: 'Corrélation multi-vecteur pour détecter et contenir les attaques avancées',
        keywords: 'XDR, extended detection, SOAR, corrélation, threat hunting',
      },
      {
        nom: 'SOC 24/7 Managed Detection & Response',
        catSlug: 'soc',
        description: 'Surveillance continue par notre Security Operations Center avec analystes certifiés 24h/24, 7j/7. MTTD < 15 min, MTTR < 30 min.',
        slug: 'soc-mdr-24-7-managed',
        meta_title: 'SOC 24/7 - Surveillance et réponse aux incidents en continu',
        meta_description: 'Security Operations Center avec analystes certifiés disponibles 24h/24',
        keywords: 'SOC, MDR, surveillance, 24/7, détection, réponse incidents',
      },
      {
        nom: 'SIEM as a Service',
        catSlug: 'soc',
        description: 'Centralisation et corrélation de vos logs de sécurité avec alertes temps réel, tableaux de bord et rapports de conformité.',
        slug: 'siem-as-a-service',
        meta_title: 'SIEM as a Service - Corrélation logs de sécurité managée',
        meta_description: 'Centralisation des logs et détection des menaces par corrélation SIEM',
        keywords: 'SIEM, logs, corrélation, alertes, conformité, compliance',
      },
      {
        nom: 'Breach & Attack Simulation',
        catSlug: 'soc',
        description: 'Tests offensifs continus simulant des attaquants réels pour évaluer et renforcer vos défenses et valider vos contrôles de sécurité.',
        slug: 'breach-attack-simulation-bas',
        meta_title: 'Breach & Attack Simulation - Tests offensifs continus',
        meta_description: 'Simulation continue d\'attaques pour valider et améliorer vos défenses',
        keywords: 'BAS, breach, attack simulation, pentest continu, red team',
      },
      {
        nom: 'Threat Intelligence Premium',
        catSlug: 'soc',
        description: 'Flux IOCs temps réel, TTPs MITRE ATT&CK, rapports stratégiques et alertes ciblées pour anticiper les menaces de votre secteur.',
        slug: 'threat-intelligence-premium',
        meta_title: 'Threat Intelligence Premium - Renseignement sur les menaces',
        meta_description: 'IOCs en temps réel et rapports stratégiques MITRE ATT&CK par secteur',
        keywords: 'threat intelligence, IOC, MITRE ATT&CK, darknet, STIX, TAXII',
      },
      {
        nom: 'MDR - Managed Detection & Response',
        catSlug: 'soc',
        description: 'Service MDR complet combinant technologie de pointe et équipe humaine pour détecter, investiguer et contenir les incidents de sécurité.',
        slug: 'mdr-managed-detection-response',
        meta_title: 'MDR - Détection et réponse aux incidents managées',
        meta_description: 'Service MDR avec technologie avancée et analystes experts',
        keywords: 'MDR, managed detection, réponse incidents, threat hunting',
      },
      {
        nom: 'Vulnerability Management as a Service',
        catSlug: 'edr',
        description: 'Scan continu des vulnérabilités, priorisation par risque métier, suivi de remédiation avec SLA et reporting de conformité.',
        slug: 'vulnerability-management-service',
        meta_title: 'Vulnerability Management - Gestion des vulnérabilités',
        meta_description: 'Scan continu et priorisation des vulnérabilités par risque métier',
        keywords: 'vulnerability management, CVE, patch, remédiation, CVSS',
      },
    ];

    for (const def of svcDefs) {
      const svc = new ServiceEntity();
      svc.id = uuidv4();
      svc.nom = def.nom;
      svc.categoryId = cats[def.catSlug].id;
      svc.description = def.description;
      svc.statut = ServiceStatus.PUBLISHED;
      svc.slug = def.slug;
      svc.meta_title = def.meta_title;
      svc.meta_description = def.meta_description;
      svc.keywords = def.keywords;
      await svcRepo.save(svc);
      console.log(`Created service: ${def.nom}`);
    }

    console.log('Service-API Services + Categories seed completed!');
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();

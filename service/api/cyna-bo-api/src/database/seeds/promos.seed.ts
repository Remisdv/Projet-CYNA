import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Category } from '../entity/Category/Category.entity';
import { TextePromotionnel } from '../entity/TextePromotionnel/TextePromotionnel.entity';
import { CarouselItem } from '../entity/Carousel/CarouselItem.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const categoryRepo = dataSource.getRepository(Category);
  const promoRepo = dataSource.getRepository(TextePromotionnel);
  const carouselRepo = dataSource.getRepository(CarouselItem);

  try {
    console.log('Starting BO Promos + Categories seed...');

    // Truncate for idempotency
    await carouselRepo.query('DELETE FROM carousel_item');
    await promoRepo.query('DELETE FROM texte_promotionnel');
    await categoryRepo.query('DELETE FROM category');

    // ──── BO Categories ─────────────────────────────────────────────
    const categoriesData = [
      { slug: 'edr', nameFr: 'EDR - Endpoint Detection & Response', descFr: 'Détection et réponse sur les postes de travail et serveurs', nameEn: 'EDR - Endpoint Detection & Response', descEn: 'Endpoint detection and response solutions' },
      { slug: 'xdr', nameFr: 'XDR - Extended Detection & Response', descFr: 'Détection étendue sur tous les vecteurs d\'attaque', nameEn: 'XDR - Extended Detection & Response', descEn: 'Extended detection across all attack vectors' },
      { slug: 'soc', nameFr: 'SOC / MDR - Security Operations', descFr: 'Security Operations Center, MDR et outils SOC managés', nameEn: 'SOC / MDR - Security Operations', descEn: 'Security Operations Center and Managed Detection & Response' },
      { slug: 'produit-physique', nameFr: 'Produits Physiques', descFr: 'Matériel de sécurité : clés FIDO2, modules HSM et tokens', nameEn: 'Physical Products', descEn: 'Security hardware: FIDO2 keys, HSM modules and tokens' },
    ];

    for (const catData of categoriesData) {
      const cat = categoryRepo.create(catData);
      await categoryRepo.save(cat);
      console.log(`Created category: ${catData.slug}`);
    }

    // ──── Textes Promotionnels ────────────────────────────────────────
    const promosData = [
      {
        textFr: '🛡️ Offre de lancement : -20% sur tous nos services managés pour les 3 premiers mois ! Code : CYNA20',
        textEn: '🛡️ Launch offer: -20% on all managed services for the first 3 months! Code: CYNA20',
        isActive: true,
      },
      {
        textFr: '🔒 Nouveau : SOC 24/7 disponible à partir de 249€/mois — Protection continue, experts certifiés.',
        textEn: '🔒 New: SOC 24/7 available from €249/month — Continuous protection, certified experts.',
        isActive: false,
      },
      {
        textFr: '📞 Incident en cours ? Notre équipe CERT est disponible 24h/24 — Appelez le +33 1 80 XX XX XX',
        textEn: '📞 Active incident? Our CERT team is available 24/7 — Call +33 1 80 XX XX XX',
        isActive: false,
      },
    ];

    for (const promoData of promosData) {
      const promo = promoRepo.create(promoData);
      await promoRepo.save(promo);
      console.log(`Created promo: ${promoData.textFr.substring(0, 40)}...`);
    }

    // ──── Carousel Items ─────────────────────────────────────────────
    const carouselData = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80&auto=format&fit=crop',
        imageAlt: 'SOC 24/7 Monitoring',
        title: 'Protégez votre entreprise 24h/24',
        text: 'Notre SOC managé surveille votre infrastructure en permanence. Détection, analyse et réponse aux incidents par nos experts certifiés.',
        link: '/catalogue?categorie=soc',
        order: 1,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&q=80&auto=format&fit=crop',
        imageAlt: 'EDR Endpoint Protection',
        title: 'EDR Enterprise — Stoppez les ransomwares',
        text: 'Détection comportementale par IA, isolation automatique et rollback instantané. Protégez tous vos endpoints en moins de 48h.',
        link: '/catalogue?categorie=edr',
        order: 2,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1614064641938-f08a1e06a0b6?w=1920&q=80&auto=format&fit=crop',
        imageAlt: 'Threat Intelligence',
        title: 'Threat Intelligence Premium',
        text: 'Anticipez les cyberattaques ciblant votre secteur grâce à nos flux IOCs temps réel et rapports stratégiques MITRE ATT&CK.',
        link: '/catalogue?categorie=soc',
        order: 3,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80&auto=format&fit=crop',
        imageAlt: 'Audit Cybersécurité',
        title: 'Audit & Conformité — ISO 27001, RGPD, NIS2',
        text: 'Évaluez votre posture de sécurité avec nos experts. Pentest, Red Team, audit RGPD et accompagnement à la certification.',
        link: '/catalogue?categorie=xdr',
        order: 4,
      },
    ];

    for (const carouselItem of carouselData) {
      const item = carouselRepo.create(carouselItem);
      await carouselRepo.save(item);
      console.log(`Created carousel item: ${carouselItem.title}`);
    }

    console.log('BO Promos + Categories seed completed!');
  } catch (error) {
    console.error('Error seeding BO promos:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();

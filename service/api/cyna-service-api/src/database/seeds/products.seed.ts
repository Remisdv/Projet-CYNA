import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import {
    ProductEntity,
    ProductCategory,
    ProductType,
    ProductStatus,
    ServicePeriodicity,
} from '../entity/product/product.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Curated Unsplash cybersecurity / tech photo IDs (stable, free to use).
 * Format: https://images.unsplash.com/photo-{ID}?w=800&q=80&auto=format&fit=crop
 */
const IMG = (id: string) =>
    `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

const IMAGES = {
    // Cybersecurity / hacking / code
    cyber1: IMG('photo-1550751827-4bd374c3f58b'), // server room
    cyber2: IMG('photo-1563013544-824ae1b704d3'), // binary code
    cyber3: IMG('photo-1518770660439-4636190af475'), // chip board
    cyber4: IMG('photo-1526374965328-7f61d4dc18c5'), // matrix code
    cyber5: IMG('photo-1573164713988-8665fc963095'), // hooded hacker
    cyber6: IMG('photo-1614064641938-3bbee52942c7'), // cyber lock
    cyber7: IMG('photo-1510511459019-5dda7724fd87'), // padlock keyboard
    cyber8: IMG('photo-1555949963-aa79dcee981c'), // code on screen
    cyber9: IMG('photo-1551808525-51a94da548ce'), // dark code
    cyber10: IMG('photo-1516321318423-f06f85e504b3'), // analytics screen

    // Hardware / network
    router: IMG('photo-1606857521015-7f9fcf423740'), // router
    firewall: IMG('photo-1558494949-ef010cbdcc31'), // network rack
    server: IMG('photo-1573164574572-cb89e39749b4'), // server stack
    network: IMG('photo-1545987796-200677ee1011'), // network cables
    cables: IMG('photo-1544197150-b99a580bb7a8'), // server cables
    rack: IMG('photo-1597733336794-12d05021d510'), // server rack 2
    ethernet: IMG('photo-1591808216268-ce0b82787efe'), // ethernet switch

    // Tokens / hardware keys
    yubikey: IMG('photo-1614064641938-3bbee52942c7'), // security key
    usb: IMG('photo-1601737487795-dab272f52420'), // usb device

    // Software / SaaS
    saas: IMG('photo-1551434678-e076c223a692'), // dashboard
    vpn: IMG('photo-1614064548237-096d99c3da08'), // shield
    password: IMG('photo-1633265486064-086b219458ec'), // password vault

    // Training / education
    training: IMG('photo-1522202176988-66273c2fd55f'), // classroom
    elearning: IMG('photo-1503676260728-1c00da094a0b'), // online course
    certification: IMG('photo-1560472354-b33ff0c44a43'), // diploma

    // Audit / compliance / legal
    audit: IMG('photo-1450101499163-c8848c66ca85'), // documents
    compliance: IMG('photo-1589829545856-d10d557cf95f'), // legal book
    report: IMG('photo-1454165804606-c3d57bc86b40'), // analytics report

    // Incident response / forensics
    incident: IMG('photo-1581090700227-1e37b190418e'), // alert screen
    forensics: IMG('photo-1551288049-bebda4e38f71'), // graphs

    // Cloud / SOC
    cloud: IMG('photo-1451187580459-43490279c0fa'), // cloud datacenter
    soc: IMG('photo-1581094271901-8022df4466f9'), // dark monitoring room

    // Backup / encryption
    backup: IMG('photo-1544197150-b99a580bb7a8'), // tape backup
    encryption: IMG('photo-1633265486501-2a0c0a02bff5'), // crypto

    // Misc tech
    laptop: IMG('photo-1496181133206-80ce9b88a853'),
    workspace: IMG('photo-1517694712202-14dd9538aa97'),
    ai: IMG('photo-1677442136019-21780ecad995'),
};

/* ------------------------------------------------------------------ */
/*                         SERVICES (4 items)                          */
/* ------------------------------------------------------------------ */
const SERVICES = [
    {
        nom: 'SOC 24/7 Managed Detection & Response',
        categorie: 'soc',
        description_courte:
            'Surveillance continue par notre Security Operations Center, 24h/24 et 7j/7.',
        description_longue: `## Une équipe d'experts à vos côtés en permanence

Notre **SOC managé** assure la surveillance, la détection et la réponse aux incidents de sécurité de votre infrastructure, **24h/24 et 7j/7**, par une équipe d'analystes certifiés.

### Ce que vous obtenez

- **Surveillance 24/7** par des analystes SOC niveau 1, 2 et 3
- **Détection proactive** des menaces grâce à notre SIEM mutualisé
- **Réponse aux incidents** sous 15 minutes garanties
- **Rapports mensuels** détaillés et tableaux de bord temps réel
- **Threat hunting** hebdomadaire par nos experts

### Périmètre couvert

- Endpoints (postes de travail, serveurs)
- Infrastructure cloud (AWS, Azure, GCP)
- Applications SaaS critiques
- Réseau et périmètre

### Engagement de service

Disponibilité **99,95%**, MTTR < 30 minutes pour les incidents critiques.`,
        prix_mensuel: 2490,
        prix_annuel: 24900,
        remise_annuelle_pct: 16.7,
        periodicite: ServicePeriodicity.MONTHLY,
        images: [IMAGES.soc, IMAGES.cyber1, IMAGES.network],
        tags: ['soc', '24/7', 'managed', 'détection', 'réponse-incident'],
    },
    {
        nom: 'EDR Endpoint Protection Enterprise',
        categorie: 'edr',
        description_courte:
            'Protection avancée des endpoints avec détection comportementale et réponse automatisée.',
        description_longue: `## Une protection nouvelle génération pour vos postes

Notre solution **EDR Enterprise** combine antivirus next-gen, détection comportementale par IA et réponse automatisée pour neutraliser les menaces avant qu'elles ne se propagent.

### Fonctionnalités clés

- **Détection comportementale** par machine learning
- **Anti-ransomware** avec rollback automatique
- **Isolation automatique** des endpoints compromis
- **Investigation forensique** intégrée (timeline, IOCs)
- **Console centralisée** SaaS avec multi-tenant

### Compatibilité

Windows 10/11, macOS, Linux (Ubuntu, RHEL, Debian), Android, iOS.

### Inclus dans l'abonnement

- Mises à jour quotidiennes des signatures et règles comportementales
- Support technique 8h/20h en français
- Onboarding et formation des équipes IT (4h)
- Accès à notre threat intelligence feed

> Tarification dégressive à partir de 100 endpoints. Contactez-nous pour un devis personnalisé.`,
        prix_mensuel: 12,
        prix_annuel: 120,
        remise_annuelle_pct: 16.7,
        periodicite: ServicePeriodicity.MONTHLY,
        images: [IMAGES.cyber6, IMAGES.cyber8, IMAGES.laptop],
        tags: ['edr', 'endpoint', 'antivirus', 'ransomware', 'edr-enterprise'],
    },
    {
        nom: 'XDR Extended Threat Defense Platform',
        categorie: 'xdr',
        description_courte:
            'Plateforme XDR unifiée : endpoints, réseau, cloud, identité et email en une console.',
        description_longue: `## La défense étendue, unifiée et intelligente

Notre plateforme **XDR** corrèle les signaux de tous vos vecteurs (endpoint, réseau, cloud, identité, email) pour détecter les attaques avancées **invisibles aux outils en silos**.

### Une plateforme, cinq vecteurs

- **Endpoint** : agent EDR léger sur tous vos postes
- **Réseau** : analyse du trafic Est-Ouest et Nord-Sud
- **Cloud** : intégration native AWS, Azure, GCP, Office 365
- **Identité** : détection des comportements suspects (Active Directory, IdP)
- **Email** : protection anti-phishing avancée

### Bénéfices

1. **Réduction de 70% du MTTD** (Mean Time To Detect)
2. **Corrélation automatique** des alertes en incidents priorisés
3. **Playbooks SOAR** intégrés pour la remédiation
4. **Reporting de conformité** GDPR, ISO 27001, NIS2

### Architecture

Multi-tenant, déploiement cloud-native, API-first avec SDK Python/Go.`,
        prix_mensuel: 4990,
        prix_annuel: 49900,
        remise_annuelle_pct: 16.7,
        periodicite: ServicePeriodicity.MONTHLY,
        images: [IMAGES.cloud, IMAGES.cyber10, IMAGES.network],
        tags: ['xdr', 'plateforme', 'corrélation', 'soar', 'cloud'],
    },
    {
        nom: 'Threat Intelligence Premium Feed',
        categorie: 'soc',
        description_courte:
            'Renseignement sur les menaces : IOCs, TTPs et rapports stratégiques en temps réel.',
        description_longue: `## Anticipez les menaces qui ciblent votre secteur

Notre service **Threat Intelligence Premium** vous livre un flux continu d'**indicateurs de compromission (IOCs)**, de **tactiques d'attaque (TTPs MITRE ATT&CK)** et de rapports stratégiques rédigés par nos analystes.

### Ce que vous recevez

- **Flux IOCs temps réel** : IPs, domaines, hash, URLs malveillants (format STIX/TAXII)
- **Rapports tactiques** hebdomadaires sur les menaces actives
- **Briefings stratégiques** mensuels par secteur d'activité
- **Alertes ciblées** quand une menace concerne votre organisation
- **Accès à la plateforme analytique** avec recherche full-text

### Sources

- Honeypots et sondes propriétaires (50+ pays)
- Surveillance darknet et forums cybercriminels
- Partenariats avec CERT et ISAC sectoriels
- Threat hunting interne

### Intégrations natives

SIEM (Splunk, QRadar, Sentinel), SOAR, EDR, firewalls.`,
        prix_mensuel: 990,
        prix_annuel: 9900,
        remise_annuelle_pct: 16.7,
        periodicite: ServicePeriodicity.MONTHLY,
        images: [IMAGES.cyber4, IMAGES.cyber2, IMAGES.report],
        tags: ['threat-intelligence', 'ioc', 'mitre', 'darknet', 'stix'],
    },
];

/* ------------------------------------------------------------------ */
/*                   PRODUCTS (35 SaaS + 5 physiques)                 */
/* ------------------------------------------------------------------ */

interface SaasSeed {
    nom: string;
    categorie: string;
    description_courte: string;
    description_longue: string;
    prix_mensuel: number;
    prix_annuel: number;
    remise_annuelle_pct: number;
    images: string[];
    tags: string[];
    saas: true;
}

interface PhysicalSeed {
    nom: string;
    categorie: string;
    description_courte: string;
    description_longue: string;
    prix: number;
    stock: number;
    images: string[];
    tags: string[];
}

type ProductSeed = SaasSeed | PhysicalSeed;

const PRODUCTS: ProductSeed[] = [
    // ── EDR (13) ──────────────────────────────────────────────────────────────
    {
        nom: 'CrowdStrike Falcon Pro',
        categorie: 'edr',
        description_courte: 'EDR cloud-native CrowdStrike Falcon Pro — protection IA et isolation automatique.',
        description_longue: `## CrowdStrike Falcon Pro — EDR nouvelle génération

Falcon Pro est la solution EDR cloud-native de référence mondiale.

### Fonctionnalités

- **IA comportementale** : détection en temps réel sans signature
- **Threat graph** : graphe d'attaque cloud mis à jour en continu
- **Isolation réseau** automatique des hôtes compromis
- **Anti-ransomware** avec rollback instantané
- **Console Falcon** unifiée — zéro infrastructure à gérer

### Licence

Abonnement mensuel ou annuel (−17 %) par endpoint. Minimum 10 postes.`,
        prix_mensuel: 89,
        prix_annuel: 890,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber1, IMAGES.laptop, IMAGES.saas],
        tags: ['crowdstrike', 'falcon', 'edr', 'endpoint', 'cloud-native'],
        saas: true as const,
    },
    {
        nom: 'CrowdStrike Falcon Enterprise',
        categorie: 'edr',
        description_courte: 'Falcon Enterprise : EDR + Threat Intelligence + Overwatch 24/7 pour grandes organisations.',
        description_longue: `## CrowdStrike Falcon Enterprise — Protection totale

La suite Enterprise ajoute au Falcon Pro la Threat Intelligence CrowdStrike et l'équipe Overwatch (chasse aux menaces humaine 24/7).

### Inclus en Enterprise

- Tout Falcon Pro +
- **Falcon Intelligence** : rapports IOC/TTP par secteur
- **Falcon OverWatch** : analystes qui chassent les menaces dans votre environnement
- **Threat hunting proactif** 24/7 avec alertes priorisées
- **API Falcon** pour intégration SIEM/SOAR`,
        prix_mensuel: 179,
        prix_annuel: 1790,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber2, IMAGES.soc, IMAGES.saas],
        tags: ['crowdstrike', 'falcon-enterprise', 'overwatch', 'edr', 'threat-hunting'],
        saas: true as const,
    },
    {
        nom: 'SentinelOne Singularity Core',
        categorie: 'edr',
        description_courte: 'SentinelOne Core — EDR autonome avec rollback automatique, sans cloud requis.',
        description_longue: `## SentinelOne Singularity Core — EDR autonome

Agent autonome capable de prendre des décisions de protection sans dépendance réseau.

### Points forts

- **Agent autonome** : fonctionne même hors ligne
- **Storyline** : corrélation automatique des événements en une histoire d'attaque
- **Rollback 1-clic** : restauration des fichiers chiffrés par ransomware
- **Détection comportementale** par IA sur l'endpoint`,
        prix_mensuel: 69,
        prix_annuel: 690,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber3, IMAGES.laptop, IMAGES.saas],
        tags: ['sentinelone', 'singularity', 'edr', 'rollback', 'autonome'],
        saas: true as const,
    },
    {
        nom: 'SentinelOne Singularity Control',
        categorie: 'edr',
        description_courte: 'Singularity Control : EDR + contrôle des périphériques USB et règles de firewall.',
        description_longue: `## SentinelOne Singularity Control

Control ajoute à Core la gestion des périphériques externes et le contrôle du pare-feu local.

### Fonctionnalités supplémentaires

- **Device Control** : liste blanche/noire USB, périphériques Bluetooth
- **Firewall Control** : règles réseau par endpoint gérées centralement
- **Vulnerability Management** intégré (scan des CVE sur les hôtes)`,
        prix_mensuel: 129,
        prix_annuel: 1290,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber4, IMAGES.laptop, IMAGES.saas],
        tags: ['sentinelone', 'control', 'edr', 'device-control', 'firewall'],
        saas: true as const,
    },
    {
        nom: 'Microsoft Defender for Endpoint P1',
        categorie: 'edr',
        description_courte: "Defender P1 : protection antivirus next-gen, réduction de surface d'attaque.",
        description_longue: `## Microsoft Defender for Endpoint Plan 1

Plan 1 offre la protection de base intégrée à l'écosystème Microsoft 365.

### Fonctionnalités P1

- **Antivirus next-gen** : ML cloud, détection comportementale
- **Réduction de surface d'attaque** (ASR rules, exploit guard)
- **Accès conditionnel** basé sur la conformité (intégration Intune)
- **API Microsoft Security Graph** pour automatisation`,
        prix_mensuel: 49,
        prix_annuel: 490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.saas, IMAGES.laptop, IMAGES.cyber5],
        tags: ['microsoft', 'defender', 'mde', 'p1', 'edr'],
        saas: true as const,
    },
    {
        nom: 'Microsoft Defender for Endpoint P2',
        categorie: 'edr',
        description_courte: 'Defender P2 : EDR complet avec threat hunting, investigation automatisée et AIR.',
        description_longue: `## Microsoft Defender for Endpoint Plan 2

Plan 2 est la version complète de MDE avec EDR et investigation & remédiation automatisées (AIR).

### Fonctionnalités P2 (inclut tout P1 +)

- **EDR** : alertes de détection, timeline d'incidents
- **Investigation automatisée** (AIR) : remédiation sans intervention manuelle
- **Threat & Vulnerability Management** : inventaire CVE, score d'exposition
- **Advanced Hunting** (KQL)`,
        prix_mensuel: 99,
        prix_annuel: 990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.saas, IMAGES.cyber6, IMAGES.laptop],
        tags: ['microsoft', 'defender', 'mde', 'p2', 'edr', 'air'],
        saas: true as const,
    },
    {
        nom: 'Trend Micro Apex One SaaS',
        categorie: 'edr',
        description_courte: 'Apex One SaaS : protection endpoint Trend Micro avec détection IA et réponse automatisée.',
        description_longue: `## Trend Micro Apex One SaaS

Plateforme EPP/EDR de Trend Micro déployée entièrement en cloud.

### Fonctionnalités

- **Protection multi-couches** : antivirus, anti-exploit, behavioral monitoring
- **Virtual Patching** : protection des CVE sans patcher les systèmes
- **Sandbox Analysis** : analyse dynamique des fichiers suspects
- **Connexion Vision One** : upgrade XDR optionnel`,
        prix_mensuel: 79,
        prix_annuel: 790,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber7, IMAGES.laptop, IMAGES.saas],
        tags: ['trend-micro', 'apex-one', 'edr', 'virtual-patching', 'cloud'],
        saas: true as const,
    },
    {
        nom: 'ESET PROTECT Advanced Cloud',
        categorie: 'edr',
        description_courte: 'ESET PROTECT Advanced : EDR cloud européen avec chiffrement, sandbox et gestion centralisée.',
        description_longue: `## ESET PROTECT Advanced Cloud

Solution européenne (siège en Slovaquie) offrant EDR, sandboxing cloud et chiffrement Full Disk.

### Inclus

- **ESET Endpoint Security** : antivirus, firewall, contrôle des médias
- **ESET Inspect** (EDR) : détection comportementale, timeline des incidents
- **Cloud Sandbox** : analyse des fichiers suspects en environnement isolé
- **ESET Full Disk Encryption** : chiffrement BitLocker/FileVault centralisé

### Atout RGPD

Données hébergées en UE, certifié ISO 27001.`,
        prix_mensuel: 59,
        prix_annuel: 590,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber8, IMAGES.laptop, IMAGES.saas],
        tags: ['eset', 'protect', 'edr', 'sandbox', 'rgpd', 'europeen'],
        saas: true as const,
    },
    {
        nom: 'Bitdefender GravityZone Business Security Enterprise',
        categorie: 'edr',
        description_courte: 'GravityZone Enterprise : EDR + analytics humain + Risk Management.',
        description_longue: `## Bitdefender GravityZone Business Security Enterprise

Intègre EDR, analyse des risques humains et protection des identités dans une console unifiée.

### Fonctionnalités clés

- **HyperDetect** : IA avancée pré-exécution
- **eXtended EDR** : timeline d'attaque, réponse guidée
- **Human Risk Analytics** : score de risque par utilisateur
- **Sandbox Analyzer** : détonation dynamique`,
        prix_mensuel: 49,
        prix_annuel: 490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber9, IMAGES.laptop, IMAGES.saas],
        tags: ['bitdefender', 'gravityzone', 'edr', 'human-risk', 'hyperdetect'],
        saas: true as const,
    },
    {
        nom: 'Sophos Intercept X Advanced',
        categorie: 'edr',
        description_courte: 'Sophos Intercept X : deep learning + anti-ransomware CryptoGuard + XDR optionnel.',
        description_longue: `## Sophos Intercept X Advanced

Reconnu pour son moteur deep learning et sa protection anti-ransomware CryptoGuard.

### Fonctionnalités

- **Deep Learning** : détection des menaces zero-day sans signature
- **CryptoGuard** : anti-ransomware avec rollback automatique
- **Exploit Prevention** : blocage des techniques d'exploitation courantes
- **Root Cause Analysis** : rapport visuel de la chaîne d'attaque
- **XDR natif** : upgrade vers Sophos XDR disponible`,
        prix_mensuel: 89,
        prix_annuel: 890,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber10, IMAGES.laptop, IMAGES.saas],
        tags: ['sophos', 'intercept-x', 'edr', 'deep-learning', 'cryptoguard'],
        saas: true as const,
    },
    {
        nom: 'Malwarebytes for Teams',
        categorie: 'edr',
        description_courte: 'Malwarebytes Teams : protection endpoint légère et abordable pour équipes de 5 à 100.',
        description_longue: `## Malwarebytes for Teams

Solution idéale pour les TPE/PME qui veulent une protection solide sans complexité opérationnelle.

### Fonctionnalités

- **Détection multi-vecteur** : malwares, ransomwares, PUP, exploits
- **Remédiation en 1 clic** depuis la console cloud
- **Brute Force Protection** : blocage des attaques RDP
- **Application Hardening** : durcissement automatique du navigateur`,
        prix_mensuel: 39,
        prix_annuel: 390,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.saas, IMAGES.laptop, IMAGES.cyber1],
        tags: ['malwarebytes', 'teams', 'edr', 'pme', 'leger'],
        saas: true as const,
    },
    {
        nom: 'Cybereason Defense Platform',
        categorie: 'edr',
        description_courte: 'Cybereason : détection operation-centric et MalOp Engine pour stopper les attaques complexes.',
        description_longue: `## Cybereason Defense Platform

Approche unique centrée sur les « Malicious Operations » (MalOps) plutôt que sur les alertes individuelles.

### Fonctionnalités différenciantes

- **MalOp Engine** : corrèle les événements en une opération malveillante unifiée
- **Anti-ransomware** : détection des premières étapes de chiffrement
- **Réponse automatisée** : isolation, kill process, suppression
- **Mobile protection** (iOS, Android) inclus`,
        prix_mensuel: 119,
        prix_annuel: 1190,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber2, IMAGES.soc, IMAGES.saas],
        tags: ['cybereason', 'malop', 'edr', 'soc', 'operation-centric'],
        saas: true as const,
    },
    {
        nom: 'Elastic Security for Endpoint',
        categorie: 'edr',
        description_courte: "Elastic Security : EDR open intégré à l'Elastic Stack — logs, alertes et hunting unifiés.",
        description_longue: `## Elastic Security for Endpoint

EDR natif à l'Elastic Stack (ELK), idéal pour les équipes qui souhaitent unifier SIEM et EDR.

### Fonctionnalités

- **Agent Elastic** : collecte EDR + logs système + réseau en un seul déploiement
- **900+ règles MITRE ATT&CK** préinstallées
- **Machine Learning** : anomaly detection sur les séquences de processus
- **Session View** : visualisation interactive des sessions Linux
- **SIEM natif** : logs EDR directement dans Elasticsearch`,
        prix_mensuel: 95,
        prix_annuel: 950,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.server, IMAGES.cyber3, IMAGES.saas],
        tags: ['elastic', 'elasticsearch', 'edr', 'siem', 'open-source'],
        saas: true as const,
    },

    // ── XDR (12) ──────────────────────────────────────────────────────────────
    {
        nom: 'CrowdStrike Falcon XDR',
        categorie: 'xdr',
        description_courte: 'Falcon XDR : visibilité multi-domaine (endpoint, cloud, identité, email) unifiée.',
        description_longue: `## CrowdStrike Falcon XDR

Étend la télémétrie EDR à tous les vecteurs d'attaque — email, identités, cloud, réseau.

### Données corrélées

- **Endpoint** : Falcon Agent
- **Cloud** : AWS, Azure, GCP (Falcon Cloud Security)
- **Identité** : Active Directory, Okta, Azure AD
- **Email** : Microsoft 365, Google Workspace
- **Réseau** : flux NetFlow, DNS`,
        prix_mensuel: 249,
        prix_annuel: 2490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber4, IMAGES.soc, IMAGES.cloud],
        tags: ['crowdstrike', 'falcon-xdr', 'xdr', 'multi-domaine', 'cloud'],
        saas: true as const,
    },
    {
        nom: 'SentinelOne Singularity XDR',
        categorie: 'xdr',
        description_courte: 'Singularity XDR : plateforme ouverte avec 350+ intégrations pour une réponse unifiée.',
        description_longue: `## SentinelOne Singularity XDR

Plateforme de sécurité ouverte, conçue pour ingérer des données de 350+ fournisseurs.

### Fonctionnalités XDR

- **Storyline Active Response** : corrélation automatique de toutes les données
- **Marketplace** : intégrations natives CrowdStrike, Palo Alto, Okta
- **Skylight Data Lake** : rétention de 365 jours
- **Purple AI** : assistant IA pour le hunting et la réponse guidée
- **SOAR intégré** : playbooks automatisés`,
        prix_mensuel: 219,
        prix_annuel: 2190,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber5, IMAGES.soc, IMAGES.cloud],
        tags: ['sentinelone', 'singularity-xdr', 'xdr', 'purple-ai', 'soar'],
        saas: true as const,
    },
    {
        nom: 'Palo Alto Cortex XDR Pro',
        categorie: 'xdr',
        description_courte: 'Cortex XDR Pro : analyse comportementale machine learning sur endpoint, réseau et cloud.',
        description_longue: `## Palo Alto Networks Cortex XDR Pro

Solution phare de Palo Alto Networks pour la détection et réponse étendue.

### Fonctionnalités Pro

- **Behavioral Analytics** : profils de comportement par entité
- **Identity Analytics** : détection d'abus de privilèges et de mouvements latéraux
- **Network Analytics** : analyse des flux réseau via NGFWs intégrés
- **Causality Chain** : chaîne de causalité visuelle de chaque incident
- **Automated Investigation** : root cause analysis sans intervention`,
        prix_mensuel: 299,
        prix_annuel: 2990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber6, IMAGES.soc, IMAGES.cloud],
        tags: ['palo-alto', 'cortex-xdr', 'xdr', 'behavioral-analytics', 'gartner-leader'],
        saas: true as const,
    },
    {
        nom: 'Microsoft Defender XDR',
        categorie: 'xdr',
        description_courte: 'Microsoft Defender XDR : protection unifiée endpoint, email, identités et apps cloud M365.',
        description_longue: `## Microsoft Defender XDR

Unifie la protection de l'ensemble de l'écosystème Microsoft en corrélant automatiquement les signaux de tous les services Defender.

### Services corrélés

- **Defender for Endpoint** (P2) : EDR endpoints
- **Defender for Office 365** (P2) : email, SharePoint, Teams
- **Defender for Identity** : Active Directory, Azure AD
- **Defender for Cloud Apps** : CASB, Shadow IT`,
        prix_mensuel: 149,
        prix_annuel: 1490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.saas, IMAGES.cyber7, IMAGES.cloud],
        tags: ['microsoft', 'defender-xdr', 'xdr', 'm365', 'office365'],
        saas: true as const,
    },
    {
        nom: 'Trend Micro Vision One',
        categorie: 'xdr',
        description_courte: 'Vision One : XDR Trend Micro avec Risk Index et Attack Surface Risk Management.',
        description_longue: `## Trend Micro Vision One

Plateforme XDR avec approche unique de gestion de la surface d'attaque et d'index de risque en temps réel.

### Fonctionnalités

- **XDR natif** : corrélation endpoint, email, réseau, serveur, cloud
- **Attack Surface Risk Management** : inventaire et score de risque continu
- **Zero Trust Risk Insights** : intégration avec IAM pour accès conditionnel
- **Workbench** : investigation visuelle des chaînes d'attaque`,
        prix_mensuel: 199,
        prix_annuel: 1990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber8, IMAGES.soc, IMAGES.cloud],
        tags: ['trend-micro', 'vision-one', 'xdr', 'attack-surface', 'risk'],
        saas: true as const,
    },
    {
        nom: 'Cisco XDR',
        categorie: 'xdr',
        description_courte: 'Cisco XDR : détection unifiée avec intégrations natives Cisco (Endpoint, Umbrella, Duo).',
        description_longue: `## Cisco XDR

Nativement intégré à l'ensemble du portfolio Cisco Security.

### Intégrations natives Cisco

- **Cisco Secure Endpoint** (EDR)
- **Cisco Umbrella** (DNS Security / SASE)
- **Cisco Secure Email** (filtrage email)
- **Cisco Duo** (MFA / accès conditionnel)
- **Cisco Secure Firewall** (NGFW)`,
        prix_mensuel: 179,
        prix_annuel: 1790,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber9, IMAGES.soc, IMAGES.cloud],
        tags: ['cisco', 'xdr', 'umbrella', 'duo', 'talos', 'sase'],
        saas: true as const,
    },
    {
        nom: 'IBM QRadar SIEM Cloud',
        categorie: 'xdr',
        description_courte: 'QRadar SIEM Cloud : corrélation de logs à grande échelle avec 700+ connecteurs et UEBA.',
        description_longue: `## IBM QRadar SIEM Cloud

SIEM de référence dans les grandes entreprises et secteurs régulés.

### Fonctionnalités

- **700+ connecteurs** DSM prêts à l'emploi
- **UEBA** natif
- **1500+ règles de corrélation** préconfigurées + personnalisables
- **Offenses** : priorisation intelligente des incidents
- **QRadar Suite** : intégration native SOAR et EDR`,
        prix_mensuel: 349,
        prix_annuel: 3490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.server, IMAGES.soc, IMAGES.cloud],
        tags: ['ibm', 'qradar', 'siem', 'ueba', 'cloud', 'xdr'],
        saas: true as const,
    },
    {
        nom: 'Splunk Enterprise Security Cloud',
        categorie: 'xdr',
        description_courte: 'Splunk ES Cloud : SIEM/XDR leader de marché avec SPL, mission control et SOAR intégré.',
        description_longue: `## Splunk Enterprise Security Cloud

Le SIEM/XDR le plus déployé dans les SOC mondiaux, leader Gartner MQ SIEM depuis 10 ans.

### Fonctionnalités

- **Mission Control** : centre d'opérations unifié pour triage et réponse
- **SPL** (Search Processing Language) : requêtes sur des pétaoctets de données
- **2000+ détections ESCU** (Enterprise Security Content)
- **SOAR natif** (Splunk SOAR) : playbooks Python no-code/low-code`,
        prix_mensuel: 599,
        prix_annuel: 5990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.server, IMAGES.cyber10, IMAGES.cloud],
        tags: ['splunk', 'enterprise-security', 'siem', 'xdr', 'spl', 'gartner-leader'],
        saas: true as const,
    },
    {
        nom: 'Microsoft Sentinel',
        categorie: 'xdr',
        description_courte: 'Microsoft Sentinel : SIEM/SOAR cloud-native Azure avec 300+ connecteurs et détection ML.',
        description_longue: `## Microsoft Sentinel

SIEM/SOAR cloud-native de Microsoft, entièrement hébergé sur Azure.

### Fonctionnalités

- **300+ connecteurs** : Microsoft, AWS, Google, Cisco, Palo Alto
- **KQL** : langage de requête puissant pour hunting et règles de détection
- **UEBA** : profils d'entité et détection des anomalies comportementales
- **Automation rules + Playbooks** : orchestration via Azure Logic Apps`,
        prix_mensuel: 189,
        prix_annuel: 1890,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cloud, IMAGES.saas, IMAGES.soc],
        tags: ['microsoft', 'sentinel', 'siem', 'azure', 'soar', 'kql'],
        saas: true as const,
    },
    {
        nom: 'Elastic SIEM Cloud',
        categorie: 'xdr',
        description_courte: 'Elastic SIEM Cloud : SIEM open-source avec détection MITRE et ML intégré.',
        description_longue: `## Elastic SIEM Cloud

S'appuie sur Elasticsearch pour indexer et rechercher des volumes massifs de données de sécurité.

### Points forts

- **Ingest illimité** : ECS normalise tous les logs
- **900+ règles MITRE ATT&CK** open-source
- **ML Jobs** : modèles d'anomaly detection
- **Elastic Agent** : collecte unifiée logs + métriques + EDR
- **Timeline** : outil d'investigation drag-and-drop`,
        prix_mensuel: 159,
        prix_annuel: 1590,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.server, IMAGES.saas, IMAGES.cloud],
        tags: ['elastic', 'elasticsearch', 'siem', 'open-source', 'cloud', 'mitre'],
        saas: true as const,
    },
    {
        nom: 'Exabeam Fusion SIEM',
        categorie: 'xdr',
        description_courte: 'Exabeam Fusion : SIEM nouvelle génération centré sur le comportement utilisateur (UEBA).',
        description_longue: `## Exabeam Fusion SIEM

Pionnier du SIEM comportemental (UEBA-first), analysant les séquences d'activité des utilisateurs.

### Différenciateurs

- **Smart Timelines** : reconstruction automatique des sessions utilisateur
- **TDIR workflow** guidé (Threat Detection, Investigation and Response)
- **1500+ règles comportementales**
- **Case Management** : gestion des incidents avec SLA
- **Cloud Archive** : rétention froide à bas coût`,
        prix_mensuel: 399,
        prix_annuel: 3990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber1, IMAGES.soc, IMAGES.cloud],
        tags: ['exabeam', 'fusion', 'siem', 'ueba', 'tdir', 'comportemental'],
        saas: true as const,
    },
    {
        nom: 'Securonix Unified Defense SIEM',
        categorie: 'xdr',
        description_courte: 'Securonix : SIEM cloud-native avec UEBA, SOAR et threat content en abonnement tout compris.',
        description_longue: `## Securonix Unified Defense SIEM

SIEM cloud-native avec UEBA et SOAR intégrés, sur un modèle tarifaire tout compris (pas de coût à l'ingestion).

### Modèle tout compris

- **Ingestion illimitée** : pas de surprises sur la facture
- **UEBA natif** : analytics comportementaux
- **SOAR intégré** : 300+ playbooks préconfigurés
- **Threat Content** : règles gérées par Securonix Threat Labs
- **Long Data Retention** : Snowflake backend 1 à 3 ans`,
        prix_mensuel: 449,
        prix_annuel: 4490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber2, IMAGES.soc, IMAGES.cloud],
        tags: ['securonix', 'siem', 'ueba', 'soar', 'cloud-native', 'fedramp'],
        saas: true as const,
    },

    // ── SOC / Threat Intelligence (10) ────────────────────────────────────────
    {
        nom: 'Recorded Future Intelligence Cloud',
        categorie: 'soc',
        description_courte: 'Recorded Future : threat intelligence temps réel sur 3M+ sources web, dark web et technique.',
        description_longue: `## Recorded Future Intelligence Cloud

Plateforme de threat intelligence leader mondial, agrégant plus de 3 millions de sources en temps réel.

### Sources analysées

- Web clair, profond et dark web
- Forums cybercriminels, marchés illicites
- Réseaux sociaux et canaux Telegram
- Vulnérabilités (CVE, NVD, vendor advisories)
- Infrastructure malveillante (C2, domaines, IPs)`,
        prix_mensuel: 499,
        prix_annuel: 4990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber3, IMAGES.soc, IMAGES.cloud],
        tags: ['recorded-future', 'threat-intelligence', 'dark-web', 'ioc', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Flashpoint Intelligence Platform',
        categorie: 'soc',
        description_courte: 'Flashpoint : renseignement sur les menaces depuis des sources clandestines et dark web.',
        description_longue: `## Flashpoint Intelligence Platform

Spécialisé dans le renseignement issu des espaces clandestins (dark web, forums privés, applications chiffrées).

### Couverture unique

- **Forums cybercriminels privés** : accès à des forums non indexés
- **Marchés du dark web** : surveillance des ventes de données et outils
- **Canaux Telegram/Discord** : groupes hackivistes et ransomware
- **IOCs téléchargeables** : intégration SIEM directe`,
        prix_mensuel: 349,
        prix_annuel: 3490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber4, IMAGES.soc, IMAGES.incident],
        tags: ['flashpoint', 'threat-intelligence', 'dark-web', 'brand-protection', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Proofpoint Email Security TAP',
        categorie: 'soc',
        description_courte: 'Proofpoint TAP : protection email avancée contre phishing, BEC, malwares et imposteurs.',
        description_longue: `## Proofpoint Targeted Attack Protection (TAP)

Solution de protection email la plus avancée du marché, bloquant les attaques ciblées.

### Technologies incluses

- **Sandbox dynamique** : analyse des pièces jointes et URLs en temps réel
- **NexGen Threat Protection** : IA détectant le BEC sans malware
- **URL Defense** : réécriture et détonation des liens à la volée
- **TRAP** : retrait automatique des emails livrés`,
        prix_mensuel: 199,
        prix_annuel: 1990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber5, IMAGES.saas, IMAGES.incident],
        tags: ['proofpoint', 'tap', 'email', 'phishing', 'bec', 'sandbox'],
        saas: true as const,
    },
    {
        nom: 'Darktrace Enterprise',
        categorie: 'soc',
        description_courte: 'Darktrace : IA autonome qui apprend votre réseau et neutralise les menaces en temps réel.',
        description_longue: `## Darktrace Enterprise

Utilise l'intelligence artificielle non supervisée pour apprendre le comportement normal de chaque entité.

### Fonctionnalités

- **Self-Learning AI** : modèle probabiliste Bayesien par entité
- **Antigena** : réponse autonome en millisecondes
- **Cyber AI Analyst** : investigation automatisée
- **Couverture** : réseau, cloud, email, SaaS, OT/ICS, endpoints`,
        prix_mensuel: 599,
        prix_annuel: 5990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber6, IMAGES.soc, IMAGES.cloud],
        tags: ['darktrace', 'ia', 'autonome', 'reseau', 'anomaly-detection', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Tenable.io Vulnerability Management',
        categorie: 'soc',
        description_courte: 'Tenable.io : scan continu des vulnérabilités cloud avec priorisation VPR et CVSS.',
        description_longue: `## Tenable.io Vulnerability Management

Plateforme de gestion des vulnérabilités cloud la plus utilisée au monde.

### Fonctionnalités

- **Scan continu** : découverte et évaluation de tous les actifs (agents, sans agent, cloud)
- **VPR** (Vulnerability Priority Rating) : score de risque réel vs CVSS théorique
- **Lumin Exposure View** : score d'exposition par domaine métier
- **Intégrations** : ServiceNow, Jira, Splunk, AWS Security Hub

### Couverture

65 000+ plugins. AWS, Azure, GCP, containers Docker/K8s.`,
        prix_mensuel: 149,
        prix_annuel: 1490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.server, IMAGES.cloud, IMAGES.soc],
        tags: ['tenable', 'vulnerability-management', 'scan', 'vpr', 'cloud', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Qualys VMDR',
        categorie: 'soc',
        description_courte: 'Qualys VMDR : vulnerability management + détection + réponse sur une plateforme cloud unifiée.',
        description_longue: `## Qualys VMDR

Combine la découverte d'actifs, la gestion des vulnérabilités et la réponse en un workflow continu.

### Workflow intégré

1. **Asset Discovery** : inventaire automatique IT/OT/cloud
2. **Vulnerability Assessment** : scan agent ou sans agent
3. **TruRisk Scoring** : priorisation basée sur l'exploitabilité réelle
4. **Patch Orchestration** : déploiement de correctifs automatisé`,
        prix_mensuel: 249,
        prix_annuel: 2490,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.server, IMAGES.cloud, IMAGES.cyber7],
        tags: ['qualys', 'vmdr', 'vulnerability-management', 'patch', 'trurisk', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Rapid7 InsightVM',
        categorie: 'soc',
        description_courte: 'InsightVM : gestion des vulnérabilités en temps réel avec Risk Score et Remediation Workflow.',
        description_longue: `## Rapid7 InsightVM

Solution de vulnerability management avec gestion des risques en temps réel.

### Fonctionnalités clés

- **Live Dashboard** : vue temps réel du risque avec Risk Score dynamique
- **Remediation Projects** : attribution des correctifs aux équipes IT avec suivi SLA
- **Attacker Knowledge Base** : contexte d'exploitation de Rapid7 AttackerKB
- **Scan Engine distribué** : déploiement multi-sites sans VPN`,
        prix_mensuel: 199,
        prix_annuel: 1990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.cyber8, IMAGES.cloud, IMAGES.soc],
        tags: ['rapid7', 'insightvm', 'vulnerability-management', 'risk-score', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Palo Alto Cortex XSOAR',
        categorie: 'soc',
        description_courte: 'Cortex XSOAR : orchestration et automatisation SOAR de référence avec 900+ intégrations.',
        description_longue: `## Palo Alto Networks Cortex XSOAR

Plateforme SOAR leader du marché, permettant d'automatiser et d'orchestrer la réponse aux incidents.

### Fonctionnalités

- **Playbooks visuels** : conception drag-and-drop de workflows de réponse
- **900+ intégrations** : SIEM, EDR, Firewall, Ticketing, TI, Cloud
- **War Room** : collaboration en temps réel entre analystes SOC
- **ML Classification** : priorisation automatique des alertes
- **Case Management** : cycle de vie complet des incidents`,
        prix_mensuel: 799,
        prix_annuel: 7990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.soc, IMAGES.cyber9, IMAGES.cloud],
        tags: ['palo-alto', 'xsoar', 'soar', 'orchestration', 'automation', 'soc'],
        saas: true as const,
    },
    {
        nom: 'Swimlane SOAR Platform',
        categorie: 'soc',
        description_courte: 'Swimlane : SOAR low-code avec Turbine AI pour des playbooks intelligents et métriques ROI.',
        description_longue: `## Swimlane SOAR Platform

Moteur Turbine : IA qui apprend des actions des analystes pour suggérer et automatiser les réponses.

### Fonctionnalités

- **Turbine AI Engine** : suggestions intelligentes basées sur les cas historiques
- **Low-code Playbooks** : conception via glisser-déposer
- **Case Management** : tableaux de bord MTTR, MTTD, alertes par analyste
- **ROI Dashboard** : calcul du temps économisé par automatisation`,
        prix_mensuel: 699,
        prix_annuel: 6990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.soc, IMAGES.cyber10, IMAGES.cloud],
        tags: ['swimlane', 'soar', 'turbine-ai', 'low-code', 'roi', 'soc'],
        saas: true as const,
    },
    {
        nom: 'ServiceNow Security Operations (SecOps)',
        categorie: 'soc',
        description_courte: "ServiceNow SecOps : gestion des incidents et vulnérabilités intégrée à votre ITSM d'entreprise.",
        description_longue: `## ServiceNow Security Operations

Connecte la cybersécurité aux processus IT de l'entreprise via la plateforme ServiceNow.

### Modules

- **Security Incident Response (SIR)** : gestion des incidents sécurité
- **Vulnerability Response** : priorisation et suivi des correctifs via Change Management
- **Configuration Compliance** : contrôle de la conformité des configurations
- **AI-Assisted Triage** : classification automatique des alertes`,
        prix_mensuel: 899,
        prix_annuel: 8990,
        remise_annuelle_pct: 16.7,
        images: [IMAGES.saas, IMAGES.soc, IMAGES.cloud],
        tags: ['servicenow', 'secops', 'itsm', 'soar', 'vulnerability-response', 'soc'],
        saas: true as const,
    },

    // ── Produits Physiques (5) ─────────────────────────────────────────────────
    {
        nom: 'YubiKey 5C NFC',
        categorie: 'produit-physique',
        description_courte: 'Clé de sécurité matérielle FIDO2/U2F YubiKey 5C NFC — USB-C + NFC, anti-phishing certifié.',
        description_longue: `## YubiKey 5C NFC — Authentification forte sans compromis

La YubiKey 5C NFC est la clé de sécurité matérielle la plus utilisée au monde.

### Protocoles supportés

- **FIDO2 / WebAuthn** : MFA sans mot de passe
- **U2F** : second facteur universel
- **Smart Card (PIV)** : certificats X.509
- **OpenPGP** : chiffrement et signature email

### Compatibilité

USB-C + NFC. Windows, macOS, Linux, iOS, Android.`,
        prix: 65,
        stock: 250,
        images: [IMAGES.yubikey, IMAGES.usb],
        tags: ['yubikey', 'fido2', 'mfa', 'hardware-key', 'anti-phishing'],
    },
    {
        nom: 'YubiKey 5 NFC USB-A',
        categorie: 'produit-physique',
        description_courte: 'YubiKey 5 NFC USB-A — authentification FIDO2 matérielle pour postes de travail classiques.',
        description_longue: `## YubiKey 5 NFC USB-A

La version USB-A de la YubiKey 5 NFC, compatible avec l'immense majorité des ordinateurs.

### Protocoles identiques à la 5C NFC

- FIDO2/WebAuthn, U2F, Smart Card PIV, OpenPGP, TOTP
- NFC intégrée : tap sur smartphone Android ou iPhone
- Robuste : certifiée IP68, résiste aux chocs et à l'eau
- Aucune batterie, aucun driver à installer`,
        prix: 55,
        stock: 320,
        images: [IMAGES.usb, IMAGES.yubikey],
        tags: ['yubikey', 'fido2', 'usb-a', 'nfc', 'mfa', 'hardware-key'],
    },
    {
        nom: 'Pack 10 YubiKeys 5C NFC',
        categorie: 'produit-physique',
        description_courte: 'Pack entreprise 10 YubiKeys 5C NFC avec licence YubiEnterprise et support prioritaire.',
        description_longue: `## Pack 10 YubiKeys 5C NFC — Déploiement entreprise

Pack dédié aux déploiements PME/ETI avec remise volume et accès au programme YubiEnterprise Delivery.

### Contenu du pack

- 10 × YubiKey 5C NFC (USB-C + NFC)
- Accès YubiEnterprise Delivery (portail de gestion, remplacement garanti)
- Support prioritaire par email (réponse < 24h)
- Guide de déploiement CYNA (intégration AD, Azure AD, Okta)

### Économies

Remise de 15 % par rapport à l'achat à l'unité.`,
        prix: 550,
        stock: 40,
        images: [IMAGES.yubikey, IMAGES.usb],
        tags: ['yubikey', 'pack', 'entreprise', 'fido2', 'mfa'],
    },
    {
        nom: 'Google Titan Security Key USB-C',
        categorie: 'produit-physique',
        description_courte: 'Google Titan USB-C : clé FIDO2 certifiée FIPS 140-2, idéale pour les écosystèmes Google Workspace.',
        description_longue: `## Google Titan Security Key USB-C

Clé de sécurité matérielle conçue et certifiée par Google, adaptée aux organisations Google Workspace.

### Certifications

- **FIDO2 Level 1** certifié
- **FIPS 140-2** certifié (exigence fédérale US)
- Puce sécurisée Google avec firmware immuable

### Protocoles

FIDO2/WebAuthn, U2F. Port USB-C avec adaptateur USB-A inclus.`,
        prix: 35,
        stock: 150,
        images: [IMAGES.usb, IMAGES.saas],
        tags: ['google', 'titan', 'fido2', 'fips', 'usb-c', 'workspace'],
    },
    {
        nom: 'Nitrokey HSM 2',
        categorie: 'produit-physique',
        description_courte: 'Nitrokey HSM 2 : module de sécurité matériel open-source pour clés cryptographiques critiques.',
        description_longue: `## Nitrokey HSM 2 — HSM open-source

Hardware Security Module de poche, basé sur du hardware et firmware open-source.

### Cas d'usage

- **PKI interne** : autorité de certification racine stockée hors ligne
- **Signature de code** : clés de signature immuables pour CI/CD
- **Chiffrement secrets** : clés maîtres pour HashiCorp Vault
- **SSH certificates** : clés SSH physiquement protégées

### Spécifications

- RSA jusqu'à 4096 bits, ECC (P-256, P-384)
- Interface PKCS#11 standard — open-source sur GitHub`,
        prix: 89,
        stock: 80,
        images: [IMAGES.usb, IMAGES.server],
        tags: ['nitrokey', 'hsm', 'pkcs11', 'pki', 'open-source', 'cryptographie'],
    },
];

/* ------------------------------------------------------------------ */
/*                           SEED RUNNER                                */
/* ------------------------------------------------------------------ */

function slugify(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function buildImages(urls: string[]) {
    return urls.map((url, i) => ({
        id: uuidv4(),
        url,
        est_principale: i === 0,
        ordre: i,
    }));
}

async function seed() {
    const app = await NestFactory.create(AppModule);
    const dataSource = app.get(DataSource);
    const productRepository = dataSource.getRepository(ProductEntity);

    try {
        console.log('🌱 Starting Products & Services seed...');

        await productRepository.query('DELETE FROM products');
        console.log('🗑️  Existing products cleared.');

        /* ---- 4 Services ---- */
        let createdServices = 0;
        for (const svc of SERVICES) {
            const slug = slugify(svc.nom);
            const product = productRepository.create({
                id: uuidv4(),
                nom: svc.nom,
                description_courte: svc.description_courte,
                description_longue: svc.description_longue,
                categorie: svc.categorie,
                type: ProductType.SERVICE,
                tags: svc.tags,
                statut: ProductStatus.PUBLISHED,
                slug,
                meta_title: svc.nom.slice(0, 60),
                meta_description: svc.description_courte.slice(0, 160),
                keywords: svc.tags.join(', '),
                prix_mensuel: svc.prix_mensuel,
                prix_annuel: svc.prix_annuel,
                remise_annuelle_pct: svc.remise_annuelle_pct,
                periodicite: svc.periodicite,
                renouvellement_auto: true,
                demo_disponible: true,
                images: buildImages(svc.images),
            });
            await productRepository.save(product);
            createdServices++;
            console.log(`✅ Service [${createdServices}/4]: ${svc.nom}`);
        }

        /* ---- 35 SaaS + 5 Physical Products ---- */
        let createdProducts = 0;
        for (const p of PRODUCTS) {
            const slug = slugify(p.nom);
            const isSaas = 'saas' in p && p.saas;
            const product = productRepository.create({
                id: uuidv4(),
                nom: p.nom,
                description_courte: p.description_courte,
                description_longue: p.description_longue,
                categorie: p.categorie,
                type: isSaas ? ProductType.SERVICE : ProductType.PRODUCT,
                tags: p.tags,
                statut: ProductStatus.PUBLISHED,
                slug,
                meta_title: p.nom.slice(0, 60),
                meta_description: p.description_courte.slice(0, 160),
                keywords: p.tags.join(', '),
                ...(isSaas
                    ? {
                        prix_mensuel: (p as SaasSeed).prix_mensuel,
                        prix_annuel: (p as SaasSeed).prix_annuel,
                        remise_annuelle_pct: (p as SaasSeed).remise_annuelle_pct,
                        periodicite: ServicePeriodicity.MONTHLY,
                        renouvellement_auto: true,
                        demo_disponible: true,
                    }
                    : {
                        prix: (p as PhysicalSeed).prix,
                        stock: (p as PhysicalSeed).stock,
                        seuil_alerte_stock: Math.max(5, Math.floor((p as PhysicalSeed).stock * 0.1)),
                    }),
                images: buildImages(p.images),
            });
            await productRepository.save(product);
            createdProducts++;
            console.log(`✅ ${isSaas ? 'SaaS' : 'Physique'} [${createdProducts}]: ${p.nom}`);
        }

        const saasCount = PRODUCTS.filter(p => 'saas' in p).length;
        const physicalCount = PRODUCTS.filter(p => !('saas' in p)).length;
        console.log('');
        console.log('🎉 Seed completed successfully!');
        console.log(`   - ${createdServices} services vedettes created`);
        console.log(`   - ${saasCount} abonnements SaaS created`);
        console.log(`   - ${physicalCount} produits physiques created`);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed();

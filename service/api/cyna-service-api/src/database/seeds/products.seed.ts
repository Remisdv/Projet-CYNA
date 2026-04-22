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
        categorie: ProductCategory.SOC,
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
        categorie: ProductCategory.EDR,
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
        categorie: ProductCategory.XDR,
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
        categorie: ProductCategory.SERVICE,
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
/*                        PRODUCTS (40 items)                          */
/* ------------------------------------------------------------------ */

interface ProductSeed {
    nom: string;
    categorie: ProductCategory;
    description_courte: string;
    description_longue: string;
    prix: number;
    stock: number;
    stock_illimite: 'oui' | 'non';
    images: string[];
    tags: string[];
}

const PRODUCTS: ProductSeed[] = [
    /* ============= HARDWARE SECURITY (10) ============= */
    {
        nom: 'YubiKey 5C NFC',
        categorie: ProductCategory.SERVICE,
        description_courte: "Clé d'authentification matérielle FIDO2/U2F avec USB-C et NFC.",
        description_longue: `## L'authentification multifacteur la plus robuste

La **YubiKey 5C NFC** est une clé de sécurité matérielle qui élimine les attaques par phishing grâce à la cryptographie à clé publique.

### Caractéristiques

- **Connectique** : USB-C + NFC (Android & iPhone)
- **Protocoles** : FIDO2/WebAuthn, U2F, Smart Card (PIV), OpenPGP, OTP, OATH-TOTP/HOTP
- **Étanchéité** : IP68, écrasement jusqu'à 30 kg
- **Pas de batterie** : aucune dépendance d'alimentation

### Compatibilité

Compatible avec Google, Microsoft, Apple, AWS, GitHub, Dropbox, 1Password, et **800+ services**.`,
        prix: 65,
        stock: 250,
        stock_illimite: 'non',
        images: [IMAGES.yubikey, IMAGES.usb],
        tags: ['yubikey', 'mfa', 'fido2', 'authentification'],
    },
    {
        nom: 'YubiKey 5 NFC',
        categorie: ProductCategory.SERVICE,
        description_courte: "Clé matérielle FIDO2/U2F avec USB-A et NFC.",
        description_longue: `## La référence en authentification matérielle

Version USB-A de la célèbre YubiKey 5, avec NFC pour usage mobile. Idéale pour les ordinateurs équipés de ports USB classiques.

### Inclus

- 1 YubiKey 5 NFC
- Documentation de mise en route
- Garantie constructeur 2 ans

### Recommandée pour

- Comptes administrateurs (sysadmin, DevOps)
- Accès cloud critiques (AWS root, Azure global admin)
- Protection des accès email professionnels`,
        prix: 55,
        stock: 320,
        stock_illimite: 'non',
        images: [IMAGES.usb, IMAGES.yubikey],
        tags: ['yubikey', 'mfa', 'usb-a', 'fido2'],
    },
    {
        nom: 'Pack 5 YubiKeys 5C NFC',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Lot de 5 YubiKeys pour équiper une équipe.',
        description_longue: `## Équipez votre équipe en une commande

Pack de **5 YubiKeys 5C NFC** prêtes à l'emploi pour une petite équipe ou pour assurer la redondance (clé principale + clé de secours).

### Bonnes pratiques

> **Toujours commander au minimum 2 clés par utilisateur** : une principale et une de secours stockée en lieu sûr. La perte d'une clé sans secours peut bloquer définitivement les accès.

### Économie

Tarif unitaire dégressif : économie de **40 €** par rapport à l'achat à l'unité.`,
        prix: 285,
        stock: 60,
        stock_illimite: 'non',
        images: [IMAGES.yubikey],
        tags: ['yubikey', 'pack', 'équipe', 'mfa'],
    },
    {
        nom: 'Firewall NextGen Cyna FW-200',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Pare-feu nouvelle génération pour PME, débit 2 Gbps.',
        description_longue: `## Protégez votre périmètre réseau

Le **Cyna FW-200** est un pare-feu nouvelle génération conçu pour les PME de 20 à 200 collaborateurs.

### Caractéristiques techniques

| Spécification | Valeur |
|---------------|--------|
| Débit firewall | 2 Gbps |
| Débit IPS | 1 Gbps |
| Sessions simultanées | 500 000 |
| Interfaces | 8× GbE, 2× SFP |
| Format | Rack 1U |

### Fonctionnalités sécurité

- Inspection deep packet (DPI)
- IPS avec signatures mises à jour quotidiennement
- Filtrage URL et applicatif
- VPN IPsec & SSL (250 tunnels simultanés)
- Sandboxing intégré

### Inclus

- Boîtier matériel + alimentation redondante
- Licence de mise à jour 1 an
- Support technique 8h/18h en français`,
        prix: 2490,
        stock: 25,
        stock_illimite: 'non',
        images: [IMAGES.firewall, IMAGES.rack, IMAGES.cables],
        tags: ['firewall', 'pare-feu', 'réseau', 'ngfw', 'pme'],
    },
    {
        nom: 'Firewall NextGen Cyna FW-500',
        categorie: ProductCategory.SERVICE,
        description_courte: "Pare-feu d'entreprise haute performance, débit 10 Gbps.",
        description_longue: `## Performance et sécurité pour grandes organisations

Le **Cyna FW-500** offre une performance de **10 Gbps** en inspection complète, adapté aux entreprises de plus de 500 collaborateurs et aux datacenters.

### Spécifications

- 10 Gbps en inspection IPS active
- 2 millions de sessions simultanées
- 16 interfaces 10 GbE SFP+
- HA (High Availability) actif/passif natif
- Format rack 2U avec alimentation redondante

### Fonctionnalités avancées

- **Cyber AI Engine** : détection comportementale par IA
- **Microsegmentation** Est-Ouest
- **SD-WAN** intégré (jusqu'à 50 sites)
- **Zero Trust Network Access** (ZTNA)`,
        prix: 8990,
        stock: 12,
        stock_illimite: 'non',
        images: [IMAGES.firewall, IMAGES.rack, IMAGES.server],
        tags: ['firewall', 'enterprise', '10gbps', 'ztna', 'sd-wan'],
    },
    {
        nom: 'Switch Manageable 24 ports PoE+',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Switch L2+ 24 ports gigabit avec PoE+ 370W.',
        description_longue: `## Connectivité sécurisée pour bureaux et caméras

Switch managé **24 ports gigabit PoE+** avec budget total de 370W, idéal pour alimenter téléphones IP, points d'accès Wi-Fi et caméras de surveillance.

### Sécurité

- 802.1X (authentification par port)
- DHCP snooping et ARP inspection
- Storm control et port security
- VLAN privés et tagged

### Gestion

Interface web, CLI, SNMP v2/v3, syslog, RADIUS/TACACS+.`,
        prix: 690,
        stock: 45,
        stock_illimite: 'non',
        images: [IMAGES.ethernet, IMAGES.network],
        tags: ['switch', 'poe', 'réseau', 'managé'],
    },
    {
        nom: 'Point d\'accès Wi-Fi 6 Enterprise',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Borne Wi-Fi 6 (802.11ax) tri-bande 5400 Mbps.',
        description_longue: `## Wi-Fi haute densité pour environnements professionnels

Point d'accès **Wi-Fi 6** tri-bande compatible jusqu'à **300 utilisateurs simultanés**.

### Performance

- Tri-bande 2,4 GHz + 5 GHz + 5 GHz
- Débit cumulé jusqu'à 5400 Mbps
- MU-MIMO 4×4, OFDMA, BSS Coloring
- WPA3-Enterprise

### Sécurité

- Détection d'intrusions sans fil (WIDS)
- Captive portal avec authentification AD/LDAP
- Isolation des clients invités`,
        prix: 420,
        stock: 80,
        stock_illimite: 'non',
        images: [IMAGES.network, IMAGES.router],
        tags: ['wifi', 'wifi6', 'access-point', 'wpa3'],
    },
    {
        nom: 'Boîtier HSM USB pour signature électronique',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Module de sécurité matériel certifié FIPS 140-2 niveau 3.',
        description_longue: `## La sécurité de vos clés privées

**Hardware Security Module** USB certifié **FIPS 140-2 niveau 3** pour le stockage et l'utilisation de clés cryptographiques sensibles.

### Cas d'usage

- Signature électronique qualifiée (eIDAS)
- Stockage de certificats CA
- Génération sécurisée de clés
- Opérations cryptographiques (RSA 4096, ECC P-521)

### Inclus

- HSM USB
- Logiciel d'administration Windows/Linux
- 2 cartes administrateur
- Documentation de déploiement`,
        prix: 1490,
        stock: 15,
        stock_illimite: 'non',
        images: [IMAGES.usb, IMAGES.encryption],
        tags: ['hsm', 'fips', 'signature', 'eidas', 'crypto'],
    },
    {
        nom: 'Coffre-fort numérique offline (Air-Gap)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Stockage isolé pour secrets critiques (clés racine, mots de passe maître).',
        description_longue: `## Le dernier rempart pour vos secrets les plus sensibles

Boîtier physique dédié au stockage **air-gap** (totalement déconnecté du réseau) de vos secrets les plus critiques.

### Inclus

- Boîtier sécurisé avec écran tactile
- Saisie via clavier dédié (anti-keylogger)
- Chiffrement AES-256 + Argon2
- Slot pour carte microSD chiffrée
- Batterie autonome 8h

### Idéal pour

- Clés de chiffrement maître
- Seed wallets crypto
- Mots de passe de comptes break-glass
- Codes de récupération`,
        prix: 890,
        stock: 30,
        stock_illimite: 'non',
        images: [IMAGES.encryption, IMAGES.cyber7],
        tags: ['air-gap', 'offline', 'coffre', 'secrets'],
    },
    {
        nom: 'Caméra IP de surveillance 4K avec analyse IA',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Caméra extérieure 4K avec détection intelligente et stockage chiffré.',
        description_longue: `## Vidéosurveillance intelligente et conforme RGPD

Caméra IP **4K Ultra HD** avec analyse vidéo intelligente embarquée et chiffrement de bout en bout des flux.

### Fonctionnalités

- Capteur 4K Sony Starvis (vision nocturne couleur)
- Détection humaine, véhicule, intrusion par IA
- Anti-vandale IK10, étanche IP67
- Chiffrement AES-256 du flux
- Conformité RGPD (anonymisation faciale optionnelle)

### Connectivité

PoE+ ou Wi-Fi 5, ONVIF Profile S/T/G.`,
        prix: 380,
        stock: 100,
        stock_illimite: 'non',
        images: [IMAGES.cyber3, IMAGES.network],
        tags: ['caméra', 'vidéosurveillance', '4k', 'rgpd', 'ia'],
    },

    /* ============= LICENCES LOGICIELLES (10) ============= */
    {
        nom: 'Antivirus Cyna AV - 1 poste / 1 an',
        categorie: ProductCategory.EDR,
        description_courte: 'Licence antivirus next-gen pour poste Windows/Mac/Linux.',
        description_longue: `## Protection essentielle pour vos postes

Licence **antivirus next-gen** valable 1 an pour 1 poste de travail.

### Protection

- Antivirus signatures + heuristique
- Anti-ransomware avec sauvegarde
- Pare-feu personnel
- Protection web (anti-phishing)
- Contrôle USB

### Compatibilité

Windows 10/11, macOS 12+, Linux Ubuntu/Debian/RHEL.`,
        prix: 39,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.cyber8, IMAGES.laptop],
        tags: ['antivirus', 'licence', '1-poste', 'edr'],
    },
    {
        nom: 'Antivirus Cyna AV - Pack 10 postes / 1 an',
        categorie: ProductCategory.EDR,
        description_courte: 'Pack de 10 licences antivirus pour PME.',
        description_longue: `## Protégez votre PME en un achat

Pack de **10 licences** antivirus avec console d'administration cloud incluse.

### Avantages

- Console centralisée pour gérer les 10 postes
- Reporting hebdomadaire automatique
- Déploiement par GPO ou MDM
- Économie de 25% par rapport à l'achat unitaire`,
        prix: 290,
        stock: 500,
        stock_illimite: 'oui',
        images: [IMAGES.cyber8, IMAGES.workspace],
        tags: ['antivirus', 'pack', 'pme', 'console'],
    },
    {
        nom: 'Cyna Password Manager - Licence 1 an',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Gestionnaire de mots de passe chiffré E2E pour 1 utilisateur.',
        description_longue: `## Vos mots de passe en sécurité

Gestionnaire de mots de passe avec chiffrement **end-to-end AES-256** et architecture **zero-knowledge** : nous ne pouvons pas voir vos données.

### Fonctionnalités

- Coffre illimité (mots de passe, notes, cartes, identifiants)
- Synchronisation multi-appareils (Win/Mac/Linux/iOS/Android)
- Partage sécurisé entre utilisateurs
- Générateur de mots de passe (jusqu'à 128 caractères)
- Audit de sécurité (mots de passe faibles, dupliqués, compromis)
- Détection de fuites (HIBP intégré)

### Inclus

- Extensions navigateur (Chrome, Firefox, Edge, Safari)
- Application desktop et mobile
- Support email`,
        prix: 49,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.password, IMAGES.cyber7],
        tags: ['password-manager', 'coffre', 'e2e', 'zero-knowledge'],
    },
    {
        nom: 'Cyna Password Manager - Équipe (10 utilisateurs)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Gestionnaire de mots de passe pour équipes avec coffres partagés.',
        description_longue: `## Le password manager pensé pour les équipes

Édition équipe pour **10 utilisateurs** avec coffres partagés, gestion granulaire des permissions et audit complet.

### Fonctionnalités équipe

- Coffres partagés par équipe / projet / client
- Permissions par dossier (lecture, écriture, partage)
- Provisionnement SCIM (Azure AD, Okta, Google Workspace)
- SSO SAML 2.0
- Logs d'audit exportables (SIEM-ready)
- Récupération d'accès en cas de départ employé

### Console d'administration

Vue d'ensemble en temps réel, alertes de sécurité, rapports de conformité.`,
        prix: 390,
        stock: 200,
        stock_illimite: 'oui',
        images: [IMAGES.password, IMAGES.workspace],
        tags: ['password-manager', 'équipe', 'sso', 'scim'],
    },
    {
        nom: 'VPN Cyna Private Access - 1 an',
        categorie: ProductCategory.SERVICE,
        description_courte: 'VPN entreprise avec ZTNA et split-tunneling.',
        description_longue: `## Accès distant sécurisé moderne

VPN d'entreprise basé sur **WireGuard** avec contrôles **Zero Trust** et orchestration cloud.

### Caractéristiques

- Protocole WireGuard (chiffrement ChaCha20-Poly1305)
- Authentification MFA obligatoire
- Split-tunneling configurable par groupe
- Kill-switch automatique
- Présence dans 60 pays

### Cas d'usage

- Télétravail sécurisé
- Accès aux ressources internes (intranet, fichiers, ERP)
- Contournement de censure géographique pour la veille`,
        prix: 79,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.vpn, IMAGES.cloud],
        tags: ['vpn', 'wireguard', 'ztna', 'télétravail'],
    },
    {
        nom: 'Suite chiffrement disque BitLocker Pro',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Gestion centralisée du chiffrement BitLocker avec récupération.',
        description_longue: `## Gérez le chiffrement de tous vos postes

Console centralisée pour déployer, surveiller et récupérer les clés **BitLocker** sur l'ensemble de votre parc.

### Fonctionnalités

- Déploiement automatisé via GPO/Intune
- Stockage sécurisé des clés de récupération
- Conformité RGPD/HDS (vol/perte de portable)
- Reporting d'état du chiffrement par poste
- Rotation automatique des clés de récupération

### Tarification

Licence valable pour 1 poste pendant 1 an.`,
        prix: 19,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.encryption, IMAGES.laptop],
        tags: ['chiffrement', 'bitlocker', 'rgpd', 'hds'],
    },
    {
        nom: 'Cyna Email Security - 1 boîte / 1 an',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Anti-phishing, anti-spam et anti-malware pour Microsoft 365.',
        description_longue: `## Une couche de sécurité supplémentaire pour vos emails

Service **anti-phishing avancé** qui s'intègre nativement à Microsoft 365 et Google Workspace pour bloquer les attaques avant qu'elles n'atteignent vos utilisateurs.

### Protection

- Sandbox d'analyse des pièces jointes
- Réécriture des URLs (analyse à chaque clic)
- Détection BEC (Business Email Compromise) par IA
- Anti-spoofing (DMARC, DKIM, SPF)
- Quarantaine utilisateur en self-service

### Métriques

Bloque **99,9%** des phishing connus et **97%** des phishing zero-day grâce à notre IA.`,
        prix: 24,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.cyber8, IMAGES.workspace],
        tags: ['email', 'anti-phishing', 'microsoft365', 'bec'],
    },
    {
        nom: 'Backup Cloud Chiffré - 100 Go / 1 an',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Sauvegarde cloud chiffrée E2E avec versioning illimité.',
        description_longue: `## Sauvegardez sereinement, restaurez rapidement

**100 Go de stockage cloud chiffré end-to-end** avec versioning illimité et conservation 90 jours.

### Garanties

- Chiffrement AES-256 côté client (zero-knowledge)
- Réplication 3 datacenters européens (souveraineté)
- Conformité RGPD, HDS, ISO 27001
- Restauration granulaire (fichier, dossier, version)
- Anti-ransomware (immuabilité 30 jours)

### Compatibilité

Agents Windows/Mac/Linux + connecteurs Microsoft 365, Google Workspace, Dropbox, NAS Synology/QNAP.`,
        prix: 89,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.backup, IMAGES.cloud],
        tags: ['backup', 'cloud', 'rgpd', 'anti-ransomware'],
    },
    {
        nom: 'SIEM Cyna - Édition Starter (5 sources)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'SIEM cloud pour PME avec 5 sources de logs.',
        description_longue: `## La détection à la portée des PME

**SIEM cloud-native** pré-configuré, idéal pour les PME qui veulent centraliser leurs logs et détecter les incidents sans expertise interne.

### Inclus

- Collecte de **5 sources** (firewall, AD, M365, EDR, applicatif)
- 30 jours de rétention chaude, 1 an froide
- 200 règles de détection prêtes à l'emploi
- Alerting email + Slack + Teams
- Dashboards customisables
- API REST pour intégrations

### Évolutif

Ajoutez des sources et de la rétention selon vos besoins.`,
        prix: 590,
        stock: 100,
        stock_illimite: 'oui',
        images: [IMAGES.cyber10, IMAGES.saas],
        tags: ['siem', 'logs', 'pme', 'cloud'],
    },
    {
        nom: 'WAF Cyna - 1 application web',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Web Application Firewall managé pour 1 site web.',
        description_longue: `## Protection des applications web

**Web Application Firewall** managé qui s'interpose devant votre site pour bloquer les attaques **OWASP Top 10** et les bots malveillants.

### Inclus

- Protection contre XSS, SQLi, RCE, LFI, etc.
- Bot management (CAPTCHA dynamique, fingerprinting)
- Rate limiting et anti-DDoS L7
- CDN intégré pour la performance
- Certificat SSL/TLS managé (Let's Encrypt)
- Logs détaillés et exportables

### Idéal pour

Sites WordPress, Drupal, Magento, Symfony, applications SPA, APIs REST/GraphQL.`,
        prix: 190,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.cyber6, IMAGES.cloud],
        tags: ['waf', 'owasp', 'ddos', 'bot'],
    },

    /* ============= AUDITS & CONFORMITÉ (8) ============= */
    {
        nom: 'Audit RGPD Express',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Diagnostic RGPD en 5 jours avec plan d\'action priorisé.',
        description_longue: `## Mettez-vous en conformité rapidement

Audit **RGPD express** de votre organisation avec rapport détaillé et plan d'action priorisé en **5 jours ouvrés**.

### Ce que nous auditons

- Cartographie des traitements (registre)
- Bases légales et consentements
- Information des personnes (mentions, politique vie privée)
- Sécurité technique et organisationnelle
- Sous-traitants et transferts hors UE
- Droits des personnes (accès, effacement, portabilité)

### Livrables

- Rapport d'audit détaillé (50+ pages)
- Plan d'action priorisé (quick wins, court terme, long terme)
- Modèles de documents (registre, mentions, contrats DPA)
- Restitution orale (2h)`,
        prix: 4900,
        stock: 20,
        stock_illimite: 'non',
        images: [IMAGES.audit, IMAGES.compliance],
        tags: ['rgpd', 'audit', 'conformité', 'gdpr'],
    },
    {
        nom: 'Audit RGPD Approfondi',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Audit RGPD complet sur 4 semaines avec accompagnement.',
        description_longue: `## Une mise en conformité durable

Audit RGPD **approfondi** sur **4 semaines** incluant entretiens, analyse documentaire, tests techniques et accompagnement à la mise en conformité.

### Périmètre

- Audit de l'ensemble des traitements (jusqu'à 50)
- Analyses d'impact (PIA) pour les traitements à risque
- Audit de sécurité technique (pentests légers)
- Revue contractuelle (sous-traitants, clients, partenaires)
- Plan de réponse aux violations de données

### Livrables additionnels

- DPIA pour 3 traitements
- Procédures internes (gestion des droits, notifications CNIL)
- Charte informatique mise à jour
- Formation DPO (1 jour)`,
        prix: 14900,
        stock: 10,
        stock_illimite: 'non',
        images: [IMAGES.audit, IMAGES.compliance, IMAGES.report],
        tags: ['rgpd', 'audit-approfondi', 'pia', 'dpo'],
    },
    {
        nom: 'Audit ISO 27001 Pré-certification',
        categorie: ProductCategory.SERVICE,
        description_courte: "Préparation à la certification ISO 27001 (gap analysis).",
        description_longue: `## Préparez votre certification sereinement

**Gap analysis** complet par rapport aux exigences ISO/IEC 27001:2022 avec plan de mise en conformité.

### Méthodologie

1. Workshop de cadrage (périmètre SMSI)
2. Revue documentaire et entretiens (10 jours)
3. Évaluation des 93 mesures de l'Annexe A
4. Plan d'action priorisé
5. Restitution

### Livrables

- Rapport de gap analysis détaillé
- Matrice de conformité Annexe A
- Plan de mise en conformité chiffré
- Recommandations sur les 14 domaines de la norme`,
        prix: 19900,
        stock: 8,
        stock_illimite: 'non',
        images: [IMAGES.audit, IMAGES.report],
        tags: ['iso27001', 'certification', 'smsi', 'gap-analysis'],
    },
    {
        nom: 'Test d\'intrusion externe (Black Box)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Pentest externe de votre périmètre exposé sur Internet.',
        description_longue: `## Identifiez vos failles avant les attaquants

**Test d'intrusion en boîte noire** de votre périmètre exposé sur Internet, mené par nos pentesteurs certifiés OSCP/CEH.

### Méthodologie

1. **Reconnaissance** : OSINT, énumération de surface d'attaque
2. **Scan** : ports, services, technologies
3. **Énumération** : utilisateurs, vhosts, sous-domaines
4. **Exploitation** : tentatives d'intrusion sur les vulnérabilités identifiées
5. **Post-exploitation** : pivoting si autorisé

### Livrables

- Rapport exécutif (3 pages)
- Rapport technique détaillé (50+ pages)
- Preuves de concept (PoC) pour chaque vulnérabilité
- Plan de remédiation priorisé (CVSS)
- Restitution orale (1h)
- **Re-test gratuit** après remédiation (sous 90 jours)

### Périmètre

Jusqu'à **20 IPs/domaines**.`,
        prix: 7900,
        stock: 30,
        stock_illimite: 'non',
        images: [IMAGES.cyber5, IMAGES.cyber9],
        tags: ['pentest', 'intrusion', 'oscp', 'externe'],
    },
    {
        nom: 'Test d\'intrusion interne (Grey Box)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Pentest interne en simulation d\'employé malveillant ou compromis.',
        description_longue: `## Évaluez votre résistance aux attaques internes

Test d'intrusion **interne** simulant un employé malveillant ou un poste compromis, pour évaluer la propagation latérale possible.

### Scénarios couverts

- Compromission Active Directory (Kerberoasting, AS-REP, GoldenTicket)
- Élévation de privilèges
- Mouvements latéraux (Pass-the-Hash, RDP, WinRM)
- Exfiltration de données
- Persistance

### Inclus

- 5 jours d'audit on-site ou via VPN
- Rapport et plan de remédiation
- Restitution avec démonstration des chemins d'attaque
- Re-test gratuit sous 90 jours`,
        prix: 9900,
        stock: 25,
        stock_illimite: 'non',
        images: [IMAGES.cyber5, IMAGES.cyber4],
        tags: ['pentest', 'interne', 'active-directory', 'grey-box'],
    },
    {
        nom: 'Audit de code source applicatif',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Revue de code orientée sécurité (SAST manuel).',
        description_longue: `## La qualité de votre code, vue par des experts sécurité

Audit manuel de votre code source par des experts en sécurité applicative, complétant les outils SAST automatisés.

### Méthodologie

- Analyse OWASP ASVS niveau 2 ou 3
- Revue ciblée des fonctions critiques (auth, crypto, paiement)
- Détection des vulnérabilités logiques (race conditions, IDOR)
- Vérification des dépendances (SCA)

### Langages couverts

JavaScript/TypeScript, Python, Go, Java, C#, PHP, Ruby, Rust.

### Tarif

Forfait jusqu'à **10 000 lignes de code**. Au-delà, devis sur mesure.`,
        prix: 6900,
        stock: 20,
        stock_illimite: 'non',
        images: [IMAGES.cyber2, IMAGES.cyber8],
        tags: ['audit-code', 'sast', 'owasp', 'asvs'],
    },
    {
        nom: 'Audit Cloud AWS / Azure / GCP',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Audit de configuration et sécurité de votre cloud.',
        description_longue: `## Vérifiez la sécurité de votre cloud

Audit complet de votre environnement cloud avec recommandations basées sur les **CIS Benchmarks** et les bonnes pratiques de l'éditeur (AWS Well-Architected, Azure CAF, Google CRE).

### Vérifications

- IAM et gestion des identités
- Configuration réseau (VPC, NSG, firewalls)
- Chiffrement (at-rest, in-transit, KMS)
- Logging et monitoring
- Backup et plan de reprise
- Coûts et quotas

### Livrables

- Rapport d'audit avec score CIS
- Plan de remédiation priorisé
- Scripts/IaC de remédiation pour les quick wins`,
        prix: 5900,
        stock: 30,
        stock_illimite: 'non',
        images: [IMAGES.cloud, IMAGES.audit],
        tags: ['audit', 'cloud', 'aws', 'azure', 'gcp', 'cis'],
    },
    {
        nom: 'Analyse forensique post-incident',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Investigation forensique après compromission ou suspicion.',
        description_longue: `## Comprendre ce qui s'est passé pour ne pas le revivre

Investigation forensique complète après un incident de sécurité ou une suspicion de compromission.

### Méthodologie

1. **Acquisition** : copie disque/mémoire selon les règles de l'art
2. **Analyse** : timeline, IOCs, persistance, exfiltration
3. **Reconstruction** : chemin d'attaque, périmètre touché
4. **Reporting** : rapport recevable juridiquement

### Inclus

- Intervention sous 24h ouvrées
- Jusqu'à 5 machines analysées
- Rapport forensique détaillé
- Lettre de notification CNIL (si données personnelles)
- Recommandations de remédiation

### Mode urgence

Disponible en mode **war room** 7j/7 pour les incidents critiques (devis spécifique).`,
        prix: 8900,
        stock: 15,
        stock_illimite: 'non',
        images: [IMAGES.forensics, IMAGES.incident],
        tags: ['forensique', 'incident', 'investigation', 'dfir'],
    },

    /* ============= FORMATIONS (8) ============= */
    {
        nom: 'Formation Sensibilisation Cybersécurité (e-learning)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Module e-learning de 2h pour sensibiliser tous vos collaborateurs.',
        description_longue: `## Vos employés, premiers maillons de la sécurité

Module **e-learning** interactif de **2 heures** pour former l'ensemble de vos collaborateurs aux bonnes pratiques de cybersécurité.

### Programme

1. Les menaces cyber actuelles (10 min)
2. Reconnaître un email de phishing (20 min)
3. Mots de passe et authentification (20 min)
4. Mobilité et télétravail sécurisés (20 min)
5. Données personnelles et RGPD (20 min)
6. Que faire en cas d'incident ? (15 min)
7. Quiz final + attestation (15 min)

### Modalités

- Plateforme SCORM compatible avec votre LMS
- Accessible 24/7 pendant 1 an
- Multi-langue : FR, EN, ES, DE
- Reporting de complétion

### Tarification

Forfait par utilisateur, valide 1 an.`,
        prix: 25,
        stock: 1000,
        stock_illimite: 'oui',
        images: [IMAGES.elearning, IMAGES.training],
        tags: ['formation', 'sensibilisation', 'e-learning', 'phishing'],
    },
    {
        nom: 'Campagne de phishing simulé',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Simulation de phishing personnalisée avec rapport et formation.',
        description_longue: `## Mesurez la vigilance de vos équipes

**Campagne de phishing simulé** réaliste pour évaluer la maturité de vos collaborateurs et les former en condition réelle.

### Inclus

- Workshop de cadrage (scénarios, périmètre)
- Création de templates personnalisés
- Envoi à jusqu'à **500 destinataires**
- Page de "leçon" affichée aux victimes (formation flash)
- Rapport détaillé (taux d'ouverture, clics, soumissions de credentials)
- Restitution orale + recommandations

### Bonnes pratiques

> Nous recommandons de réaliser **3 à 4 campagnes par an** avec des scénarios variés pour mesurer l'évolution.`,
        prix: 1990,
        stock: 100,
        stock_illimite: 'oui',
        images: [IMAGES.cyber5, IMAGES.cyber8],
        tags: ['phishing', 'simulation', 'sensibilisation', 'campagne'],
    },
    {
        nom: 'Formation Pentest Web - 5 jours',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Formation intensive aux tests d\'intrusion web (OWASP Top 10).',
        description_longue: `## Devenez pentester web

Formation intensive de **5 jours** pour maîtriser les tests d'intrusion d'applications web, basée sur l'OWASP Top 10 et les méthodologies PTES.

### Programme jour par jour

- **J1** : Reconnaissance, fingerprinting, énumération
- **J2** : Injection (SQL, NoSQL, Command, LDAP)
- **J3** : XSS, CSRF, SSRF, désérialisation
- **J4** : Authentification, sessions, IDOR, contrôle d'accès
- **J5** : SSL/TLS, API REST/GraphQL, projet pratique noté

### Modalités

- Inter-entreprise ou intra
- 6 à 10 stagiaires
- Lab dédié pour chaque participant
- Attestation + certificat de réussite

### Prérequis

Connaissances réseau (TCP/IP), HTTP, bases en programmation (Python recommandé).`,
        prix: 3490,
        stock: 50,
        stock_illimite: 'oui',
        images: [IMAGES.training, IMAGES.cyber9],
        tags: ['formation', 'pentest', 'web', 'owasp', '5-jours'],
    },
    {
        nom: 'Formation SOC Analyst Niveau 1 - 5 jours',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Devenez analyste SOC niveau 1 en 5 jours.',
        description_longue: `## Lancez votre carrière en cybersécurité

Formation pratique pour devenir **analyste SOC niveau 1**, basée sur les outils du marché (Splunk, Wazuh, MITRE ATT&CK).

### Compétences acquises

- Lecture et corrélation de logs
- Triage et qualification d'alertes
- Investigation initiale (timeline, IOCs)
- Utilisation d'un SIEM
- Communication avec le N2 et l'IT

### Méthode pédagogique

- 30% théorie, 70% pratique sur SOC simulé
- Études de cas réels anonymisés
- Évaluation finale en condition (4h)

### Débouchés

Junior SOC analyst, IT support sécurité, MSSP analyst.`,
        prix: 2990,
        stock: 50,
        stock_illimite: 'oui',
        images: [IMAGES.soc, IMAGES.cyber10],
        tags: ['formation', 'soc', 'analyste', 'siem', 'mitre'],
    },
    {
        nom: 'Formation Réponse à Incident - 3 jours',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Maîtrisez la gestion d\'incident de sécurité.',
        description_longue: `## Préparez vos équipes à l'inévitable

Formation de **3 jours** pour structurer et entraîner votre cellule de crise cyber.

### Programme

- **J1** : Méthodologies (NIST, SANS), CSIRT, organisation
- **J2** : Outils techniques (forensique, EDR, IOC), ateliers pratiques
- **J3** : Exercice de crise grandeur nature (simulation 4h)

### Public cible

- RSSI et équipes sécurité
- Responsables IT
- Membres de cellule de crise

### Inclus

- Kit de procédures de réponse à incident (template)
- Plan de communication de crise (template)
- Carnet de bord d'incident (Excel + Notion)`,
        prix: 2490,
        stock: 50,
        stock_illimite: 'oui',
        images: [IMAGES.incident, IMAGES.training],
        tags: ['formation', 'csirt', 'incident', 'crise', 'nist'],
    },
    {
        nom: 'Formation RSSI - 5 jours',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Maîtrisez le rôle de RSSI dans une organisation.',
        description_longue: `## Prenez les commandes de la sécurité

Formation pour **futurs RSSI** ou RSSI récemment nommés, couvrant la gouvernance, le management des risques, la conformité et les aspects techniques essentiels.

### Programme

- **J1** : Gouvernance, ISO 27001, NIST CSF, gestion des risques
- **J2** : Architecture sécurité, défense en profondeur, Zero Trust
- **J3** : Conformité (RGPD, NIS2, DORA), audits
- **J4** : Management d'équipe, budget, indicateurs (KRI/KPI)
- **J5** : Gestion de crise, communication exécutive, board reporting

### Inclus

- Tableau de bord RSSI (template Excel)
- Modèles de politiques (PSSI, charte, procédures)
- Accès à notre communauté de RSSI (1 an)`,
        prix: 4490,
        stock: 30,
        stock_illimite: 'oui',
        images: [IMAGES.training, IMAGES.compliance],
        tags: ['formation', 'rssi', 'gouvernance', 'iso27001', 'nis2'],
    },
    {
        nom: 'Workshop Sécurité Développeurs - 1 jour',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Atelier d\'1 jour pour former vos devs au DevSecOps.',
        description_longue: `## Sécurité by design

Workshop d'**1 journée** pour sensibiliser et former vos développeurs aux bonnes pratiques de **développement sécurisé**.

### Programme

**Matin (théorie + démos)**

- OWASP Top 10 expliqué avec exemples concrets
- Gestion des secrets (Vault, sealed-secrets)
- Dépendances et SCA
- SAST, DAST, IAST : que choisir ?

**Après-midi (pratique)**

- Code review d'un projet vulnérable (lab)
- Mise en place d'un pipeline CI/CD sécurisé (GitHub Actions ou GitLab CI)
- Intégration d'outils gratuits (Trivy, Semgrep, OWASP Dependency-Check)

### Pour qui

Développeurs, lead techs, DevOps. Jusqu'à **15 participants**.`,
        prix: 1990,
        stock: 100,
        stock_illimite: 'oui',
        images: [IMAGES.cyber2, IMAGES.workspace],
        tags: ['formation', 'devsecops', 'développeurs', 'owasp'],
    },
    {
        nom: 'Coaching individuel cybersécurité - 10h',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Coaching personnalisé avec un expert (10h sur 3 mois).',
        description_longue: `## Un mentor pour accélérer votre montée en compétence

**10 heures** de coaching individuel avec un expert cyber senior, réparties sur 3 mois selon votre rythme.

### Sujets possibles

- Préparation à une certification (CISSP, OSCP, CEH, CISM)
- Reconversion professionnelle vers la cyber
- Spécialisation (pentest, SOC, GRC, cloud security)
- Préparation à un poste de RSSI

### Modalités

- 10 sessions de 1h en visio
- Plan de coaching personnalisé
- Ressources sélectionnées (livres, labs, MOOCs)
- Disponibilité asynchrone par messagerie`,
        prix: 1490,
        stock: 100,
        stock_illimite: 'oui',
        images: [IMAGES.elearning, IMAGES.workspace],
        tags: ['coaching', 'mentorat', 'certification', 'reconversion'],
    },

    /* ============= SERVICES PROFESSIONNELS (4) ============= */
    {
        nom: 'Setup et déploiement Microsoft 365 sécurisé',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Déploiement M365 avec hardening complet (Entra, Defender, Purview).',
        description_longue: `## Microsoft 365, déployé comme il se doit

Prestation de **mise en place et hardening** de votre tenant Microsoft 365 selon les bonnes pratiques **CIS Benchmark**.

### Inclus

- Configuration Entra ID (anciennement Azure AD)
- MFA pour tous les utilisateurs
- Conditional Access policies
- Defender for Office 365 (anti-phishing)
- Defender for Endpoint (EDR)
- Purview (DLP, étiquettes de sensibilité)
- Intune (MDM/MAM)
- Backup tiers (3-2-1)

### Tarif

Forfait pour tenant jusqu'à **100 utilisateurs**. Au-delà : devis.`,
        prix: 5900,
        stock: 30,
        stock_illimite: 'non',
        images: [IMAGES.cloud, IMAGES.workspace],
        tags: ['microsoft365', 'entra', 'defender', 'hardening'],
    },
    {
        nom: 'Mise en place plan de continuité d\'activité (PCA)',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Élaboration de votre PCA / PRA avec tests réels.',
        description_longue: `## Préparez la continuité de votre activité

Accompagnement pour élaborer votre **Plan de Continuité d'Activité (PCA)** et **Plan de Reprise d'Activité (PRA)**, avec exercices de test.

### Méthodologie

1. **BIA** (Business Impact Analysis) : identification des processus critiques
2. **Analyse de risques** : scénarios redoutés (sinistre, cyberattaque)
3. **Stratégies** de continuité (RPO/RTO par activité)
4. **Documentation** : PCA, PRA, fiches réflexes
5. **Tests** : exercice grandeur nature avec votre équipe

### Livrables

- Plan PCA/PRA documenté
- Fiches réflexes par cellule
- Annuaire de crise
- Compte-rendu de l'exercice de test`,
        prix: 12900,
        stock: 15,
        stock_illimite: 'non',
        images: [IMAGES.compliance, IMAGES.audit],
        tags: ['pca', 'pra', 'continuité', 'business', 'crise'],
    },
    {
        nom: 'Cellule DPO externalisée - 1 an',
        categorie: ProductCategory.SERVICE,
        description_courte: 'Délégué à la Protection des Données externalisé certifié.',
        description_longue: `## Un DPO certifié à votre service

Service de **DPO externalisé** assuré par un de nos juristes certifiés, pour répondre à votre obligation RGPD à coût maîtrisé.

### Missions assurées

- Tenue et mise à jour du registre des traitements
- Conseil aux métiers sur les nouveaux traitements (DPIA)
- Réponse aux demandes des personnes (droit d'accès, etc.)
- Interface avec la CNIL
- Veille juridique mensuelle
- Audit annuel de conformité
- Sensibilisation des équipes (2 sessions / an)

### Inclus

- Permanence email + téléphone (8h/18h)
- Délai de réponse < 24h ouvrées
- Reporting trimestriel à la direction
- Adresse DPO dédiée (dpo@votresociete.com)`,
        prix: 4900,
        stock: 50,
        stock_illimite: 'oui',
        images: [IMAGES.compliance, IMAGES.audit],
        tags: ['dpo', 'rgpd', 'externalisé', 'cnil'],
    },
    {
        nom: 'Hotline cybersécurité - Forfait 20h',
        categorie: ProductCategory.SERVICE,
        description_courte: '20h de support expert à utiliser sur 1 an.',
        description_longue: `## Une hotline d'experts à votre disposition

Forfait de **20 heures** de support expert cybersécurité à consommer sur 12 mois.

### Cas d'usage

- Question technique pointue (configuration, alerte SIEM, IOC suspect)
- Aide à l'investigation d'un incident mineur
- Revue de configuration (firewall, AD, M365)
- Conseil sur un projet (architecture, choix d'outils)
- Préparation à un audit

### Modalités

- Tickets via portail ou email
- Téléphone d'urgence (heures ouvrées)
- Décompte au quart d'heure
- Reporting mensuel d'utilisation`,
        prix: 2900,
        stock: 100,
        stock_illimite: 'oui',
        images: [IMAGES.workspace, IMAGES.cyber10],
        tags: ['hotline', 'support', 'expert', 'forfait'],
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

        const existing = await productRepository.count();
        if (existing > 0) {
            console.log(
                `⚠️  ${existing} product(s) already exist in DB. Skipping seed to avoid duplicates.`,
            );
            console.log('   (Truncate the products table first if you want to re-seed.)');
            await app.close();
            return;
        }

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

        /* ---- 40 Products ---- */
        let createdProducts = 0;
        for (const p of PRODUCTS) {
            const slug = slugify(p.nom);
            const product = productRepository.create({
                id: uuidv4(),
                nom: p.nom,
                description_courte: p.description_courte,
                description_longue: p.description_longue,
                categorie: p.categorie,
                type: ProductType.PRODUCT,
                tags: p.tags,
                statut: ProductStatus.PUBLISHED,
                slug,
                meta_title: p.nom.slice(0, 60),
                meta_description: p.description_courte.slice(0, 160),
                keywords: p.tags.join(', '),
                prix: p.prix,
                stock: p.stock,
                stock_illimite: p.stock_illimite,
                seuil_alerte_stock: p.stock_illimite === 'oui' ? null : Math.max(5, Math.floor(p.stock * 0.1)),
                images: buildImages(p.images),
            });
            await productRepository.save(product);
            createdProducts++;
            console.log(`✅ Product [${createdProducts}/40]: ${p.nom}`);
        }

        console.log('');
        console.log('🎉 Seed completed successfully!');
        console.log(`   - ${createdServices} services created`);
        console.log(`   - ${createdProducts} products created`);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    } finally {
        await app.close();
    }
}

seed();

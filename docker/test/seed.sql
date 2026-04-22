-- Seed data for CYNA Test Database
-- This file is automatically executed by PostgreSQL's docker-entrypoint-initdb.d

-- ==================== USERS (cyna-bo-api) ====================
INSERT INTO "user" (id, email, "firstName", "lastName", role, status, "passwordHash", "createdAt", "updatedAt")
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@cyna.fr', 'Admin', 'CYNA', 'ADMIN', 'ACTIVE', '2f3ffebc-2ab6-4beb-b4e1-7c4e4d9e1e4e', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'user1@cyna.fr', 'Jean', 'Dupont', 'ADMIN', 'ACTIVE', '2f3ffebc-2ab6-4beb-b4e1-7c4e4d9e1e4e', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'user2@cyna.fr', 'Marie', 'Martin', 'COMMERCIAL', 'ACTIVE', '2f3ffebc-2ab6-4beb-b4e1-7c4e4d9e1e4e', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'user3@cyna.fr', 'Pierre', 'Bernard', 'COMMERCIAL', 'INACTIVE', '2f3ffebc-2ab6-4beb-b4e1-7c4e4d9e1e4e', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'user4@cyna.fr', 'Sophie', 'Durand', 'ADMIN', 'ACTIVE', '2f3ffebc-2ab6-4beb-b4e1-7c4e4d9e1e4e', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ==================== CATEGORIES (cyna-service-api) ====================
INSERT INTO categories (id, nom, description, slug, "createdAt", "updatedAt")
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Cybersécurité', 'Services et solutions de cybersécurité', 'cybersecurite', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', 'Audit de sécurité', 'Audits et tests de pénétration', 'audit-securite', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', 'Conformité', 'Services de conformité et gouvernance', 'conformite', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440004', 'Formation', 'Formations en sécurité informatique', 'formation', NOW(), NOW())
ON CONFLICT (nom) DO NOTHING;

-- ==================== SERVICES (cyna-service-api) ====================
INSERT INTO services (id, nom, "categoryId", description, statut, slug, meta_title, meta_description, keywords, "createdAt", "updatedAt")
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Threat Intelligence', '660e8400-e29b-41d4-a716-446655440001', 'Service de renseignement sur les menaces avec rapports quotidiens', 'publié', 'threat-intelligence', 'Threat Intelligence - Service CYNA', 'Service de renseignement sur les menaces en cybersécurité', 'threat intelligence, sécurité, menaces', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', 'EDR - Endpoint Detection and Response', '660e8400-e29b-41d4-a716-446655440001', 'Solution complète de détection et réponse aux incidents sur les postes clients', 'publié', 'edr-endpoint-detection-response', 'EDR - Solution de détection d''incidents', 'Endpoint Detection and Response pour protéger vos postes de travail', 'EDR, endpoint detection, réponse aux incidents', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'XDR - Extended Detection and Response', '660e8400-e29b-41d4-a716-446655440001', 'Plateforme de sécurité intégrée couvrant tous les vecteurs d''attaque', 'publié', 'xdr-extended-detection-response', 'XDR - Plateforme de détection étendue', 'Extended Detection and Response pour une protection complète', 'XDR, security operations, détection', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', 'Test de pénétration', '660e8400-e29b-41d4-a716-446655440002', 'Test de pénétration complet de votre infrastructure', 'publié', 'test-penetration', 'Test de pénétration professionnel', 'Services de test de pénétration pour évaluer votre sécurité', 'pentest, test de pénétration, audit de sécurité', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440005', 'Audit de conformité GDPR', '660e8400-e29b-41d4-a716-446655440003', 'Audit approfondi de votre conformité GDPR et recommandations', 'publié', 'audit-conformite-gdpr', 'Audit de conformité GDPR', 'Audit complet de votre conformité GDPR et recommandations', 'GDPR, conformité, audit', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440006', 'Audit de conformité ISO 27001', '660e8400-e29b-41d4-a716-446655440003', 'Certification et audit ISO 27001 pour votre organisation', 'publié', 'audit-iso-27001', 'Audit ISO 27001', 'Services d''audit et certification ISO 27001', 'ISO 27001, sécurité de l''information, audit', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440007', 'Formation cybersécurité niveau 1', '660e8400-e29b-41d4-a716-446655440004', 'Formation d''introduction aux principes de cybersécurité', 'publié', 'formation-cybersecurite-niveau-1', 'Formation cybersécurité débutant', 'Formation initiale en cybersécurité pour tous', 'formation, cybersécurité, débutant', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440008', 'Formation cybersécurité niveau avancé', '660e8400-e29b-41d4-a716-446655440004', 'Formation avancée pour experts en cybersécurité', 'brouillon', 'formation-cybersecurite-avance', 'Formation cybersécurité avancée', 'Formation avancée en cybersécurité pour professionnels', 'formation, cybersécurité, avancé', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

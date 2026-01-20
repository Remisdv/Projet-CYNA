#!/bin/bash

# ===========================================
# CYNA - Script de reset complet de la stack
# ===========================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${RED}=========================================${NC}"
echo -e "${RED}   CYNA - Reset complet de la stack      ${NC}"
echo -e "${RED}=========================================${NC}"
echo ""
echo -e "${YELLOW}ATTENTION: Cette operation va:${NC}"
echo -e "${YELLOW}  - Arreter tous les conteneurs${NC}"
echo -e "${YELLOW}  - Supprimer tous les conteneurs CYNA${NC}"
echo -e "${YELLOW}  - Supprimer tous les volumes (donnees BDD, Elasticsearch)${NC}"
echo -e "${YELLOW}  - Supprimer les images Docker CYNA${NC}"
echo -e "${YELLOW}  - Reconstruire tout depuis zero${NC}"
echo ""

# Demande de confirmation
read -p "Etes-vous sur de vouloir continuer ? (oui/non): " confirmation

if [ "$confirmation" != "oui" ]; then
    echo -e "${BLUE}Operation annulee.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Demarrage du reset...${NC}"
echo ""

cd "$SCRIPT_DIR/dev"

# Etape 1: Arret et suppression des conteneurs + volumes
echo -e "${YELLOW}[1/5] Arret et suppression des conteneurs et volumes...${NC}"
if docker compose version &> /dev/null; then
    docker compose down -v --remove-orphans 2>/dev/null || true
else
    docker-compose down -v --remove-orphans 2>/dev/null || true
fi

# Etape 2: Suppression forcee de tous les conteneurs cyna-*
echo -e "${YELLOW}[2/5] Suppression forcee des conteneurs CYNA...${NC}"
docker ps -aq --filter "name=cyna-" | xargs -r docker rm -f 2>/dev/null || true

# Etape 3: Suppression des images CYNA
echo -e "${YELLOW}[3/5] Suppression des images Docker CYNA...${NC}"
docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "^dev[-_]cyna|^cyna" | xargs -r docker rmi -f 2>/dev/null || true

# Etape 4: Nettoyage des ressources Docker non utilisees
echo -e "${YELLOW}[4/5] Nettoyage des ressources Docker orphelines...${NC}"
docker system prune -f 2>/dev/null || true

# Etape 5: Reconstruction et demarrage
echo -e "${YELLOW}[5/5] Reconstruction et demarrage de la stack...${NC}"
if docker compose version &> /dev/null; then
    docker compose up --build -d
else
    docker-compose up --build -d
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Reset termine avec succes !           ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}La stack a ete completement reinitilisee.${NC}"
echo -e "${BLUE}Toutes les donnees ont ete supprimees.${NC}"
echo ""
echo -e "${BLUE}Services disponibles:${NC}"
echo -e "  - PostgreSQL:      localhost:5432"
echo -e "  - Elasticsearch:   localhost:9200"
echo -e "  - MailHog SMTP:    localhost:1025"
echo -e "  - MailHog Web UI:  localhost:8025"
echo -e "  - Gateway API:     localhost:3000"
echo -e "  - Back-Office API: localhost:3001"
echo -e "  - WebApp API:      localhost:3002"
echo -e "  - Service API:     localhost:3003"
echo ""

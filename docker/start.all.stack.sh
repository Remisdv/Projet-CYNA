#!/bin/bash

# ===========================================
# CYNA - Script de demarrage de la stack
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
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   CYNA - Demarrage de la stack Docker   ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Verification de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Erreur: Docker n'est pas installe ou n'est pas dans le PATH${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}Erreur: Docker n'est pas en cours d'execution${NC}"
    exit 1
fi

echo -e "${GREEN}Docker est disponible${NC}"

# Verification de docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Erreur: docker-compose n'est pas installe${NC}"
    exit 1
fi

echo -e "${GREEN}docker-compose est disponible${NC}"
echo ""

# Verification des dossiers d'application
APPS=("cyna-gateway-api" "cyna-bo-api" "cyna-webapp-api" "cyna-service-api")
MISSING_APPS=()

for app in "${APPS[@]}"; do
    if [ ! -d "$PROJECT_ROOT/$app" ]; then
        MISSING_APPS+=("$app")
    fi
done

if [ ${#MISSING_APPS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Attention: Les dossiers suivants n'existent pas encore:${NC}"
    for app in "${MISSING_APPS[@]}"; do
        echo -e "${YELLOW}  - $app${NC}"
    done
    echo ""
    echo -e "${YELLOW}Les services correspondants ne demarreront pas correctement.${NC}"
    echo -e "${YELLOW}Creez ces projets NestJS avant de lancer la stack complete.${NC}"
    echo ""
fi

# Lancement de la stack
echo -e "${BLUE}Demarrage des services...${NC}"
echo ""

cd "$SCRIPT_DIR/dev"

# Utiliser docker compose (v2) ou docker-compose (v1)
if docker compose version &> /dev/null; then
    docker compose up --build -d
else
    docker-compose up --build -d
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Stack demarree avec succes !          ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}Services disponibles:${NC}"
echo -e "  - PostgreSQL:      localhost:5432"
echo -e "  - Elasticsearch:   localhost:9200"
echo -e "  - Gateway API:     localhost:3000"
echo -e "  - Back-Office API: localhost:3001"
echo -e "  - WebApp API:      localhost:3002"
echo -e "  - Service API:     localhost:3003"
echo ""
echo -e "${BLUE}Commandes utiles:${NC}"
echo -e "  - Voir les logs:   docker compose logs -f"
echo -e "  - Arreter:         ./stop.all.stack.sh"
echo -e "  - Reset complet:   ./reset.all.stack.sh"
echo ""

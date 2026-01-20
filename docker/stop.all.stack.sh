#!/bin/bash

# ===========================================
# CYNA - Script d'arret de la stack
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

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   CYNA - Arret de la stack Docker       ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

cd "$SCRIPT_DIR/dev"

echo -e "${YELLOW}Arret des conteneurs...${NC}"

# Utiliser docker compose (v2) ou docker-compose (v1)
if docker compose version &> /dev/null; then
    docker compose down
else
    docker-compose down
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Stack arretee avec succes !           ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}Les volumes de donnees sont conserves.${NC}"
echo -e "${BLUE}Pour tout supprimer, utilisez: ./reset.all.stack.sh${NC}"
echo ""

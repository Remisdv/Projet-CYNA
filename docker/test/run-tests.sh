#!/bin/bash

# CYNA Functional Test Runner
# Usage: ./run-tests.sh
# Starts the test stack, seeds data, runs functional tests, then tears everything down.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"
REPORTS_DIR="$SCRIPT_DIR/reports"
FUNCTIONAL_DIR="$SCRIPT_DIR/functional"

# Docker network name: <compose-project-name>_<network-name>
DOCKER_NETWORK="cyna-test_cyna-test-network"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[CYNA-TEST]${NC} $1"; }
ok()    { echo -e "${GREEN}  ✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}  ⚠ $1${NC}"; }
error() { echo -e "${RED}  ✗ $1${NC}"; }

# ──────────────────────────────────────────────
# CLEANUP
# ──────────────────────────────────────────────
cleanup() {
  log "Stopping and cleaning test stack..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v 2>/dev/null || true
  ok "Stack stopped, volumes removed."
}
trap cleanup EXIT

# ──────────────────────────────────────────────
# STEP 1 — Build and start infrastructure
# ──────────────────────────────────────────────
echo -e "\n${BLUE}══════════════════════════════════════${NC}"
echo -e "${BLUE}  CYNA Functional Test Suite${NC}"
echo -e "${BLUE}══════════════════════════════════════${NC}\n"

log "[1/5] Starting test infrastructure (build + up)..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
ok "Containers started."

# ──────────────────────────────────────────────
# STEP 2 — Wait for PostgreSQL
# ──────────────────────────────────────────────
log "[2/5] Waiting for PostgreSQL..."
MAX_RETRIES=30
for i in $(seq 1 $MAX_RETRIES); do
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" \
      exec -T cyna-test-postgres pg_isready -U cyna_test -d cyna_test > /dev/null 2>&1; then
    ok "PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    error "PostgreSQL did not become ready in time."
    exit 1
  fi
  sleep 1
done

# ──────────────────────────────────────────────
# STEP 3 — Wait for API services
# ──────────────────────────────────────────────
log "[3/5] Waiting for API services to start..."

wait_for_service() {
  local NAME=$1
  local CONTAINER=$2
  local MAX=3
  for i in $(seq 1 $MAX); do
    echo "  Checking $NAME ($i/$MAX)..."
    if docker exec "$CONTAINER" \
        node -e "var c=require('net').connect(3000,'127.0.0.1');c.on('connect',function(){c.destroy();process.exit(0)});c.on('error',function(){process.exit(1)})" > /dev/null 2>&1; then
      ok "$NAME is ready."
      return 0
    fi
    if [ "$i" -lt "$MAX" ]; then sleep 5; fi
  done
  error "$NAME did not become ready after $MAX retries."
  log "--- Last 40 lines of $NAME logs ---"
  docker logs --tail 40 "$CONTAINER"
  log "--- End of logs ---"
  cleanup
  exit 1
}

wait_for_service "cyna-test-gateway-api" "cyna-test-gateway-api"
wait_for_service "cyna-test-bo-api"      "cyna-test-bo-api"
wait_for_service "cyna-test-service-api" "cyna-test-service-api"
wait_for_service "cyna-test-webapp-api"  "cyna-test-webapp-api"

# ──────────────────────────────────────────────
# STEP 4 — Seed test data
# ──────────────────────────────────────────────
log "[4/5] Seeding test data..."

# Seed users via bo-api
if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" \
    exec -T cyna-test-bo-api yarn seed:users 2>&1 | grep -v "^$"; then
  ok "Users seeded."
else
  warn "User seed may have been skipped (already exists)."
fi

# Seed services/categories via service-api
if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" \
    exec -T cyna-test-service-api yarn seed:services 2>&1 | grep -v "^$"; then
  ok "Services and categories seeded."
else
  warn "Service seed may have been skipped (already exists)."
fi

# ──────────────────────────────────────────────
# STEP 5 — Run functional tests
# ──────────────────────────────────────────────
log "[5/5] Running functional tests..."
mkdir -p "$REPORTS_DIR"

docker run --rm \
  --network "$DOCKER_NETWORK" \
  -v "$FUNCTIONAL_DIR:/app" \
  -e GATEWAY_URL=http://cyna-test-gateway-api:3000 \
  -e BO_API_URL=http://cyna-test-bo-api:3000 \
  -e SERVICE_API_URL=http://cyna-test-service-api:3000 \
  -e WEBAPP_API_URL=http://cyna-test-webapp-api:3000 \
  -e JWT_SECRET=test-jwt-secret-change-this \
  --workdir /app \
  node:20-alpine \
  sh -c "npm install --silent --prefer-offline 2>/dev/null && npm test"

TEST_EXIT=$?

# Copy reports if they exist
if [ -d "$FUNCTIONAL_DIR/reports" ]; then
  cp -r "$FUNCTIONAL_DIR/reports/." "$REPORTS_DIR/" 2>/dev/null || true
fi

# ──────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────
echo ""
echo -e "${BLUE}══════════════════════════════════════${NC}"
if [ $TEST_EXIT -eq 0 ]; then
  echo -e "${GREEN}  ✓ All tests passed!${NC}"
else
  echo -e "${RED}  ✗ Some tests failed (exit code: $TEST_EXIT)${NC}"
fi
echo -e "${BLUE}══════════════════════════════════════${NC}\n"

exit $TEST_EXIT

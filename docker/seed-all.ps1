#!/usr/bin/env pwsh
# Seed all APIs in the correct order
# Usage: .\docker\seed-all.ps1

$ErrorActionPreference = "Stop"

function Run-Seed {
    param([string]$Container, [string]$Script)
    Write-Host "`n==> [$Container] npm run $Script" -ForegroundColor Cyan
    docker exec $Container npm run $Script
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $Container / $Script" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK" -ForegroundColor Green
}

# 1. service-api: categories + services
Run-Seed "cyna-service-api" "seed:services"

# 2. service-api: 48 products (8 services + 40 physical)
Run-Seed "cyna-service-api" "seed:products"

# 3. service-api: 15 BO orders for dashboard stats
Run-Seed "cyna-service-api" "seed:orders"

# 4. bo-api: 4 admin users
Run-Seed "cyna-bo-api" "seed:users"

# 5. bo-api: 8 categories + 3 promo texts + 4 carousel items
Run-Seed "cyna-bo-api" "seed:promos"

# 6. webapp-api: 3 webapp users
Run-Seed "cyna-webapp-api" "seed:users"

# 7. webapp-api: 1 order + 1 subscription per user
Run-Seed "cyna-webapp-api" "seed:orders"

Write-Host "`n==> All seeds completed successfully!" -ForegroundColor Green
Write-Host @"

Comptes disponibles (Password123!) :
  BO admin  : admin@cyna.fr | lucas@cyna.fr | titouan@cyna.fr | remi@cyna.fr
  Webapp    : lucas@cyna.fr | titouan@cyna.fr | remi@cyna.fr

Base de données :
  48 produits catalogue (8 services + 40 produits physiques)
  15 commandes BO (~105 000 EUR de CA)
  3 commandes + 3 abonnements webapp
  8 catégories + 4 carousel + 3 textes promos
"@

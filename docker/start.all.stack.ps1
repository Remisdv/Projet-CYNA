# ===========================================
# CYNA - Script de demarrage de la stack (PowerShell)
# ===========================================

$ErrorActionPreference = "Stop"

# Repertoire du script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host ""
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "   CYNA - Demarrage de la stack Docker   " -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Verification de Docker
try {
    $null = docker --version
    Write-Host "Docker est disponible" -ForegroundColor Green
} catch {
    Write-Host "Erreur: Docker n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Verification que Docker est en cours d'execution
try {
    $null = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "Erreur: Docker n'est pas en cours d'execution. Lancez Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verification de docker-compose
try {
    $null = docker compose version 2>$null
    Write-Host "docker compose est disponible" -ForegroundColor Green
} catch {
    Write-Host "Erreur: docker compose n'est pas disponible" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verification des dossiers d'application
$Apps = @("cyna-gateway-api", "cyna-bo-api", "cyna-webapp-api", "cyna-service-api")
$MissingApps = @()

foreach ($app in $Apps) {
    $appPath = Join-Path $ProjectRoot $app
    if (-not (Test-Path $appPath)) {
        $MissingApps += $app
    }
}

if ($MissingApps.Count -gt 0) {
    Write-Host "Attention: Les dossiers suivants n'existent pas encore:" -ForegroundColor Yellow
    foreach ($app in $MissingApps) {
        Write-Host "  - $app" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Les services correspondants ne demarreront pas correctement." -ForegroundColor Yellow
    Write-Host "Creez ces projets NestJS avant de lancer la stack complete." -ForegroundColor Yellow
    Write-Host ""
}

# Lancement de la stack
Write-Host "Demarrage des services..." -ForegroundColor Blue
Write-Host ""

Set-Location "$ScriptDir\dev"

docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "   Stack demarree avec succes !          " -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services disponibles:" -ForegroundColor Blue
    Write-Host "  - PostgreSQL:      localhost:5432"
    Write-Host "  - Elasticsearch:   localhost:9200"
    Write-Host "  - Gateway API:     localhost:3000"
    Write-Host "  - Back-Office API: localhost:3001"
    Write-Host "  - WebApp API:      localhost:3002"
    Write-Host "  - Service API:     localhost:3003"
    Write-Host ""
    Write-Host "Commandes utiles:" -ForegroundColor Blue
    Write-Host "  - Voir les logs:   docker compose logs -f"
    Write-Host "  - Arreter:         .\stop.all.stack.ps1"
    Write-Host "  - Reset complet:   .\reset.all.stack.ps1"
    Write-Host ""
} else {
    Write-Host "Erreur lors du demarrage de la stack" -ForegroundColor Red
    exit 1
}

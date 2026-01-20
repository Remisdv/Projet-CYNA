# ===========================================
# CYNA - Script de reset complet de la stack (PowerShell)
# ===========================================

$ErrorActionPreference = "Stop"

# Repertoire du script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "   CYNA - Reset complet de la stack      " -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "ATTENTION: Cette operation va:" -ForegroundColor Yellow
Write-Host "  - Arreter tous les conteneurs" -ForegroundColor Yellow
Write-Host "  - Supprimer tous les conteneurs CYNA" -ForegroundColor Yellow
Write-Host "  - Supprimer tous les volumes (donnees BDD, Elasticsearch)" -ForegroundColor Yellow
Write-Host "  - Supprimer les images Docker CYNA" -ForegroundColor Yellow
Write-Host "  - Reconstruire tout depuis zero" -ForegroundColor Yellow
Write-Host ""

# Demande de confirmation
$confirmation = Read-Host "Etes-vous sur de vouloir continuer ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "Operation annulee." -ForegroundColor Blue
    exit 0
}

Write-Host ""
Write-Host "Demarrage du reset..." -ForegroundColor Blue
Write-Host ""

Set-Location "$ScriptDir\dev"

# Etape 1: Arret et suppression des conteneurs + volumes
Write-Host "[1/5] Arret et suppression des conteneurs et volumes..." -ForegroundColor Yellow
try {
    docker compose down -v --remove-orphans 2>$null
} catch {
    # Ignorer les erreurs si rien n'est en cours d'execution
}

# Etape 2: Suppression forcee de tous les conteneurs cyna-*
Write-Host "[2/5] Suppression forcee des conteneurs CYNA..." -ForegroundColor Yellow
try {
    $containers = docker ps -aq --filter "name=cyna-"
    if ($containers) {
        docker rm -f $containers 2>$null
    }
} catch {
    # Ignorer les erreurs
}

# Etape 3: Suppression des images CYNA
Write-Host "[3/5] Suppression des images Docker CYNA..." -ForegroundColor Yellow
try {
    $images = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "^dev[-_]cyna|^cyna" }
    foreach ($image in $images) {
        docker rmi -f $image 2>$null
    }
} catch {
    # Ignorer les erreurs si aucune image n'existe
}

# Etape 4: Nettoyage des ressources Docker non utilisees
Write-Host "[4/5] Nettoyage des ressources Docker orphelines..." -ForegroundColor Yellow
try {
    docker system prune -f 2>$null
} catch {
    # Ignorer les erreurs
}

# Etape 5: Reconstruction et demarrage
Write-Host "[5/5] Reconstruction et demarrage de la stack..." -ForegroundColor Yellow
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "   Reset termine avec succes !           " -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La stack a ete completement reinitialise." -ForegroundColor Blue
    Write-Host "Toutes les donnees ont ete supprimees." -ForegroundColor Blue
    Write-Host ""
    Write-Host "Services disponibles:" -ForegroundColor Blue
    Write-Host "  - PostgreSQL:      localhost:5432"
    Write-Host "  - Elasticsearch:   localhost:9200"
    Write-Host "  - MailHog SMTP:    localhost:1025"
    Write-Host "  - MailHog Web UI:  localhost:8025"
    Write-Host "  - Gateway API:     localhost:3000"
    Write-Host "  - Back-Office API: localhost:3001"
    Write-Host "  - WebApp API:      localhost:3002"
    Write-Host "  - Service API:     localhost:3003"
    Write-Host ""
} else {
    Write-Host "Erreur lors du reset de la stack" -ForegroundColor Red
    exit 1
}

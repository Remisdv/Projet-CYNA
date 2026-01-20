# ===========================================
# CYNA - Script d'arret de la stack (PowerShell)
# ===========================================

$ErrorActionPreference = "Stop"

# Repertoire du script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "   CYNA - Arret de la stack Docker       " -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

Set-Location "$ScriptDir\dev"

Write-Host "Arret des conteneurs..." -ForegroundColor Yellow

docker compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "   Stack arretee avec succes !           " -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les volumes de donnees sont conserves." -ForegroundColor Blue
    Write-Host "Pour tout supprimer, utilisez: .\reset.all.stack.ps1" -ForegroundColor Blue
    Write-Host ""
} else {
    Write-Host "Erreur lors de l'arret de la stack" -ForegroundColor Red
    exit 1
}

Write-Host "Arret et suppression des conteneurs..." -ForegroundColor Cyan
docker compose -f dev/docker-compose.yml down --rmi local --remove-orphans 2>$null

Write-Host "Nettoyage du cache de build..." -ForegroundColor Cyan
docker builder prune -f 2>$null

Write-Host "Rebuild des images..." -ForegroundColor Cyan
docker compose -f dev/docker-compose.yml build --no-cache --quiet

Write-Host "Demarrage des services..." -ForegroundColor Cyan
docker compose -f dev/docker-compose.yml up -d

Write-Host "Services demarres !" -ForegroundColor Green
Write-Host ""
Write-Host "URLs disponibles :" -ForegroundColor Yellow
Write-Host "   - Swagger UI : http://api.localhost/api"
Write-Host "   - API Gateway: http://api.localhost"
Write-Host "   - Back Office: http://bo.localhost"
Write-Host "   - MailHog    : http://localhost:8025"
Write-Host ""
Write-Host "   (Services internes non exposés : bo-api, webapp-api, service-api)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Pour voir les logs : docker compose -f dev/docker-compose.yml logs -f" -ForegroundColor Yellow

# CYNA Functional Test Runner (PowerShell)
# Usage: .\run-tests.ps1
# Starts the test stack, seeds data, runs functional tests, then tears everything down.

param()

$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $ScriptDir "docker-compose.yml"
$EnvFile = Join-Path $ScriptDir ".env"
$ReportsDir = Join-Path $ScriptDir "reports"
$FunctionalDir = Join-Path $ScriptDir "functional"

$DockerNetwork = "cyna-test_cyna-test-network"

function log  { param($msg) Write-Host "[CYNA-TEST] $msg" -ForegroundColor Blue }
function ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function warn { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function err  { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red }

function Cleanup {
    log "Stopping and cleaning test stack..."
    & docker compose -f $ComposeFile --env-file $EnvFile down -v 2>$null
    ok "Stack stopped, volumes removed."
}

$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

$TestExit = 1

try {

    Write-Host ""
    Write-Host "======================================" -ForegroundColor Blue
    Write-Host "  CYNA Functional Test Suite" -ForegroundColor Blue
    Write-Host "======================================" -ForegroundColor Blue
    Write-Host ""

    # ------------------------------------------
    # STEP 1 - Build and start infrastructure
    # ------------------------------------------
    log "[1/5] Starting test infrastructure (build + up)..."
    & docker compose -f $ComposeFile --env-file $EnvFile up -d --build
    if ($LASTEXITCODE -ne 0) {
        err "Failed to start infrastructure."
        exit 1
    }
    ok "Containers started."

    # ------------------------------------------
    # STEP 2 - Wait for PostgreSQL
    # ------------------------------------------
    log "[2/5] Waiting for PostgreSQL..."
    $MaxRetries = 30
    $PgReady = $false
    for ($i = 1; $i -le $MaxRetries; $i++) {
        & docker compose -f $ComposeFile --env-file $EnvFile exec -T cyna-test-postgres pg_isready -U cyna_test -d cyna_test 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            ok "PostgreSQL is ready."
            $PgReady = $true
            break
        }
        Start-Sleep -Seconds 1
    }
    if (-not $PgReady) {
        err "PostgreSQL did not become ready in time."
        exit 1
    }

    # ------------------------------------------
    # STEP 3 - Wait for API services
    # ------------------------------------------
    log "[3/5] Waiting for API services to start..."

    $Services = @(
        "cyna-test-gateway-api",
        "cyna-test-bo-api",
        "cyna-test-service-api",
        "cyna-test-webapp-api"
    )

    $MaxSvcRetries = 3
    $SvcRetryDelay = 5

    foreach ($container in $Services) {
        $svcReady = $false
        for ($i = 1; $i -le $MaxSvcRetries; $i++) {
            Write-Host "  Checking $container ($i/$MaxSvcRetries)..." -ForegroundColor DarkGray
            & docker exec $container node -e "var c=require('net').connect(3000,'127.0.0.1');c.on('connect',function(){c.destroy();process.exit(0)});c.on('error',function(){process.exit(1)})" 2>$null
            $exitCode = $LASTEXITCODE
            if ($exitCode -eq 0) {
                ok "$container is ready."
                $svcReady = $true
                break
            }
            if ($i -lt $MaxSvcRetries) { Start-Sleep -Seconds $SvcRetryDelay }
        }
        if (-not $svcReady) {
            err "$container did not become ready after $MaxSvcRetries retries."
            log "--- Last 40 lines of $container logs ---"
            & docker logs --tail 40 $container
            log "--- End of logs ---"
            Cleanup
            exit 1
        }
    }

    # ------------------------------------------
    # STEP 4 - Seed test data
    # ------------------------------------------
    log "[4/5] Seeding test data..."

    & docker compose -f $ComposeFile --env-file $EnvFile exec -T cyna-test-bo-api npm run seed:users
    if ($LASTEXITCODE -eq 0) {
        ok "Users seeded."
    } else {
        warn "User seed skipped (already exists or error)."
    }

    & docker compose -f $ComposeFile --env-file $EnvFile exec -T cyna-test-service-api npm run seed:services
    if ($LASTEXITCODE -eq 0) {
        ok "Services and categories seeded."
    } else {
        warn "Service seed skipped (already exists or error)."
    }

    # ------------------------------------------
    # STEP 5 - Run functional tests
    # ------------------------------------------
    log "[5/5] Running functional tests..."
    if (-not (Test-Path $ReportsDir)) {
        New-Item -ItemType Directory -Path $ReportsDir | Out-Null
    }

    & docker run --rm `
        --network $DockerNetwork `
        -v "${FunctionalDir}:/app" `
        -e GATEWAY_URL=http://cyna-test-gateway-api:3000 `
        -e BO_API_URL=http://cyna-test-bo-api:3000 `
        -e SERVICE_API_URL=http://cyna-test-service-api:3000 `
        -e WEBAPP_API_URL=http://cyna-test-webapp-api:3000 `
        -e JWT_SECRET=test-jwt-secret-change-this `
        --workdir /app `
        node:20-alpine `
        sh -c "npm install --silent --prefer-offline 2>/dev/null && npm test"

    $TestExit = $LASTEXITCODE

    # ------------------------------------------
    # SUMMARY
    # ------------------------------------------
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Blue
    if ($TestExit -eq 0) {
        Write-Host "  [PASS] All tests passed!" -ForegroundColor Green
    } else {
        err "Some tests failed (exit code: $TestExit)"
    }
    Write-Host "======================================" -ForegroundColor Blue
    Write-Host ""

} finally {
    Cleanup
}

exit $TestExit

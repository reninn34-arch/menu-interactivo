# Script para resetear contraseña de PostgreSQL
# EJECUTAR COMO ADMINISTRADOR

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resetear Contraseña PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$pgHbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
$serviceName = "postgresql-x64-18"
$backupPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

# 1. Crear backup del archivo original
Write-Host "1. Creando backup de pg_hba.conf..." -ForegroundColor Yellow
Copy-Item $pgHbaPath $backupPath -Force
Write-Host "   ✅ Backup creado" -ForegroundColor Green
Write-Host ""

# 2. Leer y modificar pg_hba.conf
Write-Host "2. Modificando pg_hba.conf..." -ForegroundColor Yellow
$content = Get-Content $pgHbaPath
$newContent = $content -replace 'scram-sha-256', 'trust'
$newContent | Set-Content $pgHbaPath
Write-Host "   ✅ Archivo modificado (scram-sha-256 → trust)" -ForegroundColor Green
Write-Host ""

# 3. Reiniciar PostgreSQL
Write-Host "3. Reiniciando PostgreSQL..." -ForegroundColor Yellow
Restart-Service $serviceName
Start-Sleep -Seconds 3
Write-Host "   ✅ Servicio reiniciado" -ForegroundColor Green
Write-Host ""

# 4. Cambiar contraseña
Write-Host "4. Cambiando contraseña a 'postgres'..." -ForegroundColor Yellow
cd $PSScriptRoot\..
$nodeScript = @'
const {Client} = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  database: 'postgres'
});

client.connect()
  .then(() => client.query(`ALTER USER postgres PASSWORD 'postgres'`))
  .then(() => {
    console.log('OK');
    return client.end();
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
'@
$result = node -e $nodeScript

if ($LASTEXITCODE -eq 0 -and $result -eq 'OK') {
    Write-Host "   ✅ Contraseña cambiada exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error cambiando contraseña" -ForegroundColor Red
    Write-Host "   Restaurando backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $pgHbaPath -Force
    Restart-Service $serviceName
    exit 1
}
Write-Host ""

# 5. Restaurar configuración original
Write-Host "5. Restaurando configuración original..." -ForegroundColor Yellow
Copy-Item $backupPath $pgHbaPath -Force
Write-Host "   ✅ Configuración restaurada" -ForegroundColor Green
Write-Host ""

# 6. Reiniciar PostgreSQL de nuevo
Write-Host "6. Reiniciando PostgreSQL con nueva configuración..." -ForegroundColor Yellow
Restart-Service $serviceName
Start-Sleep -Seconds 3
Write-Host "   ✅ PostgreSQL listo" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ CONTRASEÑA RESETEADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usuario: postgres" -ForegroundColor White
Write-Host "Contraseña: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Prueba ejecutar: node scripts/init-db.js" -ForegroundColor Cyan
Write-Host ""

# Limpiar backup
Remove-Item $backupPath -Force -ErrorAction SilentlyContinue

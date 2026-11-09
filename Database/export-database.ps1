$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $PSScriptRoot 'export.sql'
$dump = & docker compose --project-directory $projectRoot exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump --default-character-set=utf8mb4 -uroot --databases "$MYSQL_DATABASE" --no-tablespaces'
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
    throw "Database export failed with exit code $exitCode."
}

$content = [string]::Join([Environment]::NewLine, $dump) + [Environment]::NewLine
[System.IO.File]::WriteAllText($outputPath, $content, [System.Text.UTF8Encoding]::new($false))
Write-Output "Database export written to $outputPath"

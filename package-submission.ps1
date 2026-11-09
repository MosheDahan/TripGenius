param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9 _-]*$')]
    [string]$StudentName
)

$ErrorActionPreference = 'Stop'
$StudentName = $StudentName.Trim()
$projectRoot = $PSScriptRoot
$outputPath = Join-Path (Split-Path -Parent $projectRoot) "$StudentName.zip"
$stagingRoot = Join-Path $env:TEMP "TripGenius-submission-$([guid]::NewGuid().ToString('N'))"
$stagingProject = Join-Path $stagingRoot $StudentName

New-Item -ItemType Directory -Path $stagingProject -Force | Out-Null
try {
    if (Test-Path -LiteralPath $outputPath) {
        throw "The output archive already exists; move it or choose a different student name: $outputPath"
    }

    $files = Get-ChildItem -LiteralPath $projectRoot -Recurse -File -Force | Where-Object {
        $relativePath = $_.FullName.Substring($projectRoot.Length).TrimStart('\')
        $isGeneratedDirectory = $relativePath -match '(^|\\)(node_modules|build|dist|coverage|\.git|\.vscode)(\\|$)'
        $isEnvironmentFile = $_.Name -match '^\.env($|\.)' -and $_.Name -ne '.env.example'
        -not $isGeneratedDirectory -and -not $isEnvironmentFile
    }

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($projectRoot.Length).TrimStart('\')
        $destination = Join-Path $stagingProject $relativePath
        $destinationDirectory = Split-Path -Parent $destination
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $destination
    }

    Compress-Archive -Path $stagingProject -DestinationPath $outputPath
    Write-Output "Submission archive created: $outputPath"
}
finally {
    if (Test-Path -LiteralPath $stagingRoot) {
        Remove-Item -LiteralPath $stagingRoot -Recurse -Force
    }
}

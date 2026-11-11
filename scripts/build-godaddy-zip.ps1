$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $root "dist-godaddy"
$zipOut = Join-Path $root "jayakesh-godaddy-cpanel.zip"

if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
if (Test-Path $zipOut) { Remove-Item -Force $zipOut }

New-Item -ItemType Directory -Path $stage | Out-Null

# Copy storefront & admin static files
Copy-Item -Path (Join-Path $root "public\*") -Destination $stage -Recurse -Force

# Copy GoDaddy Apache .htaccess & PHP backend (including dotfiles!)
Copy-Item -Path (Join-Path $root "godaddy-cpanel\.htaccess") -Destination (Join-Path $stage ".htaccess") -Force
Copy-Item -Path (Join-Path $root "godaddy-cpanel\api") -Destination (Join-Path $stage "api") -Recurse -Force

# Create ZIP preserving forward slashes for Linux GoDaddy cPanel!
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$fs = [System.IO.File]::Open($zipOut, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $stage -Recurse -Force -File | ForEach-Object {
  $rel = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}

$zip.Dispose()
$fs.Dispose()
Remove-Item -Recurse -Force $stage

$sizeMb = [Math]::Round((Get-Item $zipOut).Length / 1MB, 2)
Write-Output "Created $zipOut ($sizeMb MB) with Linux-ready paths & .htaccess!"

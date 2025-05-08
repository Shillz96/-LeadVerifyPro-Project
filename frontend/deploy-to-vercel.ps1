# PowerShell script to deploy LeadVerifyPro to Vercel
Write-Host "=== LeadVerifyPro Vercel Deployment Script ===" -ForegroundColor Cyan

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Ensure we're in the frontend directory
$currentDir = Get-Location
$dirName = Split-Path -Path $currentDir -Leaf
if ($dirName -ne "frontend") {
    Write-Host "Please run this script from the frontend directory" -ForegroundColor Red
    exit 1
}

# Build the project if dist directory doesn't exist
if (-not (Test-Path -Path "./dist")) {
    Write-Host "Building project..." -ForegroundColor Yellow
    npm run build
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Cyan

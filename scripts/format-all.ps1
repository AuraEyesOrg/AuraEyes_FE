# Format toàn bộ project
Write-Host "🔧 Formatting entire project..." -ForegroundColor Cyan

# Run ESLint fix
Write-Host "`n📝 Running ESLint fix..." -ForegroundColor Yellow
npm run lint:fix

# Run Prettier
Write-Host "`n🎨 Running Prettier..." -ForegroundColor Yellow
npm run format

Write-Host "`n✅ Done! Project formatted successfully." -ForegroundColor Green

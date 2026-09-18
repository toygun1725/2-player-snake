$ErrorActionPreference = "Stop"
$root      = 'D:\#3 Vibecoding\AI Games\2 Player Snake'
$srcImg    = "$root\Gorsel\Play Store Magazavisuals\2 Player Snake Play Store Mobile"
$mdFile    = "$root\MD Files\Store_Listing.md"
$destMeta  = "$root\Ana Dosya\iOS\fastlane\metadata"
$destShots = "$root\Ana Dosya\iOS\fastlane\screenshots"

# Play Store klasor adi -> App Store locale
$localeMap = @{
    'en-US'  = 'en-US'
    'de-DE'  = 'de-DE'
    'ar'     = 'ar-SA'
    'es-ES'  = 'es-ES'
    'fr-FR'  = 'fr-FR'
    'hi-IN'  = 'hi'
    'id'     = 'id'
    'it-IT'  = 'it'
    'ja-JP'  = 'ja'
    'ko-KR'  = 'ko'
    'nl-NL'  = 'nl-NL'
    'pl-PL'  = 'pl'
    'pt-PT'  = 'pt-PT'
    'ru-RU'  = 'ru'
    'th'     = 'th'
    'tr-TR'  = 'tr'
    'vi'     = 'vi'
    'zh-CN'  = 'zh-Hans'
}

# Store_Listing.md lang code -> App Store locale
$mdLocaleMap = @{
    'en-US'  = 'en-US'
    'de-DE'  = 'de-DE'
    'ar'     = 'ar-SA'
    'es-ES'  = 'es-ES'
    'fr-FR'  = 'fr-FR'
    'hi-IN'  = 'hi'
    'id'     = 'id'
    'it-IT'  = 'it'
    'ja-JP'  = 'ja'
    'ko-KR'  = 'ko'
    'nl-NL'  = 'nl-NL'
    'pl-PL'  = 'pl'
    'pt-PT'  = 'pt-PT'
    'ru-RU'  = 'ru'
    'th'     = 'th'
    'tr-TR'  = 'tr'
    'vi'     = 'vi'
    'zh-CN'  = 'zh-Hans'
    'pt-BR'  = 'pt-BR'
    'el-GR'  = 'el'
    'cs-CZ'  = 'cs'
    'iw-IL'  = 'he'
    'da-DK'  = 'da'
    'fi-FI'  = 'fi'
    'hu-HU'  = 'hu'
    'no-NO'  = 'no'
    'ro'     = 'ro'
    'sk'     = 'sk'
    'uk'     = 'uk'
}

$releaseNotes = "- Added Apple Game Center integration with 15 achievements to unlock!`n- High performance and 60 FPS fluidity optimizations for iPhone menus and animations.`n- Added direct App Store review and rating shortcut.`n- General bug fixes, visual polishes, and stability improvements."

Write-Host "=== Parsing Store_Listing.md ===" -ForegroundColor Cyan
$rawContent = [System.IO.File]::ReadAllText($mdFile, [System.Text.Encoding]::UTF8)

# Extract language blocks
$langBlocks = @{}
$rx = [regex]::new('<([a-zA-Z0-9\-]+)>([\s\S]*?)<\/\1>')
foreach ($m in $rx.Matches($rawContent)) {
    $code = $m.Groups[1].Value
    $body = $m.Groups[2].Value.Trim()
    $langBlocks[$code] = $body
}
Write-Host "  Found $($langBlocks.Count) language blocks" -ForegroundColor Green

Write-Host ""
Write-Host "=== Creating metadata folders ===" -ForegroundColor Cyan
$createdMeta = 0
foreach ($mdLang in $langBlocks.Keys) {
    if (-not $mdLocaleMap.ContainsKey($mdLang)) { continue }
    $appLocale = $mdLocaleMap[$mdLang]
    $body = $langBlocks[$mdLang]
    $metaDir = "$destMeta\$appLocale"
    [void](New-Item -ItemType Directory -Force -Path $metaDir)

    # Extract subtitle (App Store Subtitle line)
    $subtitle = ''
    if ($body -match '(?m)App Store Subtitle[^\r\n]*\r?\n([^\r\n]+)') { $subtitle = $Matches[1].Trim() }
    
    # Extract keywords
    $keywords = ''
    if ($body -match '(?m)App Store Keywords[^\r\n]*\r?\n([^\r\n]+)') { $keywords = $Matches[1].Trim() }
    
    # Extract full description - everything after "Full Description" or equivalent heading
    $description = ''
    if ($body -match '(?ms)Full Description\r?\n(.+)$') {
        $description = $Matches[1].Trim()
    } elseif ($body -match '(?ms)\w+ (Description|Beschreibung|Beschrijving|Lengkap|opisu|opisanie)\r?\n(.+)$') {
        $description = $Matches[2].Trim()
    } else {
        # Fallback: everything after first blank line
        $firstBlank = $body.IndexOf("`n`n")
        if ($firstBlank -ge 0) { $description = $body.Substring($firstBlank).Trim() }
        else { $description = $body }
    }

    # name.txt
    [System.IO.File]::WriteAllText("$metaDir\name.txt", "2 Player Snake", [System.Text.Encoding]::UTF8)
    # subtitle.txt
    if ($subtitle) { [System.IO.File]::WriteAllText("$metaDir\subtitle.txt", $subtitle, [System.Text.Encoding]::UTF8) }
    # keywords.txt
    if ($keywords) { [System.IO.File]::WriteAllText("$metaDir\keywords.txt", $keywords, [System.Text.Encoding]::UTF8) }
    # description.txt
    if ($description) { [System.IO.File]::WriteAllText("$metaDir\description.txt", $description, [System.Text.Encoding]::UTF8) }
    # release_notes.txt
    [System.IO.File]::WriteAllText("$metaDir\release_notes.txt", $releaseNotes, [System.Text.Encoding]::UTF8)

    $createdMeta++
}
Write-Host "  Created metadata for $createdMeta locales" -ForegroundColor Green

Write-Host ""
Write-Host "=== Copying screenshots ===" -ForegroundColor Cyan

# Real path with Turkish chars
$realSrcImg = "$root\Gorsel\Play Store Magazavisuals\2 Player Snake Play Store Mobile"
# Try to resolve actual folder
$gorselDir = Get-ChildItem "$root" -Directory | Where-Object { $_.Name -like "G*rsel" } | Select-Object -First 1
if ($gorselDir) {
    $subA = Get-ChildItem $gorselDir.FullName -Directory | Where-Object { $_.Name -like "Play*" } | Select-Object -First 1
    if ($subA) {
        $subB = Get-ChildItem $subA.FullName -Directory | Where-Object { $_.Name -like "*Play*Mobile*" } | Select-Object -First 1
        if ($subB) { $realSrcImg = $subB.FullName }
    }
}
Write-Host "  Source: $realSrcImg" -ForegroundColor Gray

$copiedLangs = 0
foreach ($psLang in $localeMap.Keys) {
    $appLocale  = $localeMap[$psLang]
    $iosSrc     = "$realSrcImg\$psLang\iOS"
    $ipadSrc    = "$realSrcImg\$psLang\iPad"
    $iphoneDest = "$destShots\$appLocale\iPhone6.5"
    $ipadDest   = "$destShots\$appLocale\iPadPro129"

    if (Test-Path $iosSrc) {
        [void](New-Item -ItemType Directory -Force -Path $iphoneDest)
        $files = Get-ChildItem "$iosSrc\*.png" | Sort-Object Name
        $idx = 1
        foreach ($f in $files) {
            Copy-Item $f.FullName "$iphoneDest\${idx}_screenshot.png" -Force
            $idx++
        }
        Write-Host "  $psLang -> $appLocale iPhone: $($files.Count) screenshots" -ForegroundColor Gray
    }
    if (Test-Path $ipadSrc) {
        [void](New-Item -ItemType Directory -Force -Path $ipadDest)
        $files = Get-ChildItem "$ipadSrc\*.png" | Sort-Object Name
        $idx = 1
        foreach ($f in $files) {
            Copy-Item $f.FullName "$ipadDest\${idx}_screenshot.png" -Force
            $idx++
        }
    }
    $copiedLangs++
}
Write-Host "  Processed $copiedLangs language screenshot sets" -ForegroundColor Green

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Metadata: $destMeta"
Write-Host "Screenshots: $destShots"

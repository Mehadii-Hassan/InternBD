$files = Get-ChildItem -Path "app" -Filter "page.tsx" -Recurse
foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName
    $hasReact = $content -match "from ['\"]react['\"]"
    $hasImport = $content -match "^import "
    if (-not $hasReact -and $hasImport) {
        $firstLine = $content[0]
        $rest = $content[1..$content.Length] -join "`n"
        $newContent = $firstLine + "`nimport React from " + "'react'" + ";" + "`n" + $rest
        Set-Content -LiteralPath $file.FullName -Value $newContent
        Write-Output "Updated: $($file.FullName)"
    }
}

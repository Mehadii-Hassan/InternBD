$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000"
$pages = @(
    @{ url = "/"; name = "Home" },
    @{ url = "/internships"; name = "Internships" },
    @{ url = "/post"; name = "Post" },
    @{ url = "/about"; name = "About" },
    @{ url = "/contact"; name = "Contact" },
    @{ url = "/privacy"; name = "Privacy" },
    @{ url = "/terms"; name = "Terms" },
    @{ url = "/companies"; name = "Companies" },
    @{ url = "/categories"; name = "Categories" },
    @{ url = "/locations"; name = "Locations" },
    @{ url = "/admin/login"; name = "Admin Login" },
    @{ url = "/safety-tips"; name = "Safety Tips" },
    @{ url = "/for-employers"; name = "For Employers" },
    @{ url = "/report"; name = "Report" },
    @{ url = "/saved"; name = "Saved" },
    @{ url = "/nonexistent"; name = "404 Page" }
)

$results = @()

foreach ($item in $pages) {
    $url = $baseUrl + $item.url
    $name = $item.name
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 15 -ErrorAction Stop
        $statusCode = $response.StatusCode
        $content = $response.Content
        $titleMatch = [regex]::Match($content, '<title>(.*?)</title>')
        $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value } else { "Unknown" }
        $results += [pscustomobject]@{ Name = $name; Url = $url; Status = "PASS"; StatusCode = $statusCode; Title = $title }
        Write-Host "PASS $name $url $statusCode"
    } catch {
        $results += [pscustomobject]@{ Name = $name; Url = $url; Status = "FAIL"; Error = $_.Exception.Message }
        Write-Host "FAIL $name $url $($_.Exception.Message)"
    }
}

$passed = ($results | Where-Object { $_.Status -eq 'PASS' }).Count
$failed = ($results | Where-Object { $_.Status -eq 'FAIL' }).Count
Write-Host "`n=== SUMMARY ==="
Write-Host "Passed: $passed, Failed: $failed, Total: $($results.Count)"
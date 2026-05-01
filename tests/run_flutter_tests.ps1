# Run Flutter tests and save results as JSON for dashboard
# Run from repo root: powershell -ExecutionPolicy Bypass -File tests/run_flutter_tests.ps1

$rawOutput = flutter test test/ --no-pub 2>&1
$output = $rawOutput | Out-String
$lines = $output -split "`n"

$passed = 0
$failed = 0
$duration = 0
$tests = @()

foreach ($line in $lines) {
    # Match: "00:01 +64: path/to/test.dart: Group name test name"
    if ($line -match '^\s*\d+:\d+\s+\+(\d+)(?:\s+-\d+)?:\s+(.+\.dart):\s+(.+)$') {
        $count    = [int]$Matches[1]
        $file     = $Matches[2] -replace '.*[/\\]test[/\\]', 'test/'
        $testName = $Matches[3].Trim()
        $tests += @{ file=$file; name=$testName; outcome="passed" }
    }
    # Summary
    if ($line -match '\+(\d+):\s+All tests passed') {
        $passed = [int]$Matches[1]
        $failed = 0
    }
    if ($line -match '\+(\d+)\s+-(\d+):\s+Some tests failed') {
        $passed = [int]$Matches[1]
        $failed = [int]$Matches[2]
    }
    # Duration
    if ($line -match '^(\d+):(\d+)\s+\+') {
        $duration = [int]$Matches[1]*60 + [int]$Matches[2]
    }
}

$total = $passed + $failed

$result = @{
    passed   = $passed
    failed   = $failed
    total    = $total
    duration = $duration
    tests    = $tests
}

$result | ConvertTo-Json -Depth 5 | Set-Content "tests/reports/flutter_results.json" -Encoding UTF8
Write-Host "Flutter: $passed passed, $failed failed (total: $total)"
Write-Host "Saved to tests/reports/flutter_results.json"

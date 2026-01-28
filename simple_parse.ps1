# Simple TXT to CSV converter
# No complex escaping - just basic parsing

$files = @(
    "test1-10.txt",
    "test11-20.txt",
    "test21-30.txt",
    "test31-40.txt",
    "test41-50.txt",
    "test51-60.txt"
)

$allTests = @()

foreach ($file in $files) {
    Write-Host "Processing $file..."
    $lines = Get-Content $file -Encoding UTF8
    $lines = $lines | Where-Object { $_.Trim() -ne "" }
    
    $i = 0
    while ($i -lt $lines.Count) {
        $line = $lines[$i].Trim()
        
        # Skip bilet markers
        if ($line -match '^\d+-BILET') {
            $i++
            continue
        }
        
        # Check if question
        if ($line -and $line -notmatch '^F\d+' -and $line -notmatch '^https') {
            $question = $line
            $answers = @()
            $correctIdx = 0
            $imageUrl = "https://i.postimg.cc/NGmgN66H/avtotest.png"
            
            $j = $i + 1
            while ($j -lt $lines.Count -and $j -lt ($i + 20)) {
                $next = $lines[$j].Trim()
                
                if ($next -match '^https') {
                    $imageUrl = $next
                    $j++
                    continue
                }
                
                if ($next -match '^F\d+') {
                    $hasPlus = $next -match '\+'
                    $j++
                    if ($j -lt $lines.Count) {
                        $ans = $lines[$j].Trim()
                        if ($hasPlus -or $ans -match '\+$') {
                            $correctIdx = $answers.Count
                            $ans = $ans -replace '\+$', ''
                        }
                        $answers += $ans.Trim()
                    }
                    $j++
                }
                elseif ($next -match '^\d+-BILET' -or ($next -and $next -notmatch '^F\d+' -and $answers.Count -ge 2)) {
                    break
                }
                else {
                    $j++
                }
            }
            
            if ($answers.Count -ge 2) {
                $allTests += [PSCustomObject]@{
                    Q = $question
                    A = $answers
                    C = $correctIdx
                    I = $imageUrl
                }
            }
            
            $i = $j
        }
        else {
            $i++
        }
    }
}

Write-Host "Total tests: $($allTests.Count)"

# Write CSV
$csv = "question,question_cyrl,answers,answers_cyrl,correct_answer,image_url,category,time_limit,audio_url,audio_url_cyrl,explanation_title,explanation_title_cyrl,explanation_text,explanation_text_cyrl"

foreach ($t in $allTests) {
    # Simple array format
    $ansStr = "{" + (($t.A | ForEach-Object { '"' + $_ + '"' }) -join ",") + "}"
    
    # CSV row - using simple escaping
    $q = $t.Q -replace '"', '""'
    $ans = $ansStr -replace '"', '""'
    
    $csv += "`n`"$q`",`"`",`"$ans`",`"`",$($t.C),`"$($t.I)`",`"`",300,`"`",`"`",`"`",`"`",`"`",`"`""
}

$csv | Out-File "ticket_60_tests.csv" -Encoding UTF8

Write-Host "CSV created: ticket_60_tests.csv"
Write-Host "Note: Cyrillic conversion will be done in next step"

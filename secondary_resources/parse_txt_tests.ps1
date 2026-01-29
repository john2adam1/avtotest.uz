# PowerShell script to convert TXT test files to CSV
# Converts Uzbek Latin to Cyrillic

function Convert-LatinToCyrillic {
    param([string]$text)
    
    if ([string]::IsNullOrEmpty($text)) { return $text }
    
    $result = $text
    
    # Multi-character replacements first (order matters!)
    $result = $result.Replace("O'", "Ў").Replace("o'", "ў")
    $result = $result.Replace("G'", "Ғ").Replace("g'", "ғ")
    $result = $result.Replace("Sh", "Ш").Replace("sh", "ш")
    $result = $result.Replace("Ch", "Ч").Replace("ch", "ч")
    
    # Single character replacements
    $replacements = @{
        "A" = "А"; "a" = "а"; "B" = "Б"; "b" = "б"
        "D" = "Д"; "d" = "д"; "E" = "Е"; "e" = "е"
        "F" = "Ф"; "f" = "ф"; "G" = "Г"; "g" = "г"
        "H" = "Ҳ"; "h" = "ҳ"; "I" = "И"; "i" = "и"
        "J" = "Ж"; "j" = "ж"; "K" = "К"; "k" = "к"
        "L" = "Л"; "l" = "л"; "M" = "М"; "m" = "м"
        "N" = "Н"; "n" = "н"; "O" = "О"; "o" = "о"
        "P" = "П"; "p" = "п"; "Q" = "Қ"; "q" = "қ"
        "R" = "Р"; "r" = "р"; "S" = "С"; "s" = "с"
        "T" = "Т"; "t" = "т"; "U" = "У"; "u" = "у"
        "V" = "В"; "v" = "в"; "X" = "Х"; "x" = "х"
        "Y" = "Й"; "y" = "й"; "Z" = "З"; "z" = "з"
    }
    
    foreach ($key in $replacements.Keys) {
        $result = $result.Replace($key, $replacements[$key])
    }
    
    return $result
}

Write-Host "Starting TXT to CSV conversion..." -ForegroundColor Cyan
Write-Host "============================================================"

$files = @(
    "test1-10.txt",
    "test11-20.txt",
    "test21-30.txt",
    "test31-40.txt",
    "test41-50.txt",
    "test51-60.txt"
)

$allTests = @()

foreach ($filename in $files) {
    Write-Host "`nProcessing $filename..." -ForegroundColor Yellow
    
    try {
        $content = Get-Content $filename -Encoding UTF8 -Raw
        $lines = $content -split "`r`n" | Where-Object { $_.Trim() -ne "" }
        
        Write-Host "  Extracted $($lines.Count) lines" -ForegroundColor Green
        
        $i = 0
        while ($i -lt $lines.Count) {
            $line = $lines[$i].Trim()
            
            # Skip bilet markers
            if ($line -match '^\d+-BILET') {
                $i++
                continue
            }
            
            # Check if this looks like a question (not F1, F2, not URL)
            if ($line -and $line -notmatch '^F\d+' -and $line -notmatch '^https?://') {
                $question = $line
                $answers = @()
                $correctIdx = 0
                $imageUrl = "https://i.postimg.cc/NGmgN66H/avtotest.png"
                
                # Look ahead for answers
                $j = $i + 1
                $answerCount = 0
                
                while ($j -lt $lines.Count -and $answerCount -lt 10) {
                    $nextLine = $lines[$j].Trim()
                    
                    # Check for image URL
                    if ($nextLine -match '^https?://') {
                        $imageUrl = $nextLine
                        $j++
                        continue
                    }
                    
                    # Check for answer marker (F1, F2, F3, F4, etc)
                    if ($nextLine -match '^F(\d+)\s*(\+?)$') {
                        $hasPlus = $matches[2] -eq '+'
                        $j++
                        
                        if ($j -lt $lines.Count) {
                            $answerText = $lines[$j].Trim()
                            
                            # Check if answer has + at the end
                            if ($hasPlus -or $answerText -match '\+\s*$') {
                                $correctIdx = $answers.Count
                                $answerText = $answerText -replace '\+\s*$', ''
                                $answerText = $answerText.Trim()
                            }
                            
                            if ($answerText) {
                                $answers += $answerText
                                $answerCount++
                            }
                        }
                        $j++
                    }
                    elseif ($nextLine -match '^\d+-BILET' -or ($nextLine -and $nextLine -notmatch '^F\d+' -and $answerCount -ge 2)) {
                        # Next question or enough answers
                        break
                    }
                    else {
                        $j++
                    }
                }
                
                # Add test if valid (at least 2 answers)
                if ($answers.Count -ge 2) {
                    $allTests += [PSCustomObject]@{
                        Question      = $question
                        Answers       = $answers
                        CorrectAnswer = $correctIdx
                        ImageUrl      = $imageUrl
                    }
                }
                
                $i = $j
            }
            else {
                $i++
            }
        }
        
        Write-Host "  ✓ Extracted tests from $filename" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n============================================================"
Write-Host "Total tests extracted: $($allTests.Count)" -ForegroundColor Cyan
Write-Host "============================================================`n"

# Create CSV
$csvPath = "ticket_60_tests.csv"
$csvLines = @()

# Header
$csvLines += "question,question_cyrl,answers,answers_cyrl,correct_answer,image_url,category,time_limit,audio_url,audio_url_cyrl,explanation_title,explanation_title_cyrl,explanation_text,explanation_text_cyrl"

# Data rows
foreach ($test in $allTests) {
    # Convert to Cyrillic
    $questionCyrl = Convert-LatinToCyrillic $test.Question
    $answersCyrl = @()
    foreach ($ans in $test.Answers) {
        $answersCyrl += Convert-LatinToCyrillic $ans
    }
    
    # Format as PostgreSQL arrays - escape quotes and backslashes
    $answersEscaped = @()
    foreach ($ans in $test.Answers) {
        $escaped = $ans.Replace('\', '\\').Replace('"', '\"')
        $answersEscaped += "`"$escaped`""
    }
    $answersStr = "{" + ($answersEscaped -join ",") + "}"
    
    $answersCyrlEscaped = @()
    foreach ($ans in $answersCyrl) {
        $escaped = $ans.Replace('\', '\\').Replace('"', '\"')
        $answersCyrlEscaped += "`"$escaped`""
    }
    $answersCyrlStr = "{" + ($answersCyrlEscaped -join ",") + "}"
    
    # Escape quotes for CSV (double them)
    $q = $test.Question.Replace('"', '""')
    $qc = $questionCyrl.Replace('"', '""')
    $ans = $answersStr.Replace('"', '""')
    $ansc = $answersCyrlStr.Replace('"', '""')
    $img = $test.ImageUrl
    
    # Build CSV row
    $row = "`"$q`",`"$qc`",`"$ans`",`"$ansc`",$($test.CorrectAnswer),`"$img`",`"`",300,`"`",`"`",`"`",`"`",`"`",`"`""
    $csvLines += $row
}

# Write to file
$csvLines | Out-File -FilePath $csvPath -Encoding UTF8

Write-Host "✓ CSV file created: $csvPath" -ForegroundColor Green
Write-Host "✓ Total rows: $($allTests.Count)" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Open the CSV in Excel"
Write-Host "2. Fill in the 'category' column for each test"
Write-Host "3. Import to Supabase using the SQL Editor"
Write-Host "`nDone!" -ForegroundColor Green

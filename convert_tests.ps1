# Simple PowerShell script to convert DOCX tests to CSV
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
    $result = $result.Replace("Yo", "Ё").Replace("yo", "ё")
    $result = $result.Replace("Yu", "Ю").Replace("yu", "ю")
    $result = $result.Replace("Ya", "Я").Replace("ya", "я")
    $result = $result.Replace("Ye", "Е").Replace("ye", "е")
    
    # Use an array of objects to avoid case-insensitive key collisions
    $replacements = @(
        @{ L = "A"; C = "А" }; @{ L = "a"; C = "а" }
        @{ L = "B"; C = "Б" }; @{ L = "b"; C = "б" }
        @{ L = "D"; C = "Д" }; @{ L = "d"; C = "д" }
        @{ L = "E"; C = "Е" }; @{ L = "e"; C = "е" }
        @{ L = "F"; C = "Ф" }; @{ L = "f"; C = "ф" }
        @{ L = "G"; C = "Г" }; @{ L = "g"; C = "г" }
        @{ L = "H"; C = "Ҳ" }; @{ L = "h"; C = "ҳ" }
        @{ L = "I"; C = "И" }; @{ L = "i"; C = "и" }
        @{ L = "J"; C = "Ж" }; @{ L = "j"; C = "ж" }
        @{ L = "K"; C = "К" }; @{ L = "k"; C = "к" }
        @{ L = "L"; C = "Л" }; @{ L = "l"; C = "л" }
        @{ L = "M"; C = "М" }; @{ L = "m"; C = "м" }
        @{ L = "N"; C = "Н" }; @{ L = "n"; C = "н" }
        @{ L = "O"; C = "О" }; @{ L = "o"; C = "о" }
        @{ L = "P"; C = "П" }; @{ L = "p"; C = "п" }
        @{ L = "Q"; C = "Қ" }; @{ L = "q"; C = "қ" }
        @{ L = "R"; C = "Р" }; @{ L = "r"; C = "р" }
        @{ L = "S"; C = "С" }; @{ L = "s"; C = "с" }
        @{ L = "T"; C = "Т" }; @{ L = "t"; C = "т" }
        @{ L = "U"; C = "У" }; @{ L = "u"; C = "у" }
        @{ L = "V"; C = "В" }; @{ L = "v"; C = "в" }
        @{ L = "X"; C = "Х" }; @{ L = "x"; C = "х" }
        @{ L = "Y"; C = "Й" }; @{ L = "y"; C = "й" }
        @{ L = "Z"; C = "З" }; @{ L = "z"; C = "з" }
    )
    
    foreach ($pair in $replacements) {
        $result = $result.Replace($pair['L'], $pair['C'])
    }
    
    return $result
}

Write-Host "Starting DOCX to CSV conversion..." -ForegroundColor Cyan
Write-Host "=" * 60

$files = @(
    "test1-10.docx",
    "test11-20.docx",
    "test21-30.docx",
    "test31-40.docx",
    "test41-50.docx",
    "test51-60.docx"
)

$allTests = @()
$word = New-Object -ComObject Word.Application
$word.Visible = $false

foreach ($filename in $files) {
    Write-Host "`nProcessing $filename..." -ForegroundColor Yellow
    
    try {
        $fullPath = (Resolve-Path $filename).Path
        $doc = $word.Documents.Open($fullPath)
        $text = $doc.Content.Text
        $doc.Close()
        
        # Parse the text
        $lines = $text -split "`r" | Where-Object { $_.Trim() -ne "" }
        
        Write-Host "  Extracted $($lines.Count) lines" -ForegroundColor Green
        
        # Simple parsing
        $i = 0
        while ($i -lt $lines.Count) {
            $line = $lines[$i].Trim()
            
            # Skip bilet markers
            if ($line -match '^\d+-BILET') {
                $i++
                continue
            }
            
            # Check if this looks like a question
            if ($line -and $line -notmatch '^F\d+' -and $line -notmatch '^https?://') {
                $question = $line
                $answers = @()
                $correctIdx = 0
                $imageUrl = "https://i.postimg.cc/NGmgN66H/avtotest.png"
                
                # Look ahead for answers
                $j = $i + 1
                while ($j -lt $lines.Count -and $j -lt ($i + 20)) {
                    $nextLine = $lines[$j].Trim()
                    
                    # Check for image URL
                    if ($nextLine -match '^https?://') {
                        $imageUrl = $nextLine
                        $j++
                        continue
                    }
                    
                    # Check for answer marker
                    if ($nextLine -match '^F\d+') {
                        $j++
                        if ($j -lt $lines.Count) {
                            $answerText = $lines[$j].Trim()
                            
                            # Check if correct answer
                            if ($nextLine -match '\+' -or $answerText -match '\+$') {
                                $correctIdx = $answers.Count
                                $answerText = $answerText.TrimEnd('+').Trim()
                            }
                            
                            $answers += $answerText
                        }
                        $j++
                    }
                    elseif ($nextLine -match '^\d+-BILET' -or ($nextLine -and $nextLine -notmatch '^F\d+' -and $answers.Count -ge 2)) {
                        break
                    }
                    else {
                        $j++
                    }
                }
                
                # Add test if valid
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

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null

Write-Host "`n============================================================"
Write-Host "Total tests extracted: $($allTests.Count)" -ForegroundColor Cyan
Write-Host "============================================================`n"

# Create CSV manually
$csvPath = "ticket_60_tests.csv"
$csvContent = @()

# Header
$csvContent += "question,question_cyrl,answers,answers_cyrl,correct_answer,image_url,category,time_limit,audio_url,audio_url_cyrl,explanation_title,explanation_title_cyrl,explanation_text,explanation_text_cyrl"

# Data rows
foreach ($test in $allTests) {
    $questionCyrl = Convert-LatinToCyrillic $test.Question
    
    # Convert answers to Cyrillic
    $answersCyrl = @()
    foreach ($ans in $test.Answers) {
        $answersCyrl += Convert-LatinToCyrillic $ans
    }
    
    # Format as PostgreSQL arrays
    $answersStr = "{" + (($test.Answers | ForEach-Object { '"' + ($_ -replace '"', '\"') + '"' }) -join ",") + "}"
    $answersCyrlStr = "{" + (($answersCyrl | ForEach-Object { '"' + ($_ -replace '"', '\"') + '"' }) -join ",") + "}"
    
    # Escape quotes for CSV
    $q = $test.Question -replace '"', '""'
    $qc = $questionCyrl -replace '"', '""'
    $ans = $answersStr -replace '"', '""'
    $ansc = $answersCyrlStr -replace '"', '""'
    $img = $test.ImageUrl
    
    $row = """$q"",""$qc"",""$ans"",""$ansc"",$($test.CorrectAnswer),""$img"","""",300,"""","""","""","""","""",""""" 
    $csvContent += $row
}

$csvContent | Out-File -FilePath $csvPath -Encoding UTF8

Write-Host "✓ CSV file created: $csvPath" -ForegroundColor Green
Write-Host "✓ Total rows: $($allTests.Count)" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Open the CSV in Excel"
Write-Host "2. Fill in the 'category' column"
Write-Host "3. Import to Supabase"

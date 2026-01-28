const fs = require('fs');
const path = require('path');

// Latin to Cyrillic mapping for Uzbek
function latinToCyrillic(text) {
    if (!text) return text;
    let result = text;

    // Multi-character replacements (order matters)
    const replacements = [
        ["O'", "Ў"], ["o'", "ў"],
        ["G'", "Ғ"], ["g'", "ғ"],
        ["Sh", "Ш"], ["sh", "ш"],
        ["Ch", "Ч"], ["ch", "ч"],
        ["Yo", "Ё"], ["yo", "ё"],
        ["Yu", "Ю"], ["yu", "ю"],
        ["Ya", "Я"], ["ya", "я"],
        ["Ye", "Е"], ["ye", "е"],
        // Single characters
        ["A", "А"], ["a", "а"],
        ["B", "Б"], ["b", "б"],
        ["D", "Д"], ["d", "д"],
        ["E", "Е"], ["e", "е"],
        ["F", "Ф"], ["f", "ф"],
        ["G", "Г"], ["g", "г"],
        ["H", "Ҳ"], ["h", "ҳ"],
        ["I", "И"], ["i", "и"],
        ["J", "Ж"], ["j", "ж"],
        ["K", "К"], ["k", "к"],
        ["L", "Л"], ["l", "л"],
        ["M", "М"], ["m", "м"],
        ["N", "Н"], ["n", "н"],
        ["O", "О"], ["o", "о"],
        ["P", "П"], ["p", "п"],
        ["Q", "Қ"], ["q", "қ"],
        ["R", "Р"], ["r", "р"],
        ["S", "С"], ["s", "с"],
        ["T", "Т"], ["t", "т"],
        ["U", "У"], ["u", "у"],
        ["V", "В"], ["v", "в"],
        ["X", "Х"], ["x", "х"],
        ["Y", "Й"], ["y", "й"],
        ["Z", "З"], ["z", "з"]
    ];

    for (const [latin, cyrillic] of replacements) {
        result = result.split(latin).join(cyrillic);
    }
    return result;
}

function formatPostgresArray(arr) {
    if (!arr || arr.length === 0) return '{}';
    const escapedItems = arr.map(item => {
        // Escape backslashes first, then quotes
        const escaped = item.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `"${escaped}"`;
    });
    return `{${escapedItems.join(',')}}`;
}

function escapeCsv(text) {
    if (text === null || text === undefined) return '';
    return `"${String(text).replace(/"/g, '""')}"`;
}

const files = [
    'test1-10.txt',
    'test11-20.txt',
    'test21-30.txt',
    'test31-40.txt',
    'test41-50.txt',
    'test51-60.txt'
];

let allTests = [];

console.log('Starting CSV generation...');

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        const lines = content.split(/\r?\n/).filter(l => l.trim());

        // Per-file stats
        let fileTests = [];
        let currentQuestion = null;

        console.log(`Processing ${file}...`);

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            // Skip bilet headers
            if (line.match(/^\d+[-\s]*BILET/i)) continue;

            // Check for image URL
            if (line.match(/^http/i)) {
                if (currentQuestion) {
                    currentQuestion.image_url = line;
                }
                continue;
            }

            // Check for Answer
            // Matches:
            // F1 Answer
            // * F1 Answer
            // * F1 + Answer
            // F1+ Answer
            // F1Answer (no space)
            const answerMatch = line.match(/^[\*\-\s]*F(\d+)\s*(\+?)\s*(.*)/i);

            if (answerMatch) {
                if (currentQuestion) {
                    let hasPlus = answerMatch[2] === '+';
                    let ansText = answerMatch[3].trim();

                    // Handle "F1Answer" case where text is stuck to F1
                    // If no space and no +, ansText will be "Answer..."
                    // Wait, regex (\d+)\s*(.*) captures digits then text
                    // If "F1Text", digit is 1, text is "Text"

                    // If text is empty or just + or ., look ahead
                    if (!ansText || ansText === '+' || ansText === '.') {
                        if (ansText === '+') hasPlus = true;

                        // Look at next lines
                        let nextLineIdx = i + 1;
                        let accumulatedAns = "";

                        while (nextLineIdx < lines.length) {
                            const nextLine = lines[nextLineIdx].trim();
                            // Stop markers
                            if (nextLine.match(/^[\*\-\s]*F\d+/i) || nextLine.match(/^http/i) || nextLine.match(/^\d+[-\s]*BILET/i)) {
                                break;
                            }
                            // Also stop if line looks like start of a new question (long text, uppercase start?)
                            // Using a heuristic: if we have already accumulated text and next line is long, maybe it's new Q?
                            // Safest: assume answer ends at next marker or empty line (but we filtered empty lines).

                            accumulatedAns += (accumulatedAns ? " " : "") + nextLine;
                            nextLineIdx++;
                            i++;
                        }
                        ansText = accumulatedAns;
                    }

                    // Check for + marker in text
                    if (ansText.includes('+')) {
                        if (ansText.startsWith('+') || ansText.trim().endsWith('+')) {
                            hasPlus = true;
                            ansText = ansText.replace(/\+/g, '').trim();
                        }
                    }

                    currentQuestion.answers.push(ansText);
                    if (hasPlus) {
                        currentQuestion.correct_answer = currentQuestion.answers.length - 1;
                    }
                }
                continue;
            }

            // Start New Question
            // IF line is not an answer, not a URL, not a BILET
            // AND we already have a currentQuestion with answers -> save it

            // Should we skip short garbage lines? e.g. "1." or "-"
            if (line.match(/^[\d\-\.\s]+$/)) continue;

            if (currentQuestion && currentQuestion.answers.length >= 2) {
                fileTests.push(currentQuestion);
                currentQuestion = null;
            }

            if (!currentQuestion) {
                currentQuestion = {
                    question: line,
                    answers: [],
                    correct_answer: 0,
                    image_url: 'https://i.postimg.cc/NGmgN66H/avtotest.png'
                };
            } else {
                // Determine if appending to question or new question
                // If previous line didn't look like a complete question?
                // For simplicity, handle multi-line questions by appending
                currentQuestion.question += ' ' + line;
            }
        }

        // Push last question
        if (currentQuestion && currentQuestion.answers.length >= 2) {
            fileTests.push(currentQuestion);
        }

        console.log(`  -> Extracted ${fileTests.length} tests`);
        allTests = allTests.concat(fileTests);

    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
}

console.log('===================================');
console.log(`Total extracted tests: ${allTests.length}`);
console.log('===================================');

// Write CSV
const csvHeaders = [
    'question', 'question_cyrl', 'answers', 'answers_cyrl',
    'correct_answer', 'image_url', 'category', 'time_limit',
    'audio_url', 'audio_url_cyrl', 'explanation_title',
    'explanation_title_cyrl', 'explanation_text', 'explanation_text_cyrl'
];

const csvRows = [csvHeaders.join(',')];

for (const test of allTests) {
    const qCyrl = latinToCyrillic(test.question);
    const answersCyrl = test.answers.map(latinToCyrillic);
    const answersPg = formatPostgresArray(test.answers);
    const answersCyrlPg = formatPostgresArray(answersCyrl);

    const row = [
        escapeCsv(test.question),
        escapeCsv(qCyrl),
        escapeCsv(answersPg),
        escapeCsv(answersCyrlPg),
        test.correct_answer,
        escapeCsv(test.image_url),
        '""', // category empty
        300,  // time_limit
        '""', '""', '""', '""', '""', '""'
    ];
    csvRows.push(row.join(','));
}

fs.writeFileSync('ticket_60_tests.csv', csvRows.join('\n'), 'utf8');
console.log('CSV file created successfully!');

const fs = require('fs');
const path = require('path');

// Comprehensive Uzbek Latin to Cyrillic mapping
function latinToCyrillic(text) {
    if (!text) return text;
    let result = text;
    const replacements = [
        ["O'", "Ў"], ["o'", "ў"], ["G'", "Ғ"], ["g'", "ғ"],
        ["O`", "Ў"], ["o`", "ў"], ["G`", "Ғ"], ["g`", "ғ"],
        ["Sh", "Ш"], ["sh", "ш"], ["Ch", "Ч"], ["ch", "ч"],
        ["Yo", "Ё"], ["yo", "ё"], ["Yu", "Ю"], ["yu", "ю"],
        ["Ya", "Я"], ["ya", "я"], ["Ye", "Е"], ["ye", "е"],
        ["A", "А"], ["a", "а"], ["B", "Б"], ["b", "б"],
        ["D", "Д"], ["d", "д"], ["E", "Е"], ["e", "е"],
        ["F", "Ф"], ["f", "ф"], ["G", "Г"], ["g", "г"],
        ["H", "Ҳ"], ["h", "ҳ"], ["I", "И"], ["i", "и"],
        ["J", "Ж"], ["j", "ж"], ["K", "К"], ["k", "к"],
        ["L", "Л"], ["l", "л"], ["M", "М"], ["m", "м"],
        ["N", "Н"], ["n", "н"], ["O", "О"], ["o", "о"],
        ["P", "П"], ["p", "п"], ["Q", "Қ"], ["q", "қ"],
        ["R", "Р"], ["r", "р"], ["S", "С"], ["s", "с"],
        ["T", "Т"], ["t", "т"], ["U", "У"], ["u", "у"],
        ["V", "В"], ["v", "в"], ["X", "Х"], ["x", "х"],
        ["Y", "Й"], ["y", "й"], ["Z", "З"], ["z", "з"],
        ["'", "ъ"]
    ];
    for (const [latin, cyrillic] of replacements) {
        result = result.split(latin).join(cyrillic);
    }
    return result;
}

// Comprehensive Uzbek Cyrillic to Latin mapping
function cyrillicToLatin(text) {
    if (!text) return text;
    let result = text;
    const replacements = [
        ["Ў", "O'"], ["ў", "o'"], ["Ғ", "G'"], ["ғ", "g'"],
        ["Ш", "Sh"], ["ш", "sh"], ["Ч", "Ch"], ["ч", "ch"],
        ["Ё", "Yo"], ["ё", "yo"], ["Ю", "Yu"], ["ю", "yu"],
        ["Я", "Ya"], ["я", "ya"], ["Е", "Ye"], ["е", "ye"],
        ["Э", "E"], ["э", "e"],
        ["Ц", "Ts"], ["ц", "ts"],
        ["А", "A"], ["а", "a"], ["Б", "B"], ["б", "b"],
        ["Д", "D"], ["д", "d"], ["Ф", "F"], ["ф", "f"],
        ["Г", "G"], ["г", "g"], ["Ҳ", "H"], ["ҳ", "h"],
        ["И", "I"], ["и", "i"], ["Ж", "J"], ["ж", "j"],
        ["К", "K"], ["к", "k"], ["Л", "L"], ["л", "l"],
        ["М", "M"], ["м", "m"], ["Н", "N"], ["н", "n"],
        ["О", "O"], ["о", "o"], ["П", "P"], ["п", "p"],
        ["Қ", "Q"], ["қ", "q"], ["Р", "R"], ["р", "r"],
        ["С", "S"], ["с", "s"], ["Т", "T"], ["т", "t"],
        ["У", "U"], ["у", "u"], ["В", "V"], ["в", "v"],
        ["Х", "X"], ["х", "x"], ["Й", "Y"], ["й", "y"],
        ["З", "Z"], ["з", "z"], ["ъ", ""]
    ];
    for (const [cyr, lat] of replacements) {
        result = result.split(cyr).join(lat);
    }
    return result;
}

function isCyrillic(text) {
    if (!text) return false;
    return /[А-Яа-яЁё]/.test(text);
}

function processText(text, targetScript) {
    if (!text) return '';
    const cleanText = text.replace(/https?:\/\/ptest\.uz\S+/gi, '').trim();
    if (!cleanText) return '';

    const textIsCyrillic = isCyrillic(cleanText);
    if (targetScript === 'lat') {
        return textIsCyrillic ? cyrillicToLatin(cleanText) : cleanText;
    } else {
        return textIsCyrillic ? cleanText : latinToCyrillic(cleanText);
    }
}

function formatPostgresArray(arr) {
    if (!arr || arr.length === 0) return '{}';
    return `{${arr.map(item => `"${item.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
}

function escapeCsv(text) {
    if (text === null || text === undefined) return '';
    return `"${String(text).replace(/"/g, '""')}"`;
}

const files = [
    'test1-10.txt', 'test11-20.txt', 'test21-30.txt',
    'test31-40.txt', 'test41-50.txt', 'test51-60.txt'
];

let allTests = [];
const ticketStats = {};

console.log('Starting Aggressive Regex-based Parsing...');

let lastGlobalTicket = 0;
let leftoversQuestionText = '';

for (const file of files) {
    try {
        const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

        // Regex for markers
        const markerRegex = /(\d+\s*[-\s]*BILET|BILET\s*\d*|\*?\s*F\d+\b|https?:\/\/ptest\.uz\S+)/gi;

        let match;
        const items = [];
        while ((match = markerRegex.exec(content)) !== null) {
            items.push({
                type: match[0].match(/BILET/i) ? 'BILET' : (match[0].match(/http/i) ? 'URL' : 'F'),
                value: match[0],
                pos: match.index,
                end: markerRegex.lastIndex
            });
        }

        console.log(`Processing ${file}: Found ${items.length} markers`);

        let currentTicket = null;
        let lastAnswerEnd = 0;
        leftoversQuestionText = '';

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type === 'BILET') {
                const bMatch = item.value.match(/(\d+)/);
                if (bMatch) {
                    currentTicket = parseInt(bMatch[1], 10);
                    lastGlobalTicket = currentTicket;
                } else {
                    currentTicket = ++lastGlobalTicket;
                }
                // Any text between last processed position and BILET marker
                // might be question text if we are transitioning.
                // But usually BILET is followed by the first question text.
                lastAnswerEnd = item.end;
                continue;
            }

            if (item.type === 'F') {
                const fNumMatch = item.value.match(/F(\d+)/i);
                const fNum = parseInt(fNumMatch[1], 10);

                if (fNum === 1) {
                    // The text BETWEEN the start of this question's markers and the previous question's end
                    // contains the question text.
                    // Previous question's end was the end of its last answer.
                    let qBlock = content.substring(lastAnswerEnd, item.pos).trim();

                    // Prepend anything we picked up from the very start or after BILET
                    let fullQText = (leftoversQuestionText + ' ' + qBlock).trim();
                    leftoversQuestionText = '';

                    let pendingQuestion = {
                        question: fullQText,
                        answers: [],
                        correct_answer: 0,
                        image_url: 'https://i.postimg.cc/NGmgN66H/avtotest.png',
                        ticket: currentTicket
                    };
                    allTests.push(pendingQuestion);
                    ticketStats[currentTicket] = (ticketStats[currentTicket] || 0) + 1;
                }

                const currentQ = allTests[allTests.length - 1];
                if (currentQ) {
                    // The answer text is after this F marker and before the next marker
                    let nextMarkerPos = (i + 1 < items.length) ? items[i + 1].pos : content.length;
                    let rawAnswerBlock = content.substring(item.end, nextMarkerPos);

                    // Is this the LAST answer of the current test?
                    // It's the last if the next marker is F1, BILET or EOF.
                    let isLastAnswer = (i + 1 >= items.length) || (items[i + 1].type === 'BILET') || (items[i + 1].value.match(/F1\b/i));

                    let ansText = '';
                    if (isLastAnswer) {
                        // Split the block: part belongs to answer, part belongs to the NEXT question
                        let splitIndex = rawAnswerBlock.lastIndexOf('\n\n');
                        if (splitIndex === -1) splitIndex = rawAnswerBlock.lastIndexOf('\r\n\r\n');

                        if (splitIndex !== -1) {
                            ansText = rawAnswerBlock.substring(0, splitIndex).trim();
                            leftoversQuestionText = rawAnswerBlock.substring(splitIndex).trim();
                        } else {
                            // Single line or no clear split, assume it's just answer if short
                            if (rawAnswerBlock.length < 100) {
                                ansText = rawAnswerBlock.trim();
                            } else {
                                // Try single newline if long
                                let lastLine = rawAnswerBlock.lastIndexOf('\n');
                                if (lastLine !== -1) {
                                    ansText = rawAnswerBlock.substring(0, lastLine).trim();
                                    leftoversQuestionText = rawAnswerBlock.substring(lastLine).trim();
                                } else {
                                    ansText = rawAnswerBlock.trim();
                                }
                            }
                        }
                    } else {
                        ansText = rawAnswerBlock.trim();
                    }

                    let isCorrect = item.value.includes('+') || ansText.includes('+');
                    ansText = ansText.replace(/\+/g, '').replace(/\s+/g, ' ').trim();

                    currentQ.answers.push(ansText);
                    if (isCorrect) currentQ.correct_answer = currentQ.answers.length - 1;

                    lastAnswerEnd = nextMarkerPos;
                }
            }

            if (item.type === 'URL') {
                const currentQ = allTests[allTests.length - 1];
                // If we have a question but no answers yet, the URL probably belongs to it
                if (currentQ && currentQ.answers.length === 0) {
                    currentQ.image_url = item.value.trim();
                }
                // Don't update lastAnswerEnd, let the next F update it
            }
        }

    } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
    }
}

console.log('\n--- Final Statistics ---');
const sortedTickets = Object.keys(ticketStats).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
sortedTickets.forEach(t => {
    if (ticketStats[t] !== 20) console.log(`[!] Bilet ${t}: ${ticketStats[t]} tests`);
});
console.log(`Total Tickets Found: ${sortedTickets.length}`);
console.log(`Total Extracted Tests: ${allTests.length}`);

// Generate CSV
const csvHeaders = ['question', 'question_cyrl', 'answers', 'answers_cyrl', 'correct_answer', 'image_url', 'category', 'time_limit'];
const rows = [csvHeaders.join(',')];
allTests.forEach(t => {
    // Process script detection and conversion
    const qLat = processText(t.question, 'lat');
    const qCyrl = processText(t.question, 'cyr');

    const aLat = t.answers.map(a => processText(a, 'lat')).filter(a => a.length > 0);
    const aCyrl = t.answers.map(a => processText(a, 'cyr')).filter(a => a.length > 0);

    if (aLat.length < 2) return; // Skip invalid

    rows.push([
        escapeCsv(qLat), escapeCsv(qCyrl),
        escapeCsv(formatPostgresArray(aLat)), escapeCsv(formatPostgresArray(aCyrl)),
        t.correct_answer, escapeCsv(t.image_url), escapeCsv(`Bilet ${t.ticket}`), 300
    ].join(','));
});

fs.writeFileSync('ticket_60_tests.csv', rows.join('\n'), 'utf8');
console.log('CSV regenerated: ticket_60_tests.csv');

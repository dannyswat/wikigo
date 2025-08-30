export function smartCompare(a: string, b: string): number {
    return dateCompare(a, b) ??
        versionCompare(a, b) ??
        orderListCompare(a, b) ??
        a.toLowerCase().localeCompare(b.toLowerCase());
}

function dateCompare(a: string, b: string): (number | null) {
    // Try to extract date patterns from strings
    const datePatterns = [
        /\b(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)?)\b/, // ISO dates
        /\b(\d{4}\/\d{1,2}\/\d{1,2})\b/, // YYYY/MM/DD
        /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/, // MM/DD/YYYY
        /\b(\d{8})\b/, // YYYYMMDD
        /\b(\d{13})\b/, // Timestamps (13 digits)
        /\b(\d{10})\b/, // Timestamps (10 digits)
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}, \d{4})\b/i // "Jan 01, 2024"
    ];

    let dateA: Date | null = null;
    let dateB: Date | null = null;

    // Try to find and parse dates from both strings
    for (const pattern of datePatterns) {
        const matchA = a.match(pattern);
        const matchB = b.match(pattern);

        if (matchA && matchB) {
            const candidateA = new Date(matchA[1]);
            const candidateB = new Date(matchB[1]);

            if (!isNaN(candidateA.getTime()) && !isNaN(candidateB.getTime())) {
                dateA = candidateA;
                dateB = candidateB;
                break;
            }
        }
    }

    // Try parsing the whole strings as dates if no patterns matched
    if (!dateA || !dateB) {
        const wholeDateA = new Date(a);
        const wholeDateB = new Date(b);

        // Only use if both are valid dates and neither is just a number
        if (!isNaN(wholeDateA.getTime()) && !isNaN(wholeDateB.getTime()) &&
            isNaN(Number(a)) && isNaN(Number(b))) {
            dateA = wholeDateA;
            dateB = wholeDateB;
        }
    }

    if (!dateA || !dateB) return null;

    return dateA.getTime() - dateB.getTime();
}

function versionCompare(a: string, b: string): (number | null) {
    // Extract version-like patterns from strings (e.g., "1.2.3" from "file_v1.2.3.txt")
    // Updated regex to handle version prefixes like "v" or "_v"
    const versionRegex = /(?:^|[^.\d])(\d+(?:\.\d+)+)(?:[^.\d]|$)/;
    const matchA = a.match(versionRegex);
    const matchB = b.match(versionRegex);

    if (!matchA || !matchB) return null;

    const versionA = matchA[1].split('.').map(num => parseInt(num, 10));
    const versionB = matchB[1].split('.').map(num => parseInt(num, 10));

    // If any part is NaN, it's not a valid version
    if (versionA.some(isNaN) || versionB.some(isNaN)) return null;

    const length = Math.max(versionA.length, versionB.length);
    for (let i = 0; i < length; i++) {
        const numA = versionA[i] || 0;
        const numB = versionB[i] || 0;
        if (numA !== numB) {
            return numA - numB;
        }
    }
    return 0;
}

function orderListCompare(a: string, b: string): (number | null) {
    // Extract ordered list patterns from strings (e.g., "1.", "2)", "11.", "12)")
    const orderListRegex = /^(\d+)[\.)]\s*/;
    const matchA = a.match(orderListRegex);
    const matchB = b.match(orderListRegex);

    if (!matchA || !matchB) return null;

    const numA = parseInt(matchA[1], 10);
    const numB = parseInt(matchB[1], 10);

    // If any part is NaN, it's not a valid ordered list
    if (isNaN(numA) || isNaN(numB)) return null;

    return numA - numB;
}
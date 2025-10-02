// Script to generate word data from words.csv
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read words.csv
const csvPath = join(__dirname, '..', 'words.csv');
const csvContent = readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const header = lines[0]; // Skip header
const data = lines.slice(1).map(line => {
    const [word, frequency] = line.split(',');
    return { word: word.toLowerCase(), frequency: parseFloat(frequency) };
}).filter(item => item.word && !isNaN(item.frequency));

console.log(`Loaded ${data.length} words from CSV`);

// Generate JavaScript code
const wordList = data.map(d => d.word);
const frequencies = data.map(d => d.frequency);

const jsCode = `// Auto-generated from words.csv
// DO NOT EDIT MANUALLY - run 'node scripts/generate-word-data.js' to regenerate

export const WORD_FREQUENCIES = ${JSON.stringify(frequencies, null, 2)};

export const WORD_LIST_WITH_FREQ = ${JSON.stringify(data, null, 2)};
`;

// Write to file
const outputPath = join(__dirname, '..', 'src', 'core', 'wordFrequencies.js');
writeFileSync(outputPath, jsCode);

console.log(`Generated ${outputPath}`);
console.log(`First 5 words: ${wordList.slice(0, 5).join(', ')}`);
console.log(`Last 5 words: ${wordList.slice(-5).join(', ')}`);
console.log(`Sample frequencies: work=${frequencies[wordList.indexOf('work')]}, word=${frequencies[wordList.indexOf('word')]}`);

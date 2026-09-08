const fs = require('fs');
const path = require('path');

const weatherList = [
  "The sky was completely cloudless and painfully bright.",
  "A thin, milky cloud covered the entire sky.",
  "A heavy, flat layer of gray clouds hung low.",
  "A thick fog swallowed the streetlights completely.",
  "The rain continued without a clear beginning.",
  "Steady rain washed away the traces of footsteps.",
  "Snow fell in absolute silence, absorbing all sound.",
  "A sudden flash of lightning illuminated nothing."
];

const actionList = [
  "The tail moved once.",
  "Stared at the blank wall for an hour.",
  "Counted the floorboards and lost track.",
  "Pressed a finger against the glass.",
  "Listened to a sound that wasn't there.",
  "Stood by the window, waiting for nothing.",
  "Rearranged the empty chairs.",
  "Sat on the floor until legs went numb."
];

const anomalyList = [
  "No explanation was found.",
  "The shadow didn't match the body.",
  "A sound came from inside the wall.",
  "The clock hand skipped a beat.",
  "The calendar showed yesterday's date again.",
  "There was a smell of rain indoors."
];

const shortLineList = [
  "That was all.",
  "So what?",
  "Nothing changed.",
  "Or maybe not.",
  "It didn't matter.",
  "Nobody noticed.",
  "Again.",
  "Who knows."
];

function hashDate(dateString, salt) {
  let hash = 2166136261 ^ salt;
  for (const character of dateString) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick(list, dateString, salt) {
  return list[hashDate(dateString, salt) % list.length];
}

function getTokyoDate(offsetDays = 0) {
  const now = new Date();
  const tokyoString = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  const date = new Date(`${tokyoString}T00:00:00+09:00`);
  date.setDate(date.getDate() - offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function generateText(dateString) {
  const lines = [
    pick(weatherList, dateString, 1),
    pick(actionList, dateString, 2),
    pick(anomalyList, dateString, 3),
    pick(shortLineList, dateString, 4)
  ];
  return lines.join('<br>\n');
}

const targetPath = path.join(__dirname, 'diary.html');
if (!fs.existsSync(targetPath)) {
  console.error(`ERROR: ${targetPath} does not exist.`);
  process.exit(1);
}

const startMarker = '<!-- AUTO_ARCHIVE_START -->';
const endMarker = '<!-- AUTO_ARCHIVE_END -->';
const html = fs.readFileSync(targetPath, 'utf8');
const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
  console.error('ERROR: Diary archive markers were not found or are invalid.');
  process.exit(1);
}

let postsHtml = '\n';
for (let offset = 0; offset < 5; offset += 1) {
  const date = getTokyoDate(offset);
  postsHtml += `        <div class="diary-post">\n`;
  postsHtml += `            <span class="diary-date">${date}</span>\n`;
  postsHtml += `            <p class="secret-text">${generateText(date)}</p>\n`;
  postsHtml += `        </div>\n`;
}

const insertPos = startIndex + startMarker.length;
const updatedHtml = html.slice(0, insertPos) + postsHtml + '    ' + html.slice(endIndex);
fs.writeFileSync(targetPath, updatedHtml, 'utf8');
console.log(`Diary updated successfully: ${targetPath}`);

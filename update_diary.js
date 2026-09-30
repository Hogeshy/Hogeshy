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

const quietCareList = [
  "A small patch of sunlight reached the floor.",
  "Nothing happened. It was not a bad day.",
  "The empty can stayed nearby, just in case.",
  "The tail looked back. Hogeshy stayed where it was.",
  "For a moment, there was nothing to fix."
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
  // Let a small sign of rest or contentment surface occasionally without explaining it.
  if (hashDate(dateString, 5) % 3 === 0) {
    lines.push(pick(quietCareList, dateString, 6));
  }
  return lines.join('<br>\n');
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRssFeed(archiveHtml) {
  const posts = Array.from(archiveHtml.matchAll(
    /<div class="diary-post">\s*<span class="diary-date">(\d{4}-\d{2}-\d{2})<\/span>\s*<p class="secret-text">([\s\S]*?)<\/p>\s*<\/div>/g
  ));

  const items = posts.slice(0, 30).map(([, date, rawBody]) => {
    const body = rawBody
      .replace(/<br\s*\/?>(?:\r?\n)?/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    const description = body.split('\n').map(line => escapeXml(line)).join('\n');
    return `    <item>\n      <title>Hogeshy Diary — ${date}</title>\n      <link>https://hogeshy.github.io/Hogeshy/diaryarchive.html</link>\n      <guid isPermaLink="false">hogeshy-diary-${date}</guid>\n      <pubDate>${new Date(`${date}T00:00:00+09:00`).toUTCString()}</pubDate>\n      <description>${description}</description>\n    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Hogeshy Diary</title>\n    <link>https://hogeshy.github.io/Hogeshy/diaryarchive.html</link>\n    <description>Small records from Hogeshy, a quiet black cat.</description>\n    <language>en</language>\n${items}\n  </channel>\n</rss>\n`;
}

function writeRssFeed(archiveHtml) {
  const rssPath = path.join(__dirname, 'diary.xml');
  fs.writeFileSync(rssPath, buildRssFeed(archiveHtml), 'utf8');
  console.log(`RSS feed updated: ${rssPath}`);
}

// Diary Archive is the live archive page. Keep this filename in sync with the site navigation.
const targetPath = path.join(__dirname, 'diaryarchive.html');
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

const archiveBodyStart = startIndex + startMarker.length;
const archiveBody = html.slice(archiveBodyStart, endIndex);
const existingDates = new Set(
  Array.from(archiveBody.matchAll(/<span class="diary-date">(\d{4}-\d{2}-\d{2})<\/span>/g), match => match[1])
);

// Add only dates that are not already stored. Older diary entries are never deleted.
let additions = '';
for (let offset = 0; offset < 5; offset += 1) {
  const date = getTokyoDate(offset);
  if (existingDates.has(date)) continue;
  additions += `\n        <div class="diary-post">\n`;
  additions += `            <span class="diary-date">${date}</span>\n`;
  additions += `            <p class="secret-text">${generateText(date)}</p>\n`;
  additions += `        </div>\n`;
}

if (!additions) {
  console.log('Diary already contains the latest Tokyo dates.');
  writeRssFeed(html);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'diary_updated=false\n', 'utf8');
  }
  process.exit(0);
}

const updatedHtml = html.slice(0, archiveBodyStart) + additions + archiveBody;
fs.writeFileSync(targetPath, updatedHtml, 'utf8');
writeRssFeed(updatedHtml);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'diary_updated=true\n', 'utf8');
}
console.log(`Diary updated successfully: ${targetPath}`);

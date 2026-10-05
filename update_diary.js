const fs = require('fs');
const path = require('path');

const weatherList = [
  "空は雲ひとつなく、まぶしすぎた。",
  "薄い雲が空全体を覆っていた。",
  "重たい灰色の雲が低く垂れていた。",
  "濃い霧が街灯をすっかり飲み込んでいた。",
  "雨は、始まりもなく降り続いた。",
  "静かな雨が足あとを洗い流した。",
  "雪が、音をすべて吸い込みながら静かに降った。",
  "突然の雷が、何も照らさなかった。"
];

const actionList = [
  "尻尾が一度だけ動いた。",
  "何もない壁を一時間見ていた。",
  "床板を数えて、途中でわからなくなった。",
  "ガラスに指を押しつけた。",
  "そこにはない音を聞いていた。",
  "窓辺に立って、何も待たなかった。",
  "空の椅子を並べ直した。",
  "足がしびれるまで床に座っていた。"
];

const anomalyList = [
  "説明は見つからなかった。",
  "影が身体と合っていなかった。",
  "壁の中から音がした。",
  "時計の針が一拍飛んだ。",
  "カレンダーがまた昨日の日付を示していた。",
  "部屋の中で雨の匂いがした。"
];

const shortLineList = [
  "それだけだった。",
  "それで？",
  "何も変わらなかった。",
  "そうではないのかもしれない。",
  "気にしなかった。",
  "誰も気づかなかった。",
  "また。",
  "さあ、どうだろう。"
];

const quietCareList = [
  "小さな日だまりが床に届いた。",
  "何も起きなかった。悪い日ではなかった。",
  "空の缶は、念のため近くに置いた。",
  "尻尾が振り返った。ホゲシーはその場にいた。",
  "少しの間、直すものは何もなかった。"
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
    return `    <item>\n      <title>ホゲシーの日記 — ${date}</title>\n      <link>https://hogeshy.github.io/Hogeshy/diaryarchive.html</link>\n      <guid isPermaLink="false">hogeshy-diary-${date}</guid>\n      <pubDate>${new Date(`${date}T00:00:00+09:00`).toUTCString()}</pubDate>\n      <description>${description}</description>\n    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>ホゲシーの日記</title>\n    <link>https://hogeshy.github.io/Hogeshy/diaryarchive.html</link>\n    <description>静かな黒猫ホゲシーの小さな記録。</description>\n    <language>ja</language>\n${items}\n  </channel>\n</rss>\n`;
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

// The archive viewer and closing HTML live after the generated entries.
// Refuse to update a damaged file instead of publishing a page with only placeholders.
if (!html.includes('</html>') || !html.includes('const postElements')) {
  console.error('ERROR: Diary archive viewer markup is missing.');
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

const updatedHtml = html.slice(0, archiveBodyStart) + additions + archiveBody + html.slice(endIndex);
fs.writeFileSync(targetPath, updatedHtml, 'utf8');
writeRssFeed(updatedHtml);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'diary_updated=true\n', 'utf8');
}
console.log(`Diary updated successfully: ${targetPath}`);

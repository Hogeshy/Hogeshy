const fs = require('fs');

const diaryTemplates = [
    "(completely blank)",
    "Managed to think about nothing again today.",
    "Ate a can of nothingness. Tasted like nothing.",
    "Someone is moving the cursor on the other side of the screen.",
    "Hoge × Munashy = Hogeshy. Nothing else matters.",
    "...",
    "The floor is cold. I feel like staying on the floor forever.",
    "The date changed. So what?"
];

const randomText = diaryTemplates[Math.floor(Math.random() * diaryTemplates.length)];

// 常に日本時間の今日の日付（YYYY-MM-DD）を取得
const today = new Date().toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).replace(/\//g, '-');

let diaryHtmlContent = fs.readFileSync('diary.html', 'utf8');

const newPostHtml = `
        <div class="diary-post">
            <span class="diary-date">${today}</span>
            <p class="secret-text">${randomText}</p>
        </div>`;

// <!-- AUTO_ARCHIVE_START --> の直後に新しい日記を挿入
diaryHtmlContent = diaryHtmlContent.replace(
    '<!-- AUTO_ARCHIVE_START -->',
    '<!-- AUTO_ARCHIVE_START -->' + newPostHtml
);

fs.writeFileSync('diary.html', diaryHtmlContent, 'utf8');
console.log(`New diary added for ${today}: ${randomText}`);
const fs = require('fs');

// 自動生成する日記のバリエーション
const diaryTemplates = [
    "（すべて白紙）",
    "今日もうまく何も考えられなかった。",
    "虚無味の缶詰を食べた。味がしなかった。",
    "画面の向こうで誰かがマウスを動かしている気がする。",
    "Hoge × Munashy = Hogeshy. それ以外は何も無い。",
    "...",
    "床が冷たい。ずっと床でいい気がする。",
    "日付が変わった。だから何だというのか。"
];

const randomText = diaryTemplates[Math.floor(Math.random() * diaryTemplates.length)];
const today = new Date().toISOString().split('T')[0];

// diary.html を読み込む
let diaryHtmlContent = fs.readFileSync('diary.html', 'utf8');

// 新しい日記のHTMLパーツを作る
const newPostHtml = `
            <div class="diary-post">
                <span class="diary-date">${today}</span>
                <p class="secret-text">${randomText}</p>
            </div>`;

// の直後に新しい日記を挿入する（上へ上へと溜まっていく）
diaryHtmlContent = diaryHtmlContent.replace(
    '',
    '' + newPostHtml
);

// 書き換えた diary.html を保存
fs.writeFileSync('diary.html', diaryHtmlContent, 'utf8');
console.log(`New diary added for ${today}: ${randomText}`);
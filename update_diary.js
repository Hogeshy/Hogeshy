const fs = require('fs');

const weatherList = [
    "Pellets of hail struck the windowpane.",
    "Small ice grains bounced off the pavement.",
    "The sky was completely cloudless and painfully bright.",
    "A mercilessly clear sky stretched overhead.",
    "The weather was clear, but the light felt distant.",
    "A quiet, calm patch of sunlight filled the corner.",
    "A thin, milky cloud covered the entire sky.",
    "The sun filtered weakly through a pale haze.",
    "A heavy, flat layer of gray clouds hung low.",
    "The sky lost all its color under the overcast.",
    "A dry haze blurred the outlines of the buildings.",
    "The air smelled of distant smoke and dust.",
    "A sudden dust storm coated everything in fine grit.",
    "The wind carried a cloud of dry earth against the glass.",
    "Loose snow swept horizontally across the ground.",
    "A ground blizzard blurred the boundary of the path.",
    "A thick fog swallowed the streetlights completely.",
    "Visibility dropped to zero in the dense morning fog.",
    "A silent drizzle fell without leaving ripples.",
    "An invisible mist hung in the air, wetting the skin.",
    "The rain continued without a clear beginning.",
    "Steady rain washed away the traces of footsteps.",
    "Cold sleet tapped rhythmically against the metal.",
    "A mixture of rain and snow melted upon contact.",
    "Snow fell in absolute silence, absorbing all sound.",
    "Soft snowflakes piled up undisturbed.",
    "Hard hailstones rattled against the roof.",
    "Ice chunks fell abruptly from the empty sky.",
    "A sudden flash of lightning illuminated nothing.",
    "Distant thunder shook the floorboards without a storm."
];

const actionList = [
    "The tail moved once.",
    "Stared at the blank wall for an hour.",
    "Counted the floorboards and lost track.",
    "Pressed a finger against the glass.",
    "Breathed onto the mirror.",
    "Listened to a sound that wasn't there.",
    "Turned the pages of a book with no words.",
    "Stood by the window, waiting for nothing.",
    "Drank a glass of lukewarm water.",
    "Wrote a letter and burned it immediately.",
    "Rearranged the empty chairs.",
    "Watched the dust motes dance in the shaft of light.",
    "Humming a melody with no beginning.",
    "Traced a crack in the ceiling with eyes.",
    "Sat on the floor until legs went numb."
];

const anomalyList = [
    "No explanation was found.",
    "The shadow didn't match the body.",
    "A sound came from inside the wall.",
    "The clock hand skipped a beat.",
    "Nobody was there, yet the chair was warm.",
    "The door was locked from the inside, but open.",
    "A single footprint appeared on the ceiling.",
    "The calendar showed yesterday's date again.",
    "An unfamiliar object sat on the desk.",
    "The telephone rang once, then went silent.",
    "A reflection blinked a fraction of a second late.",
    "The plants grew an inch while looking away.",
    "A book fell off the shelf by itself.",
    "The light flickered in a Morse code pattern.",
    "There was a smell of rain indoors."
];

const shortLineList = [
    "That was all.",
    "So what?",
    "Nothing changed.",
    "Or maybe not.",
    "...",
    "Too late.",
    "It didn't matter.",
    "Just a routine.",
    "Nobody noticed.",
    "End of story.",
    "Again.",
    "Who knows."
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateText() {
    const selectedLines = [];
    selectedLines.push(getRandom(weatherList));
    selectedLines.push(getRandom(actionList));
    if (Math.random() < 0.7) {
        selectedLines.push(getRandom(anomalyList));
    }
    selectedLines.push(getRandom(shortLineList));
    return selectedLines.join('<br>\n');
}

// 9/4 から 9/8 までの日付リスト
const targetDates = [
    "2026-09-08",
    "2026-09-07",
    "2026-09-06",
    "2026-09-05",
    "2026-09-04"
];

let allNewPostsHtml = "\n";
targetDates.forEach(date => {
    const randomText = generateText();
    allNewPostsHtml += `        <div class="diary-post">
            <span class="diary-date">${date}</span>
            <p class="secret-text">${randomText}</p>
        </div>\n`;
});

let diaryHtmlContent = fs.readFileSync('diary.html', 'utf8');

// <!-- AUTO_ARCHIVE_START --> とその下の既存の古い投稿ブロックをまるごと置き換える
// （<!-- AUTO_ARCHIVE_START --> から最後の </div> までの古いリストをクリアする）
const startIndex = diaryHtmlContent.indexOf('<!-- AUTO_ARCHIVE_START -->');
if (startIndex !== -1) {
    const insertPoint = startIndex + '<!-- AUTO_ARCHIVE_START -->'.length;
    // 既存の raw-posts の中身を新しい5日分で綺麗に置き換え
    const endIndex = diaryHtmlContent.indexOf('</div>\n    </div>', insertPoint); // フッター付近の閉じタグを目安にするか、単純に置換
    
    // 安全に <!-- AUTO_ARCHIVE_START --> の後ろを今回の5日分だけに書き換える
    // 既存の <div class="raw-posts" id="rawPosts"> の中身を一旦綺麗にするアプローチ
    const rawPostsStart = diaryHtmlContent.indexOf('<div class="raw-posts" id="rawPosts">');
    const rawPostsEnd = diaryHtmlContent.indexOf('</div>', rawPostsStart); // うまく調整
}

// シンプルかつ確実に、<!-- AUTO_ARCHIVE_START --> から次の終了タグまでをごっそり入れ替える正規表現または文字列置換にするよ
// 一度diary.htmlの該当部分をスッキリさせるため、<!-- AUTO_ARCHIVE_START --> 以降の <div class="raw-posts"...> の中身を丸ごと生成し直す形にします。

const newRawPostsBlock = `<div class="raw-posts" id="rawPosts">
        <!-- AUTO_ARCHIVE_START -->
${allNewPostsHtml}    </div>`;

// 既存の raw-posts ブロック全体を新しいブロックで置換
const rawPostsRegex = /<div class="raw-posts" id="rawPosts">[\s\S]*?<\/div>\s*<\/div>/; // ※構造に合わせて調整
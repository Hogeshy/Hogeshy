const fs = require('fs');
const path = require('path');

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

const targetPath = path.join(__dirname, 'diary.html');
console.log("Target file path:", targetPath);

if (!fs.existsSync(targetPath)) {
    console.error("ERROR: diary.html does not exist in this directory!");
    process.exit(1);
}

const dates = ["2026-09-08", "2026-09-07", "2026-09-06", "2026-09-05", "2026-09-04"];
let postsHtml = "\n";

dates.forEach(date => {
    postsHtml += `        <div class="diary-post">
            <span class="diary-date">${date}</span>
            <p class="secret-text">${generateText()}</p>
        </div>\n`;
});

let html = fs.readFileSync(targetPath, 'utf8');

const startMarker = '<!-- AUTO_ARCHIVE_START -->';
const endMarker = '<!-- AUTO_ARCHIVE_END -->';

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

console.log("startIndex:", startIndex, "endIndex:", endIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const insertPos = startIndex + startMarker.length;
    html = html.substring(0, insertPos) + postsHtml + "    " + html.substring(endIndex);
    fs.writeFileSync(targetPath, html, 'utf8');
    console.log("SUCCESS: File successfully written!");
} else {
    console.error("ERROR: Markers not found in the file!");
}
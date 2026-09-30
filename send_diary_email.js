const fs = require('fs');

const apiKey = process.env.BREVO_API_KEY;
const listId = Number(process.env.BREVO_LIST_ID || '2');
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hogeshy.official@gmail.com';
const senderName = process.env.BREVO_SENDER_NAME || 'Hogeshy';

if (!apiKey) {
  console.error('BREVO_API_KEY is not set.');
  process.exit(1);
}

async function brevo(path, options = {}) {
  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    ...options,
    headers: {
      'api-key': apiKey,
      accept: 'application/json',
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    console.error(`Brevo API request failed (${response.status}).`);
    console.error(JSON.stringify(data));
    process.exit(1);
  }
  return data;
}

function latestDiaryDate() {
  const html = fs.readFileSync('diaryarchive.html', 'utf8');
  const dates = [...html.matchAll(/<span class="diary-date">(\d{4}-\d{2}-\d{2})<\/span>/g)]
    .map((match) => match[1])
    .sort();
  return dates.at(-1) || new Date().toISOString().slice(0, 10);
}

async function main() {
  const date = latestDiaryDate();
  const contacts = await brevo(`/contacts/lists/${listId}/contacts?limit=500&offset=0`);
  const emails = (contacts.contacts || [])
    .map((contact) => contact.email)
    .filter(Boolean);

  if (emails.length === 0) {
    console.log(`No subscribers in Brevo list ${listId}; no email sent.`);
    return;
  }

  const subject = "Hogeshy's Diary was updated";
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#18202b;max-width:600px">
      <p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#687080">Hogeshy Diary</p>
      <h1 style="font-weight:500">A new small record has appeared.</h1>
      <p>The diary was updated on ${date}.</p>
      <p><a href="https://hogeshy.github.io/Hogeshy/diaryarchive.html">Read the diary</a></p>
      <p style="color:#687080;font-size:13px">A quiet record from somewhere near the edge of the day.</p>
    </div>`;

  for (const email of emails) {
    await brevo('/smtp/email', {
      method: 'POST',
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        replyTo: { email: senderEmail, name: senderName },
        subject,
        htmlContent,
      }),
    });
  }

  console.log(`Diary email sent to ${emails.length} subscriber(s) from list ${listId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

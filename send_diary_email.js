const fs = require('fs');

const apiKey = process.env.BREVO_API_KEY;
const listId = Number(process.env.BREVO_LIST_ID || '2');
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'diary@hogeshy.com';
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

  const subject = 'Hogeshyの日記が更新されました';
  const htmlContent = `
    <div style="font-family:Arial,'Hiragino Kaku Gothic ProN',Meiryo,sans-serif;line-height:1.8;color:#18202b;max-width:600px">
      <p style="letter-spacing:.12em;font-size:12px;color:#687080">Hogeshyの日記</p>
      <h1 style="font-weight:500">日記が更新されました。</h1>
      <p>Hogeshyの日記をお届けします。</p>
      <p><a href="https://hogeshy.com/diaryarchive.html" style="display:inline-block;padding:10px 18px;background:#18202b;color:#fff;text-decoration:none">日記を読む</a></p>
      <p style="color:#687080;font-size:13px">今日も、Hogeshyの小さな記録をお届けします。</p>
      <hr style="border:0;border-top:1px solid #d8dce2;margin:28px 0 18px">
      <p style="font-size:13px;color:#687080">この日記の配信を停止したい場合は、<a href="mailto:diary@hogeshy.com?subject=Hogeshy%E3%81%AE%E6%97%A5%E8%A8%98%20%E9%85%8D%E4%BF%A1%E5%81%9C%E6%AD%A2" style="color:#18202b;font-weight:600">配信停止はこちら</a>をクリックしてください。メールが開いたら、そのまま送信してください。確認後、配信先リストから削除します。</p>
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

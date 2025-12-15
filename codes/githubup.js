import axios from "axios";

const githubToken = "ghp_ambakontol"; // TOKEN GITHUB
const owner = "ghlu"; // USERNAME GITHUB
const repo = "repolu"; // REPO
const branch = "main";

async function ensureRepoExists() {
  try {
    await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers: { Authorization: `Bearer ${githubToken}` } }
    );
  } catch (e) {
    if (e.response?.status === 404) {
      await axios.post(
        `https://api.github.com/user/repos`,
        { name: repo, private: false },
        { headers: { Authorization: `Bearer ${githubToken}` } }
      );
    } else {
      throw e;
    }
  }
}

async function uploadBinary(filename, buffer) {
  await ensureRepoExists();

  const filePath = `files/${filename}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  let sha;
  try {
    const res = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${githubToken}` }
    });
    sha = res.data.sha;
  } catch {}

  const body = {
    message: `Upload ${filename}`,
    content: buffer.toString("base64"),
    branch
  };

  if (sha) body.sha = sha;

  await axios.put(apiUrl, body, {
    headers: { Authorization: `Bearer ${githubToken}` }
  });

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

let handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    if (!q.mimetype)
      return m.reply("❌ Reply file-nya.");

    const buffer = await q.download();
    if (!buffer)
      return m.reply("❌ Gagal mengambil file.");

    const filename = `${Date.now()}.jpg`;

    await m.reply("⏳ Uploading ke GitHub...");

    const url = await uploadBinary(filename, buffer);

    await conn.relayMessage(
      m.chat,
      {
        interactiveMessage: {
          body: {
            text:
              `✅ *UPLOAD BERHASIL*\n\n` +
              `📄 File: ${filename}\n` +
              `🔗 ${url}`
          },
          footer: { text: "Nruuviluphie" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "Copy URL",
                  copy_code: url
                })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Open URL",
                  url: url
                })
              }
            ]
          }
        }
      },
      {
        quoted: m,
        additionalNodes: [
          {
            tag: "biz",
            attrs: {},
            content: [
              {
                tag: "interactive",
                attrs: { type: "native_flow", v: "1" },
                content: [
                  {
                    tag: "native_flow",
                    attrs: { v: "9", name: "cta_copy" }
                  }
                ]
              }
            ]
          }
        ]
      }
    );

  } catch (err) {
    console.error(err);
    m.reply("❌ Upload gagal:\n" + err.message);
  }
};

handler.command = ["tourl"];
handler.tags = ["uploader"];
handler.help = ["tourl"];

export default handler;
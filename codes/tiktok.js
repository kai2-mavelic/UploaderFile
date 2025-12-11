import https from "https";
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from "baileys";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const url = text || (m.quoted && m.quoted.text);
  if (!url) return m.reply(`❌ Contoh:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`);

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `https://api.deline.web.id/downloader/tiktok?url=${encodeURIComponent(url)}`;
    const agent = new https.Agent({ keepAlive: true });

    const res = await fetch(apiUrl, {
      method: "GET",
      agent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      },
    });

    const json = await res.json();
    if (!json?.status || !json.result) {
      console.error("❌ TikTok API Response Error:", json);
      throw new Error("❌ Gagal mengambil media TikTok.");
    }

    const result = json.result;
    const author = result.author || {};

    const caption =
      `🎬 *${result.title || "Tanpa judul"}*\n` +
      `👤 ${author.nickname || "Unknown"} (@${author.unique_id || "-"})\n` +
      `🎵 Music: ${result.music ? "Attached Below" : "Unknown"}`;

    const mediaList = [];

    // ----- VIDEO -----
    if (result.type === "video") {
      mediaList.push({ video: { url: result.download }, caption });
    }

    // ----- IMAGE (Slide) -----
    else if (result.type === "image" && Array.isArray(result.download)) {
      for (let img of result.download) {
        mediaList.push({ image: { url: img } });
      }
    }

    if (!mediaList.length) throw new Error("⚠️ Media TikTok tidak dikenali.");

    // ----- kirim 1x album -----
    const opener = generateWAMessageFromContent(
      m.chat,
      {
        albumMessage: {
          expectedImageCount: mediaList.filter(m => m.image).length,
          expectedVideoCount: mediaList.filter(m => m.video).length
        }
      },
      { userJid: jidNormalizedUser(conn.user.id), quoted: m, upload: conn.waUploadToServer }
    );

    for (let content of mediaList) {
      const msg = await generateWAMessage(m.chat, content, { upload: conn.waUploadToServer });
      msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: opener.key } };
      await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    }

    // ----- AUDIO -----
    if (result.music) {
      try {
        const audioRes = await fetch(result.music, { agent });
        const buff = Buffer.from(await audioRes.arrayBuffer());

        await conn.sendMessage(
          m.chat,
          {
            audio: buff,
            mimetype: "audio/mpeg",
            fileName: `${result.title || "tiktok"}-music.mp3`,
          },
          { quoted: m }
        );
      } catch (e) {
        console.error("⚠️ Gagal ambil audio:", e);
        m.reply("⚠️ Audio musik tidak bisa diambil.");
      }
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("❌ Error TikTok Handler:", err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`⚠️ Terjadi kesalahan. Detail:\n${err.message}`);
  }
};

handler.help = ["tt <url>", "tiktok <url>"];
handler.tags = ["downloader"];
handler.command = ["tt", "tiktok", "tiktokdl"];
export default handler;
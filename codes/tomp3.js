import pkg from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

ffmpeg.setFfmpegPath(pkg.path);

const convertToMp3 = (buffer) => {
  return new Promise((resolve, reject) => {
    const input = `/tmp/in_${Date.now()}`;
    const output = `/tmp/out_${Date.now()}.mp3`;

    fs.writeFileSync(input, buffer);

    ffmpeg(input)
      .toFormat("mp3")
      .on("end", () => {
        const res = fs.readFileSync(output);
        fs.unlinkSync(input);
        fs.unlinkSync(output);
        resolve(res);
      })
      .on("error", (err) => {
        fs.unlinkSync(input);
        reject(err);
      })
      .save(output);
  });
};

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!/^(video|audio)\//i.test(mime)) {
      return m.reply(
        `🍙 *Reply video atau voice note lalu ketik:* \`${usedPrefix + command}\``
      );
    }

    m.reply("⏳ Mengonversi…");

    // 🟢 FIX: pakai q.download()
    let buffer = await q.download();
    if (!buffer) return m.reply("❌ Gagal mengambil file.");

    let mp3 = await convertToMp3(buffer);

    await conn.sendMessage(
      m.chat,
      {
        audio: mp3,
        mimetype: "audio/mpeg",
        fileName: "convert.mp3",
        caption: "🍱 *Berhasil dikonversi ke MP3!*",
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    m.reply(`🥟 *Konversi gagal!*\n${e.message}`);
  }
};

handler.help = ["tomp3"];
handler.tags = ["tools"];
handler.command = /^(tomp3|toaudio)$/i;

export default handler;
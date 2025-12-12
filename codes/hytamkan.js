// • Feature : Hitamkan kulit (Seedream AI)
// • Command : .hytamkan / .tohitam
// • API : https://api.nekolabs.web.id

import uploadImage from '../lib/uploadFile.js';

let handler = async (m, { conn, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime.startsWith('image/')) {
    return m.reply('❌ Kirim atau reply gambar terlebih dahulu.');
  }

  const prompt = 'buat warna kulit karakter menjadi hitam atau sangat hitam tanpa merusak fotonya';

  m.reply('⏳ Memproses...');

  try {
    const media = await q.download();
    const imageUrl = await uploadImage(media);

    const apiUrl = 'https://api.nekolabs.web.id/image-generation/seedream/v1';

    const response = await fetch(
      `${apiUrl}?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}`
    );

    const data = await response.json();

    if (!data.success) {
      return m.reply('❌ Gagal memproses gambar.');
    }

    const resultUrl = data.result;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: resultUrl },
        caption: `✅ *Awowowowowok jadi hytam loh ya*\n⏱️ ${data.responseTime}`
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    m.reply(`❌ Error: ${e.message}`);
  }
};

handler.help = ['hytamkan', 'tohitam'];
handler.tags = ['ai'];
handler.command = ['hytamkan', 'tohitam'];

export default handler;
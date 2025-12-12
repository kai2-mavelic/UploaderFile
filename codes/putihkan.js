// • Feature : Putihkan kulit (Seedream AI)
// • Command : .putihkan / .toputih

import uploadImage from '../lib/uploadFile.js';

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime.startsWith('image/')) {
    return m.reply('❌ Kirim atau reply gambar terlebih dahulu.');
  }

  const prompt = 'buat warna kulit karakter menjadi putih atau sangat putih tanpa merusak fotonya';

  m.reply('⏳ Memproses...');

  try {
    const media = await q.download();
    const imageUrl = await uploadImage(media);

    const apiUrl = 'https://api.nekolabs.web.id/image-generation/seedream/v1';
    const response = await fetch(`${apiUrl}?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}`);
    const data = await response.json();

    if (!data.success) return m.reply('❌ Gagal memproses gambar.');

    await conn.sendMessage(m.chat, {
      image: { url: data.result },
      caption: `*Masyaallah Seputih salju*\n⏱️ ${data.responseTime}`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Error: ' + e.message);
  }
}

handler.help = ['putihkan', 'toputih'];
handler.tags = ['ai'];
handler.command = ['putihkan', 'toputih'];

export default handler;
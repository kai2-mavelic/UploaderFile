// • Feature : Tambahkan hijab (Seedream AI)
// • Command : .hijabkan / .tohijab

import uploadImage from '../lib/uploadFile.js';

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime.startsWith('image/')) {
    return m.reply('❌ Kirim atau reply gambar terlebih dahulu.');
  }

  const prompt = 'tambahkan hijab pada karakter dengan rapi dan natural tanpa merusak kualitas foto';

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
      caption: `*Alim bgt ygy*\n⏱️ ${data.responseTime}`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Error: ' + e.message);
  }
}

handler.help = ['hijabkan', 'tohijab'];
handler.tags = ['ai'];
handler.command = ['hijabkan', 'tohijab'];

export default handler;
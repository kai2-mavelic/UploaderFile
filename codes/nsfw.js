import axios from 'axios';

let handler = async (m, { conn, command }) => {
  const type = command.toLowerCase();

  const apiMap = {
    blowjob: 'https://api.nefyu.my.id/api/waifu-nsfw/blowjob',
    ass: 'https://api.nefyu.my.id/api/waifu-nsfw/ass',
    ecchi: 'https://api.nefyu.my.id/api/waifu-nsfw/ecchi',
    ero: 'https://api.nefyu.my.id/api/waifu-nsfw/ero',
    hentai: 'https://api.nefyu.my.id/api/waifu-nsfw/hentai',
    milf: 'https://api.nefyu.my.id/api/waifu-nsfw/milf',
    neko: 'https://api.nefyu.my.id/api/waifu-nsfw/neko',
    oral: 'https://api.nefyu.my.id/api/waifu-nsfw/oral',
    paizuri: 'https://api.nefyu.my.id/api/waifu-nsfw/paizuri',
    trap: 'https://api.nefyu.my.id/api/waifu-nsfw/trap',
    waifu: 'https://api.nefyu.my.id/api/waifu-nsfw/waifu'
    
    };
    
   

  if (!apiMap[type]) {
    return m.reply('❌ Command tidak ditemukan!');
  }

  try {
    m.reply('wett...');

    const response = await axios.get(apiMap[type], { responseType: 'arraybuffer' });
    const buffer = response.data;

    await conn.sendMessage(m.chat, { 
      image: buffer,
      caption: `✅ Random NSFW ${type}`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Terjadi kesalahan saat memproses request.');
  }
};

handler.command = [
  'blowjob',
    'ass',
    'ecchi',
    'ero',
    'hentai',
    'milf',
    'neko',
    'oral',
    'paizuri',
    'trap',
    'waifu'
];
handler.tags = ['anime'];
handler.help = [   'blowjob',
    'ass',
    'ecchi',
    'ero',
    'hentai',
    'milf',
    'neko',
    'oral',
    'paizuri',
    'trap',
    'waifu'
];
handler.premium = true;
export default handler;
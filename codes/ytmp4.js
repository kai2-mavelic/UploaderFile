import https from 'https'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`Masukkan link YouTube.\nContoh:\n.ytmp4 https://youtu.be/L29MaxP9PfM`)

  try {
    // react tunggu
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    // request ke API ytmp4 pakai user-agent Gecko
    let api = `https://api.deline.web.id/downloader/ytmp4?url=${encodeURIComponent(text)}`
    let res = await fetch(api, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0' },
      agent: new https.Agent({ rejectUnauthorized: false })
    })

    if (!res.ok) throw new Error(`HTTP Error ${res.status} ${res.statusText}`)

    let json = await res.json()
    if (!json.status) throw new Error(`API Response Error: ${JSON.stringify(json)}`)

    let dlink = json.result.downloadUrl
    if (!dlink) throw new Error(`Download link kosong`)

    // kirim video + caption
    await conn.sendMessage(
      m.chat,
      {
        video: { url: dlink },
        mimetype: 'video/mp4',
        fileName: `video.mp4`,
        caption: `🎥 Video dari YouTube\n🔗 ${text}`
      },
      { quoted: m }
    )

    // react centang
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    // kirim log error + react centang
    await conn.sendMessage(m.chat, { text: `❌ Terjadi error:\n${e.message}` })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  }
}

handler.command = ['ytmp4']
handler.tags = ["downloader"]
handler.help = ['ytmp4']
export default handler
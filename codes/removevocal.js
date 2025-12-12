/*
Fitur: rv/removevocal
Author: KadoKawa
Sumber scrape:
https://whatsapp.com/channel/0029Vap84RE8KMqfYnd0V41A/3333
Channels Admin:
https://whatsapp.com/channel/0029Vb7DHno1Hspxz8yMrk1D
Join juga:
https://chat.whatsapp.com/CWixqw2A1vM8MQCUIPRiDh
*/

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { tmpdir } from 'os'

async function vocalremove(file) {
    try {
        if (!fs.existsSync(file)) throw new Error('file not found')

        const form = new FormData()
        form.append('fileName', fs.createReadStream(file))

        const upload = await axios.post(
            'https://aivocalremover.com/api/v2/FileUpload',
            form,
            { headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0 (Linux; Android 10)' } }
        )

        if (!upload?.data?.file_name) throw new Error('upload failed')

        const body = new URLSearchParams({
            file_name: upload.data.file_name,
            action: 'watermark_video',
            key: 'X9QXlU9PaCqGWpnP1Q4IzgXoKinMsKvMuMn3RYXnKHFqju8VfScRmLnIGQsJBnbZFdcKyzeCDOcnJ3StBmtT9nDEXJn',
            web: 'web'
        })

        const proc = await axios.post(
            'https://aivocalremover.com/api/v2/ProcessFile',
            body,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    origin: 'https://aivocalremover.com',
                    referer: 'https://aivocalremover.com/'
                }
            }
        )

        if (!proc?.data?.instrumental_path) throw new Error('process failed')

        return {
            instrumental: proc.data.instrumental_path,
            vocal: proc.data.vocal_path
        }

    } catch (e) {
        return { status: 'error', msg: e.message }
    }
}


let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply("⚠️ reply audio yang mau diproses!")

    let q = m.quoted
    let mime = q.mimetype || ""

    if (!mime.includes("audio")) return m.reply("⚠️ reply audio, bukan yang lain.")

    m.reply("⏳ *Processing... tunggu 5–15 detik*")

    // download audio sementara
    let audio = await q.download()

    // buat tmp file  
    const filename = path.join(tmpdir(), `rv_${Date.now()}.mp3`)
    fs.writeFileSync(filename, audio)

    let result = await vocalremove(filename)

    if (result.status === "error")
        return m.reply("❌ Error: " + result.msg)

    // kirim instrumental
    await conn.sendMessage(m.chat, { audio: { url: result.instrumental }, mimetype: "audio/mpeg" }, { quoted: m })

    // kirim vocal
    await conn.sendMessage(m.chat, { audio: { url: result.vocal }, mimetype: "audio/mpeg" }, { quoted: m })

    fs.unlinkSync(filename)
}

handler.help = ["rv", "removevocal"]
handler.command = /^(rv|removevocal)$/i
handler.tags = ["tools"]
export default handler
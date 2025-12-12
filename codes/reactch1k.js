/*
📌 Name : React ch
🏷️ Type : Plugin Esm
📦 Saluran : https://whatsapp.com/channel/0029Vb4HHTJFCCoYgkMjn93K
📑 Noted : Kalo tiba tiba error ambil apikey nya lewat network ya
🔗 Base url : http://asitha.top/channel-manager
👤 Creator : Hazel
*/

import axios from 'axios'

const handler = async (m, {
    text,
    conn
}) => {
    if (!text) throw 'Masukkan link post dan reaksi\nContoh: https://whatsapp.com/channel/0029Vb4HHTJFCCoYgkMjn93K/1529 ♥️ 🙏🏻'

    try {
        const [post_link, ...reactsArray] = text.split(' ')
        const reacts = reactsArray.join(', ')
        
        if (!post_link || !reacts) {
            throw 'Format salah! Gunakan: link_post reaction1 reaction2\nContoh: https://whatsapp.com/channel/0029Vb4HHTJFCCoYgkMjn93K/1529 ♥️ 🙏🏻'
        }

        const url = 'https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post'
        
        const requestData = {
            post_link: post_link,
            reacts: reacts
        }

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzgyZDFhMTE0YWI3MTE5ZmNhNTdjZiIsImlhdCI6MTc2NTI4OTI0MiwiZXhwIjoxNzY1ODk0MDQyfQ.PyblreikWf2_fcPwRfrM_w-_VZmSlvk1vQtrrOuNFBo'
        }

        const res = await axios.post(url, requestData, { headers })
        const data = res.data

        let hasil = `✅ *Reaction Berhasil!*\n\n`
        hasil += `📝 *Pesan:* ${data.message || 'Reaksi berhasil dikirim'}\n`
        if (data.botResponse) {
            hasil += `🤖 *Respon Bot:* ${data.botResponse}\n`
        }
        hasil += `🔗 *Post Link:* ${post_link}\n`
        hasil += `🎯 *Reactions:* ${reacts}`

        await conn.sendMessage(m.chat, {
            text: hasil.trim()
        }, {
            quoted: m
        })

    } catch (error) {
        let errorMessage = `❌ *Terjadi Kesalahan*\n\n`
        
        if (error.response) {
            errorMessage += `📊 *Status:* ${error.response.status}\n`
            if (error.response.data) {
                errorMessage += `📝 *Pesan:* ${error.response.data.message || JSON.stringify(error.response.data)}\n`
            }
        } else if (error.request) {
            errorMessage += `🌐 *Koneksi:* Tidak ada respon dari server\n`
        } else {
            errorMessage += `⚙️ *Setup:* ${error.message}\n`
        }
        
        errorMessage += `🔧 *Tips:* Pastikan link post dan emoji benar`

        await conn.sendMessage(m.chat, {
            text: errorMessage.trim()
        }, {
            quoted: m
        })
    }
}

handler.help = ['react']
handler.tags = ['tools']
handler.command = /^(react|rch)$/i
handler.limit = true;

export default handler
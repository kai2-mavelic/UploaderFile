import axios from "axios"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0])
    return m.reply(`Contoh penggunaan:\n${usedPrefix + command} https://gist.github.com/mifyow/0378b138de462bc116f383e7ea2014cd\natau githubuser:mifyow/0378b138de462bc116f383e7ea2014cd\natau raw URL langsung`)

  let url = args[0]

  try {
    // 1️⃣ githubuser:user/gistid
    if (url.startsWith("githubuser:")) {
      const parts = url.replace("githubuser:", "").split("/")
      if (parts.length < 2) return m.reply("Format salah, contoh: githubuser:user/gistid")
      const user = parts[0]
      const gistId = parts[1]
      url = `https://gist.githubusercontent.com/${user}/${gistId}/raw`
    }

    // 2️⃣ gist.github.com/... → otomatis ke raw
    else if (url.includes("gist.github.com") && !url.includes("/raw")) {
      const parts = url.split("/")
      const user = parts[3]
      const gistId = parts[4]
      url = `https://gist.githubusercontent.com/${user}/${gistId}/raw`
    }

    // 3️⃣ github.com/.../blob/... → convert ke raw
    else if (url.includes("github.com") && url.includes("/blob/")) {
      url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
    }

    // 4️⃣ raw URL langsung → biarkan
    // tidak perlu ubah apapun, langsung fetch

    // Fetch konten
    const { data, status } = await axios.get(url)
    if (status !== 200 || !data) return m.reply("Gagal mengambil isi file.")

    // Kirim teks
    await conn.sendMessage(
      m.chat,
      { text: data },
      { quoted: m }
    )

  } catch (e) {
    console.log(e)
    m.reply("Error njir, cek URL-nya.")
  }
}

handler.help = ["getgist <url>"]
handler.command = ["getgist"]
handler.tags = ["tools"]

export default handler
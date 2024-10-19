const from = 'C:/Users/258vr/Downloads/j0si241023-main', to = './links.json';
const fs = require('node:fs'), l = fs.readdirSync(from).filter(i => !/\.\S+/.test(i)), g = JSON.parse(fs.readFileSync(to))
for (let j in l) {
    try {
        g.push({
            url: fs.readFileSync(`${from}/${l[j]}/index.html`).toString().match(/content="https?:\/\/[^"]+"/g)[0].slice(9, -1),
            path: l[j]
        })
    } catch (e) {
        console.error(e)
    }
}
fs.writeFileSync(to, JSON.stringify(g, null, 2))
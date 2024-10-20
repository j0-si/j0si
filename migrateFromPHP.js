let from, to = './links.json';
const fs = require('node:fs'), readline = require('node:readline'), r = readline.createInterface({ input: process.stdin, output: process.stdout})
r.question('import links from: ', i => {
    from = i.replace(/\\/g, '/').replace(/^".+"$/, r => { return r.slice(1, -1) });
    const l = fs.readdirSync(from).filter(i => !/\.\S+/.test(i)), g = JSON.parse(fs.readFileSync(to)), m = g.map(i => i.path)
    let s = 0, f = 0, u = 0
    for (let j in l) {
        try {
            console.log(encodeURI(l[j]) in m)
            if (m.includes(encodeURI(l[j]))) {
                const w = g.find(i => i.path === encodeURI(l[j]))
                w.url = fs.readFileSync(`${from}/${l[j]}/index.html`).toString().match(/content="https?:\/\/[^"]+"/g)[0].slice(9, -1)
                console.log(`Updated url: ${l[j]}`)
                u++
            } else {
                g.push({
                    url: fs.readFileSync(`${from}/${l[j]}/index.html`).toString().match(/content="https?:\/\/[^"]+"/g)[0].slice(9, -1),
                    path: encodeURI(l[j])
                })
                console.log(`Added url: ${l[j]}`)
                s++
            }
        } catch (e) {
            console.error(e)
            f++
        }
    }
    fs.writeFileSync(to, JSON.stringify(g, null, 2))
    console.log(`${s} added, ${u} updated, ${f} failed`)
    r.close()
})
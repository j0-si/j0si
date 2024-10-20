/*
    serviceURL = `${PROTOCOL}//${HOSTNAME}/`
*/

function grs(length) {
    const b = "0123456789qwertyuiopasdfghjklzxcvbnm-_"
    let y = ""
    for (let i = 0; i < length; i++) {
        y += b[Math.round(Math.random() * (b.length - 1))];
    }
    return y;
}

const express = require('express'), app = express(), path = require('node:path'), fs = require('node:fs'), { rateLimit } = require('express-rate-limit')
const config = {}
fs.readFileSync('./config').toString().replace(/\r/g, "").split('\n').forEach(i=>{let I=i.split('=');config[I[0]]=/(true)|(false)/.test(I[1])?I[1]==='true':I[1]})
console.log(config)
const serviceURL = config['url'], port = parseInt(config['port'])
const t = rateLimit({
    windowMs: 1e3,
    limit: parseInt(config['rate-limit']),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).send(ec(9))}
})
app.use(t)
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1)
app.post('/shorten', (req, res) => {
    try {
        console.log(`${new Date()} // ${req.ip}`)
        console.log(req.query);
        if (req.query.url) {
            if (/[\+]+/.test(req.query.path)) {
                res.status(400).send(ec(2))
            } else {
                let p, y = false;
                const d = JSON.parse(fs.readFileSync('./links.json')), pd = d.map(i => i.path.replace(/^\//, ''))
                if (req.query.path) {
                    p = encodeURI(req.query.path.replace(/^\s+/, '').replace(/\s+$/, ''));
                } else {
                    let k = 0, l = 4;
                    y = true;
                    do {
                        p = grs(l)
                        k++;
                        if (k % 100 === 0) {
                            l++;
                        }
                    } while (pd.includes(p))
                }
                if (p.length < 3) {
                    res.status(403).send(ec(4))
                } else {
                    if (pd.includes(p)) {
                        res.status(403).send(ec(5))
                    } else {
                        const j = `${serviceURL}${p}`, u = encodeURI(req.query.url);
                        if ((j.length < u.length || !y) && config['only-shortened']) {
                            const r = new URL(u)
                            r.protocol = new URL(serviceURL).protocol
                            if (j == r.href && !config['allow-redirect-loop']) {
                                res.status(403).send(ec(7))
                            } else {
                                const f = JSON.parse(fs.readFileSync('./links.json')), b = JSON.parse(fs.readFileSync('./blacklist.json'))
                                let q = false;
                                if (`${r.origin}/` === serviceURL) {
                                    const h = f.find(i => `/${i.path}` === r.pathname)
                                    if (h) {
                                        q = true
                                    }
                                }
                                if (q && !config['allow-redirect-loop']) {
                                    res.status(403).send(ec(7))
                                } else {
                                    d.push({
                                        url: u,
                                        path: p
                                    })
                                    fs.writeFileSync('./links.json', JSON.stringify(d, null, 2))
                                    updateStats(0)
                                    res.status(201).send({
                                        url: u,
                                        path: p,
                                        c: "OK",
                                        i: 0
                                    })
                                }
                            }
                        } else {
                            res.status(403).send(ec(6))
                        }
                    }
                }
            }
        } else {
            res.status(400).send(ec(1))
        }
    } catch (e) {
        console.error(e)
    }
})

app.get('/*', (req, res) => {
    try {
        const u = req.url;
        if (u === "/stats.json") {
            res.status(200).sendFile(path.join(__dirname, 'stats.json'))
        } else {
            if (/^\/(index.html)?$/.test(u)) {
                res.status(200).sendFile(path.join(__dirname, 'htdocs', 'index.html'))
            } else if (/^\/.+/.test(u)) {
                const d = JSON.parse(fs.readFileSync('./links.json')), pd = d.map(i => i.path.replace(/^\//, '')), p = u.replace(/^\//, '').replace(/\+$/, '');
                if (pd.includes(p)) {
                    if (/\+$/.test(u)) {
                        res.status(200).send({
                            url: d[pd.findIndex(i => i === p)].url,
                            path: p,
                            c: "OK",
                            i: 0
                        })
                    } else {
                        updateStats(1)
                        res.redirect(307, d[pd.findIndex(i => i === p)].url)
                    }
                } else {
                    if (/\+$/.test(u)) {
                        res.status(404).send(ec(3))
                    } else {
                        res.status(404).sendFile(path.join(__dirname, 'htdocs', '404.html'))
                    }
                }
            }
        }
    } catch (e) {
        console.error(e)
    }
})

app.listen(port, () => {
    console.log('ok')
})

function ec(num) {
    const e = JSON.parse(fs.readFileSync('./ec.json'));
    return {
        c: e[num] ?? `x${num}`,
        i: num
    }
}

function updateStats(a) {
    try {
        const k = JSON.parse(fs.readFileSync('./stats.json')), o = JSON.parse(fs.readFileSync('./links.json'))
        console.log(k)
        k.g = o.length
        if (a) {
            k.a++
        }
        fs.writeFileSync('./stats.json', JSON.stringify(k, null, 2))
    } catch (e) {
        console.error(e)
    }
}
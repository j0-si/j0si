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
const _r = [fs.existsSync('./links.json'), fs.existsSync('./config'), fs.existsSync('./htdocs/index.html')]

const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

if (_r.every(i=>i===true)) {
    const config = {}
    fs.readFileSync('./config').toString().replace(/\r/g, "").split('\n').forEach(i=>{if(!i.startsWith("# ")){let I=i.split('=');if(I[1])config[I[0]]=/(true)|(false)/.test(I[1])?I[1]==='true':I[1]}})
    console.log(config)
    const serviceURL = config['url'], port = parseInt(config['port'])
    const s8 = { // someinfos
        has429: fs.existsSync('./htdocs/429.html'),
        no429pg: ['/shorten','/stats.json']
    }
    if (config['rate-limit'] >= 1) {
        const t = rateLimit({
            windowMs: Number(config['windowMs']),
            limit: parseInt(config['rate-limit']),
            standardHeaders: 'draft-7',
            legacyHeaders: false,
            handler: (req, res) => {
                res.status(429).send(s8.has429&&!s8.no429pg.includes(req.url)?fs.readFileSync('./htdocs/429.html').toString():ec(9))}
        })
        app.use(t)
    }
    app.use(express.urlencoded({ extended: true }));
    app.set('trust proxy', 1)
    app.post('/shorten', (req, res) => {
        try {
            if (req.query.url) {
                const b = JSON.parse(fs.readFileSync('./blacklist.json'))
                if (b.includes(new URL(req.query.url).hostname)) {
                    res.status(403).send(ec(8))
                } else {
                    if (/[\+]+/.test(req.query.path)) {
                        res.status(400).send(ec(2))
                    } else {
                        let p, y = false;
                        const d = JSON.parse(fs.readFileSync('./links.json')), pd = d.map(i => i.path.replace(/^\//, ''))
                        if (req.query.path) {
                            p = encodeURIComponent(req.query.path.replace(/^\s+/, '').replace(/\s+$/, ''));
                        } else {
                            let k = 0, l = 4;
                            y = true;
                            do {
                                p = grs(l), k++;
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
                                const j = `${serviceURL}${p}`, u = decodeURIComponent(req.query.url);
                                if ((j.length < u.length || !y) && config['only-shortened']) {
                                    const r = new URL(u)
                                    r.protocol = new URL(serviceURL).protocol
                                    if (j == r.href && !config['allow-redirect-loop']) {
                                        res.status(403).send(ec(7))
                                    } else {
                                        const f = JSON.parse(fs.readFileSync('./links.json')), du = f.find(_ => _.url === u && _.path.length <= 4)
                                        if (y && du) p = du.path
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
                                            const v = JSON.parse(fs.readFileSync('./badwords.json'))
                                            if (v.some(i => p.includes(i))) {
                                                res.status(403).send(ec(10))
                                            } else {
                                                let data = {
                                                    url: u,
                                                    path: p
                                                }
                                                if (!y || !du) {
                                                    d.push(data)
                                                }
                                                fs.writeFileSync('./links.json', JSON.stringify(d, null, 2))
                                                updateStats(0)
                                                res.status(201).send({
                                                    ...data,
                                                    c: ec(0),
                                                    i: 0
                                                })
                                                log(`${config['log-ip']?`${ipL(req.ip)}: `:''}shorten ${JSON.stringify(data, null, 4)}`,0);
                                            }
                                        }
                                    }
                                } else {
                                    res.status(403).send(ec(6))
                                }
                            }
                        }
                    }
                }
            } else {
                res.status(400).send(ec(1))
            }
        } catch (e) {
            log(e.message,1)
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
                                c: ec(0),
                                i: 0
                            })
                        } else {
                            updateStats(1)
                            log(`${config['log-ip']?`${ipL(req.ip)}: `:''}access /${p}`,0);
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
            log(e.message,1)
        }
    })

    app.listen(port, console.log(`running on port ${port}`))
        
    function updateStats(a) {
        try {
            const k = JSON.parse(fs.readFileSync('./stats.json')), o = JSON.parse(fs.readFileSync('./links.json'))
            k.g = o.length
            a ? k.a++ : null
            fs.writeFileSync('./stats.json', JSON.stringify(k, null, 2))
        } catch (e) {
            log(e.message,1)
        }
    }

    function log(C, isError) {
        const prefix = `[${datestr(new Date(), !config['separate-logs'])} ${isError ? "ERR!" : "INFO"}] `, logCont = C.split('\n').map(i=>prefix+i).join('\n'), clc = C.split('\n').map(i=>`[${datestr(new Date(),1)} ${isError ? "ERR!" : "INFO"}] ${i}`).join('\n')
        isError ? console.error(clc) : console.log(clc)
        fs.appendFileSync(config['separate-logs'] ? `./logs/${lfd()}.log` : './.log', logCont+'\n')
    }

    function datestr(d, f) {
        return `${f ? `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2,'0')} ` : ""}${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}${config['log-milliseconds']?`.${d.getMilliseconds().toString().padStart(3,'0')}`:''}`
    }
    
    function ipL(adr) { return config['align-ip-in-log'] ? adr.split('.').map(i=>i.padStart(3,' ')).join('.') : adr }
} else {
    const _f = ['links.json', 'config', 'htdocs/index.html'], _res = []
    for(let i in _r){_r[i]?null:_res.push(_f[i])}
    console.error(`Some files are missing!: ${_res.join(', ')}\nnpm run init to initialize.`)
    process.exit(1)
}

function ec(num) {
    const e = JSON.parse(fs.readFileSync('./ec.json'));
    return {
        c: e[num] ?? `x${num}`,
        i: num
    }
}

function lfd() {
    const d = new Date()
    return `${new Date().getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`
}

rl.on('line', input => {
    const cmdArgs = input.split(' ');

    if (cmdArgs.length < 1) return;

    if (['check', 'info'].includes(cmdArgs?.at(0))) {
        const links = JSON.parse(fs.readFileSync('./links.json'));

        const result = links.find(link => link.path === cmdArgs?.at(1).replace(/^\//, ''))

        console.log(result);
    }
})
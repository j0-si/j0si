/*
    serviceURL = `${PROTOCOL}//${HOSTNAME}/`
*/
const serviceURL = "http://j0.si/", port = 1071

function grs(length) {
    const b = "0123456789qwertyuiopasdfghjklzxcvbnm-_"
    let y = ""
    for (let i = 0; i < length; i++) {
        y += b[Math.round(Math.random() * (b.length - 1))];
    }
    return y;
}

const express = require('express'), app = express(), path = require('node:path'), fs = require('node:fs')
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.post('/shorten', (req, res) => {
    console.log(`${new Date()} // ${req.ip}`)
    console.log(req.query);
    if (req.query.url) {
        if (/[\+]+/.test(req.query.path)) {
            res.status(400).send(ec(2))
        } else {
            let p, x, y = false;
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
                    if (j.length < u.length || !y) {
                        x = {
                            url: u,
                            path: p
                        }
                        d.push(x)
                        x.c = "OK", x.i = 0
                        fs.writeFileSync('./links.json', JSON.stringify(d, null, 2))
                        res.status(201).send(x)
                    } else {
                        res.status(403).send(ec(6))
                    }
                }
            }
        }
    } else {
        res.status(400).send(ec(1))
    }
})

app.get('/*', (req, res) => {
    const u = req.url;
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
                res.redirect(301, d[pd.findIndex(i => i === p)].url)
            }
            
        } else {
            if (/\+$/.test(u)) {
                res.status(404).send(ec(3))
            } else {
                res.status(404).sendFile(path.join(__dirname, 'htdocs', '404.html'))
            }
        }
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
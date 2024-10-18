// `${PROTOCOL}//${HOSTNAME}/`
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
        if (/[\/\.\+]+/.test(req.query.path)) {
            res.status(400).send({
                c: "PATH_NOT_ALLOWED",
                i: 2
            })
        } else {
            let p, x;
            const d = JSON.parse(fs.readFileSync('./links.json')), pd = d.map(i => i.path.replace(/^\//, ''))
            if (req.query.path) {
                p = req.query.path.replace(/^\s+/, '').replace(/\s+$/, '');
            } else {
                let k = 0, l = 4;
                do {
                    p = grs(l)
                    k++;
                    if (k % 100 === 0) {
                        l++;
                    }
                } while (pd.includes(p))
            }
            if (p.length < 3) {
                res.status(403).send({
                    c: "PATH_TOO_SHORT",
                    i: 8
                })
            } else {
                if (pd.includes(p)) {
                    res.status(403).send({
                        c: "PATH_DUPLICATE",
                        i: 16
                    })
                } else {
                    const j = `${serviceURL}${p}`, u = encodeURI(req.query.url);
                    if (j.length < u.length) {
                        x = {
                            url: u,
                            path: p
                        }
                        d.push(x)
                        fs.writeFileSync('./links.json', JSON.stringify(d, null, 2))
                        res.status(200).send(x)
                    } else {
                        res.status(403).send({
                            c: "RESULT_TOO_LONG",
                            i: 32
                        })
                    }
                }
            }
        }
    } else {
        res.status(400).send({
            c: "URL_UNSET",
            i: 1
        })
    }
})

app.get('/*', (req, res) => {
    const u = req.url;
    if (/^\/(index.html)?$/.test(u)) {
        res.status(200).sendFile(path.join(__dirname, 'htdocs', 'index.html'))
    } else if (/^\/.+/.test(u)) {
        const d = JSON.parse(fs.readFileSync('./links.json')), pd = d.map(i => i.path.replace(/^\//, '')), p = u.replace(/^\//, '').replace(/\+$/, '');
        if (pd.includes(p)) {
            res.status(200).send(`<!DOCTYPE html><html prefix="og: https://ogp.me/ns#"><meta http-equiv="refresh" content="0;URL=${d[pd.findIndex(i => i === p)].url}"><meta property="og:title" content="${d[pd.findIndex(i => i === p)].url}"><meta property="og:url" content="https://j0.si/${u}"><meta name="og:description" content="Link shortener by j0.si"></html>`)
        } else {
            if (/\+$/.test(u)) {
                res.status(404).send({
                    c: "LINK_NOT_FOUND",
                    i: 4
                })
            } else {
                res.status(404).sendFile(path.join(__dirname, 'htdocs', '404.html'))
            }
        }
    }
})

app.listen(port, () => {
    console.log('ok')
})

/*
<?php

    $sl = ""; $p = ""; $sl = "";
    $h = "";
    $h = $_POST["path"];
    if (isset($_POST["snd"]) && $_POST["link"] != "") {
        $g = 1;
        $p = $h;
        if ($h == "") {
            $g = 0;
            $p = generateRandomString(random_int(4, 5));
        }
        $j = 0;
        if (strlen($p) < 3 && $h != "") {
            echo("<div class=\"alert alert-danger\" role=\"alert\">Custom pathname must be at least 3 characters long.</div>");
        } else {
            $u = $_POST['link'];
            $e = cuq($u);
            $pu = parse_url($u);
            if ($pu['scheme'] == "http" || $pu['scheme'] == "https") {
                do {
                    $sl = $p . "/index.html";
                    if (file_exists($sl) == false) {
                        mkdir("./" . $p);
                        touch("./" . $sl);
                        file_put_contents("./$p/index.html", '<html prefix="og: https://ogp.me/ns#"><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet"><title>[5s] j0.si</title><meta property="og:title" content="'.$e.'"><meta property="og:image" content="/assets/logo/jli.png"><meta property="og:url" content="'.$e.'"><meta name="description" content="Link shortener by j0.si"><meta http-equiv="refresh" content="5;'.$e.'"><style>body{background-color:#121212;color:#fff;text-align:center;font-family:\'Noto Sans\',\'Open Sans\',Caveat,\'Segoe UI\',Arial,Helvetica,sans-serif;}h6{font-weight:normal;font-size:2vw;}div{top:25vh;position:relative;}.l{font-family:Consolas,Inconsolata,monospace;}a{font-size:5vw;color:#2d76fd}</style></head><body><div><h6>You\'ll be redirected to:</h6><h1 class="l"><a href="'.$e.'">'.htmlspecialchars($u).'</a></h1><p style="font-size:3.2vw;">in <span style="font-size:5vw;" id="c">5</span> second<span id="s">s</span></p></div><script>i=5;const t=setInterval(()=>{i--;document.getElementById(\'c\').textContent=i;document.title=`[${i}s] j0.si`;const y=document.getElementById(\'s\');if(i===1){y.textContent="";}else{y.textContent="s";}if(i<=0){clearInterval(t);location.href="'.$e.'";}},1000);</script></body></html>');
                        if (file_exists($sl) != false) {
                            $l = (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . "/" . $p;
                            echo "<script>location.search = \"?q=" . $p . "\";</script>";
                            exit;
                        } else {
                            echo "<div class=\"alert alert-danger\" role=\"alert\">URL or pathname contains characters that cannot be used.</div>";
                        }
                        $g = 0;
                    } else {
                        if ($g) {
                            echo("<div class=\"alert alert-danger\" role=\"alert\">Sorry, the pathname \"" . htmlspecialchars($p) . "\" is already used.<br>Please try another pathname.</div>");
                            if ($h != "") {
                                $g = 0;
                            }
                        } else {
                            $j++;
                            $p = generateRandomString(random_int(4, 5));
                            if ($j > 200) {
                                echo("<div class=\"alert alert-danger\" role=\"alert\">Something went wrong.<br>Please try again.</div>");
                                $g = 0;
                            }
                        }
                    }
                } while ($g);
            } else {
                echo("<div class=\"alert alert-danger\" role=\"alert\">Protocol not supported.<br>Supported protocols: http, https</div>");
            }
        }
    }
    
?>
*/
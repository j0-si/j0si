const fs=require("node:fs"),config={},rd=require('readline'),r=rd.createInterface({input:process.stdin,output:process.stdout});r.question('reset links and stats? (no) ',h=>{const rs=h??'no';fs.readFileSync("./config").toString().replace(/\r/g,"").split("\n").forEach(e=>{if(!e.startsWith("# ")){let l=e.split("=");if(l[1])config[l[0]]=/(true)|(false)/.test(l[1])?"true"===l[1]:l[1]}}),console.log(config);if(h==="yes"){fs.writeFileSync("./links.json","[]"),fs.writeFileSync("./stats.json",'{"g":0,"a":0}')};const Y=config.url.replace(/\/$/,""),T=new URL(config.url).host,R=[fs.readFileSync("./initkit/index.html").toString().replace(/#host/g,T).replace(/#url/g,Y),fs.readFileSync("./initkit/404.html").toString().replace(/#host/g,T).replace(/#url/g,Y)];fs.writeFileSync("./htdocs/index.html",R[0]),fs.writeFileSync("./htdocs/404.html",R[1]),r.close()})
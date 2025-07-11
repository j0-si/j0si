# https://j0.si
a simple link shortener with node.js

### modules required
- express
- express-rate-limit

## Features
- shorten long urls
- links can be migrated from [legacy PHP version](https://github.com/j0-si/j0si-php) (`npm run migrate`)
- rate limiting
- domain blacklists (`blacklist.json`)
- custom pathname badwords blocker (`badwords.json`)

## How to use this?
Edit `config` file, and run `npm run init`.\
Terminal would asks you to reset links and stats. If this is your first initialization, then type `yes` and enter.\
<small>*(if you typed `yes` when you have links or stats stored, they're going to be erased.)*</small>\
After that, just run `npm run start` and you're ready to go!

<details>
  
<summary>Running on Glitch.com</summary>

I don't think there's anyone ever to host this link shortener,\
but I've tested it few times on Glitch. [ijif](https://glitch.com/~ijif) [j-i](https://glitch.com/~j-i)

</details>

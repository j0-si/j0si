# https://j0.si
a simple link shortener with node.js

`npm run init` to initialize,
`npm run start` to start.

### modules required
- express
- express-rate-limit

## Features
- shorten long urls
- links can be migrated from [legacy PHP version](https://github.com/j0-si/j0si-php) (`npm run migrate`)
- rate limiting
- domain blacklists (`blacklist.json`)
- custom pathname badwords blocker (`badwords.json`)

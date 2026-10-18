const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

let bundle = indexHtml;
bundle = bundle.replace('<link rel="stylesheet" href="styles.css">', `<style>\n${stylesCss}\n</style>`);
bundle = bundle.replace('<script src="app.js"></script>', `<script>\n${appJs}\n</script>`);

fs.writeFileSync(path.join(__dirname, 'standalone.html'), bundle, 'utf8');
console.log('Successfully bundled standalone.html. File size:', bundle.length, 'bytes');

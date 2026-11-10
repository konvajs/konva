// The browser tests of Konva.Html need the HTML-in-Canvas API: Chrome 157+.
// The puppeteer of mocha-headless-chrome downloads an older Chrome by default.
const version = '157.0.8103.38';

module.exports = {
  chrome: { version },
  'chrome-headless-shell': { version },
};

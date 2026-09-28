const util = require('node:util');

// Node.js < 20.19.0 compatibility patch:
// Metro Bundler passes an array of formats (e.g. ['red', 'inverse', 'bold']) to util.styleText,
// which is only supported in Node >= 20.19.0. This polyfill ensures it works cleanly on Node 20.12.
if (util.styleText) {
  const originalStyleText = util.styleText;
  util.styleText = function (format, text) {
    if (Array.isArray(format)) {
      return format.reduce((acc, f) => {
        try {
          return originalStyleText(f, acc);
        } catch {
          return acc;
        }
      }, text);
    }
    try {
      return originalStyleText(format, text);
    } catch {
      return text;
    }
  };
}

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;

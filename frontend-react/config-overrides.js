const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "http": false,
      "https": false,
      "stream": false,
      "zlib": false,
      "url": false,
      "util": false,
      "assert": false,
      "querystring": false
    }
  })
);
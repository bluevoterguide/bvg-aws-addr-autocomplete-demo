const path = require("path");

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(?:js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ]
          }
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "", // same dir as HTML page
    filename: "main.js",
    library: "AutoComplete",
  },
};
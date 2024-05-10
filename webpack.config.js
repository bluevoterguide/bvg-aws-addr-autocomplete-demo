const path = require("path");

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "public"),
    publicPath: "", // same dir as HTML page
    filename: "main.js"
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { path: require.resolve("path-browserify") },
  },
  devServer: {
    port: 8000,
    static: {
      directory: path.join(__dirname, "public"),
    },
    client: {
      overlay: false,
    },
  }
};
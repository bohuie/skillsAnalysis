const path = require("path");
const webpack = require("webpack");

module.exports = {
  watchOptions: {
    ignored: '**/node_modules',
    poll: 1000, // Check for changes every second
  },
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./static/react"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        NODE_ENV: JSON.stringify("development"),
      },
    }),
  ],
};
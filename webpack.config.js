const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const MODE = process.env.NODE_ENV || "development";
const DEV = MODE == "development";

const copyRules = [
  {
    from: __dirname + "/src/index.html",
    to: __dirname + "/dist/index.html"
  },
  {
    from: __dirname + "/assets",
    to: __dirname + "/dist"
  }
];

module.exports = {
  mode: MODE,
  devtool: DEV ? "inline-source-map" : "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@lib": path.resolve(__dirname, "src/lib"),
      "@components": path.resolve(__dirname, "src/components")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      },
      {
        test: /\.js$/,
        include: [path.join(__dirname, "src")],
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader/url" }, { loader: "file-loader" }]
      }
    ]
  },
  plugins: DEV
    ? [
        new CopyPlugin(copyRules),
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(MODE)
        })
      ]
    : [
        new CopyPlugin(copyRules),
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(MODE)
        }),
        new WorkboxPlugin.GenerateSW({
          swDest: "sw.js",
          clientsClaim: true,
          skipWaiting: true
        })
      ]
};

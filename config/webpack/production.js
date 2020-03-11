process.env.NODE_ENV = process.env.NODE_ENV || "production";

const webpack = require("webpack");
const environment = require("./environment");
const supportedLocales = ["en"];

environment.plugins.prepend(
  "DateFNSLocales",
  new webpack.ContextReplacementPlugin(
    /date\-fns[\/\\]/,
    new RegExp(`[/\\\\\](${supportedLocales.join("|")})[/\\\\\]`)
  )
);
environment.plugins.prepend(
  "DefinePlugin",
  new webpack.DefinePlugin({
    DEVELOPMENT: JSON.stringify(true),
    PRODUCTION: JSON.stringify(false)
  })
);

environment.config.set("output.filename", "[name]-[contenthash].js");

module.exports = environment.toWebpackConfig();

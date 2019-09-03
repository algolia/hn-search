process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const webpack = require('webpack')
const environment = require('./environment')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const supportedLocales = ["en"]
environment.plugins.prepend('BundleAnalyzer', new BundleAnalyzerPlugin())
environment.plugins.prepend('DateFNSLocales', new webpack.ContextReplacementPlugin(
  /date\-fns[\/\\]/,
  new RegExp(`[/\\\\\](${supportedLocales.join('|')})[/\\\\\]`)
))

module.exports = environment.toWebpackConfig()

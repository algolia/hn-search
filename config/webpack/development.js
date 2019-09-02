process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const webpack = require('webpack')
const environment = require('./environment')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

environment.plugins.prepend('BundleAnalyzer', new BundleAnalyzerPlugin())
environment.plugins.prepend('MomentIgnore', new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))

module.exports = environment.toWebpackConfig()

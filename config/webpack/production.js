process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const webpack = require('webpack')
const environment = require('./environment')

environment.plugins.prepend('MomentIgnore', new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))

module.exports = environment.toWebpackConfig()

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const webpack = require('webpack')
const environment = require('./environment')

environment.plugins.prepend('MomentLocales', new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en)$/))

module.exports = environment.toWebpackConfig()

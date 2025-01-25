const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://143.47.190.25:1880', // De URL van je backend API
        changeOrigin: true, // Zorgt ervoor dat het request origin header wordt aangepast
        secure: false, // Zet dit op false omdat je API geen HTTPS gebruikt
        pathRewrite: { '^/api': '' }, // Verwijdert '/api' uit de request URL
      },
    },
  },
})

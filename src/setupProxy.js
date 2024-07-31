const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/blog',
    createProxyMiddleware({
      target: 'https://masterkinder20240523125154.azurewebsites.net/',
      changeOrigin: true,
    })
  );
};

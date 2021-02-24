module.exports = {
  apps: [
    {
      name: 'umifeeds-backend',
      script: 'dist/server.js',
      watch: '.',
      ignore_watch: ['node_modules']
    }
  ],
  deploy: {
    production: {
      ref: 'origin/main',
      repo: 'https://github.com/GTBitsOfGood/umi-feeds-backend',
      path: '.',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build-ts && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
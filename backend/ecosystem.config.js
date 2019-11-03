module.exports = {
  apps : [{
    name      : 'API GAME 2',
    script    : 'dist/backend/src/main.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production : {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'node',
      host : '188.226.142.224',
      ref  : 'origin/master',
      repo : 'git@github.com:EkimBackword/game2.git',
      path : '/var/www/games/game2/backend',
      'post-deploy' : 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};

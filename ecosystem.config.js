module.exports = {
  apps: [
    {
      name: 'mmt-cause-quest-api',
      script: './server/index-db.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env_file: './server/.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      error_file: './server/logs/err.log',
      out_file: './server/logs/out.log',
      log_file: './server/logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10
    },
    {
      name: 'mmt-cause-quest-frontend',
      script: 'npx',
      args: 'serve -s build -l 3000 -n',
      cwd: './client/',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      error_file: './server/logs/frontend-err.log',
      out_file: './server/logs/frontend-out.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 5000
    }
  ]
};

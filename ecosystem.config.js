module.exports = {
  apps: [{
    name: 'food-order',
    script: 'app.js',
    instances: 'max', // Sử dụng tất cả CPU cores
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      TRUST_PROXY: 'loopback'
    },
    watch: false,
    max_memory_restart: '1G'
  }]
}; 
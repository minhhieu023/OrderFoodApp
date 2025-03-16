module.exports = {
  apps: [{
    name: "order-food-app",
    script: "app.js",
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,
      DB_HOST: "localhost",
      DB_USER: "production_user",
      DB_PASSWORD: "your_prod_password",
      DB_NAME: "order_food_prod",
      JWT_SECRET: "your_production_jwt_secret",
      JWT_EXPIRES_IN: "7d",
      TZ: "Asia/Ho_Chi_Minh"
    },
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "development"
    }
  }]
}; 
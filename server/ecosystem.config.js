module.exports = {
  apps: [
    {
      name: 'causeconnect-api',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGODB_URI: 'mongodb+srv://shabahatsyed101:8flCr5MKAfy15JpW@cluster0.w8cgqlr.mongodb.net/causebags',
        JWT_SECRET: '3b3941cfe4cd28edffbc9984b59f7253',
        EMAIL_SERVICE: 'gmail',
        EMAIL_USER: 'shabahatsyed101@gmail.com',
        EMAIL_PASSWORD: 'bzvwfkneotxxekyd',
        ADMIN_EMAIL: 'admin@cause.com',
        ADMIN_PASSWORD: '12345',
        RAZORPAY_KEY_ID: 'rzp_test_uEEEREXlcrVyzx',
        RAZORPAY_KEY_SECRET: 'C8ol7Ovs9NhoGjkmpjwGgOaM'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGODB_URI: 'mongodb+srv://shabahatsyed101:8flCr5MKAfy15JpW@cluster0.w8cgqlr.mongodb.net/causebags',
        JWT_SECRET: '3b3941cfe4cd28edffbc9984b59f7253',
        EMAIL_SERVICE: 'gmail',
        EMAIL_USER: 'shabahatsyed101@gmail.com',
        EMAIL_PASSWORD: 'bzvwfkneotxxekyd',
        ADMIN_EMAIL: 'admin@cause.com',
        ADMIN_PASSWORD: '12345',
        RAZORPAY_KEY_ID: 'rzp_test_uEEEREXlcrVyzx',
        RAZORPAY_KEY_SECRET: 'C8ol7Ovs9NhoGjkmpjwGgOaM'
      },
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true
    }
  ]
};

require("dotenv").config()

const AppConfig = {
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    nextjsUrl: process.env.NEXTJS_URL,
    jwtSecret: process.env.JWT_SECRET
}

const SMTPConfig = {
    provider: process.env.SMTP_PROVIDER,
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.STMP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
    resendApiKey:process.env.RESEND_API_KEY
}


const DbConfig = {
  mongoDBUrl: process.env.MONGODB_URL,
  mongoDBName: process.env.MONGODB_DBNAME,
}

const PaymentConfig = {
  khalti:{
    url:process.env.KHALTI_PAYMENT_URL,
    secretKey:process.env.KHALTI_SECRET_KEY
  }
}

module.exports = {
    AppConfig,
    SMTPConfig,
    DbConfig,
    PaymentConfig
}
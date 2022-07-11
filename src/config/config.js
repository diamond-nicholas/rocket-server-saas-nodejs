const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'demo', 'test').required(),
    PORT: Joi.number().default(3000),
    CLIENT_URL: Joi.string().allow('').default('localhost:3000'),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    MONGODB_URL_TEST: Joi.string().required().description('Mongo DB test url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    GITHUB_ID: Joi.string().description('Github Id'),
    GITHUB_SECRET: Joi.string().description('Github secret key'),
    GOOGLE_ID: Joi.string().description('Google Id'),
    GOOGLE_SECRET: Joi.string().description('Google secret key'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    STRIPE_SECRET: Joi.string().required().description('Stripe secret key'),
    STRIPE_SECRET_TEST: Joi.string().required().description('Stripe test secret key'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  corsOrigin: envVars.NODE_ENV === 'production' ? envVars.CLIENT_URL : '*',
  clientURL: envVars.NODE_ENV === 'production' ? envVars.CLIENT_URL : 'http://localhost:3000',
  mongoose: {
    url: envVars.NODE_ENV === 'test' ? envVars.MONGODB_URL_TEST : envVars.MONGODB_URL,
    options: {
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
    emailVerificationExpirationDays: 15,
  },
  github: {
    id: envVars.GITHUB_ID,
    secret: envVars.GITHUB_SECRET,
  },
  google: {
    id: envVars.GOOGLE_ID,
    secret: envVars.GOOGLE_SECRET,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  stripe: {
    secret: envVars.NODE_ENV === 'production' ? envVars.STRIPE_SECRET : envVars.STRIPE_SECRET_TEST,
  },
};

// Esto es para que el ide detecte las variables de entorno que estoy manejando
// Si agrego una nueva variable de entorno en mi .env tengo que agregarlo aca para me lo reconozca mi editor de codigo
// Y no tener que estar copiando y pegando desde el .env cuando use el process.env

declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    HASH_SALT: number;
    JWT_SECRET: string;
    EMAIL_PASS: string;
    EMAIL_SIADI: string;
    EMAIL_API_KEY: string;
    EMAIL_URL: string;
    SMS_API_KEY: string;
    SMS_URL: string;
    OTP_CODE_WAIT_TIME: Number;
    CLOCK_WAIT_TIME: number;
    BROKER_URL: string;
    BROKER_TOPIC: string;
    APP_HOST: string;
    APP_LOGO: string;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EXPIRATIONS_TIME: Number;
    EXTRA_FEATURES:string
    EXTRA_DESTINATION_INCIDENTS:string
  }
}

declare namespace Express {
  interface Request {
    idUser: string;
    roleUser: string;
  }
}

declare module 'sernam';
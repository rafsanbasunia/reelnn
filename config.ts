// SITE CONFIG
export const NEXT_PUBLIC_SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "reelnn";

export const NEXT_PUBLIC_FOOTER_DESC =
  process.env.NEXT_PUBLIC_FOOTER_DESC ||
  "This website does not host any files on its own servers; it simply provides links to media files stored in telegram.";

export const NEXT_PUBLIC_TELEGRAM_CONTACT =
  process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT || "https://t.me/reelnnUpdates";

export const NEXT_PUBLIC_WHATSAPP_CONTACT =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT || "";

export const NEXT_PUBLIC_INSTAGRAM_CONTACT =
  process.env.NEXT_PUBLIC_INSTAGRAM_CONTACT || "";

export const SITE_SECRET = process.env.SITE_SECRET || "your_secret_key";

export const ENABLE_AUTH_PROTECTION = process.env.ENABLE_AUTH_PROTECTION === 'true';

export const LOGIN_PAGE_POSTER = process.env.NEXT_PUBLIC_LOGIN_PAGE_POSTER || "";

// Backend API
export const BACKEND_URL = process.env.BACKEND_URL || "http://0.0.0.0:6519";


// Telegram
export const NEXT_PUBLIC_TELEGRAM_BOT_NAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "reelnnbot";
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '12346578:CJNDSccosadckokco';

// Shortener API
export const SHORTENER_API_URL = process.env.SHORTENER_API_URL || '';
export const SHORTENER_API_KEY = process.env.SHORTENER_API_KEY || '';



// Don't touch this
export const TOKEN_REFRESH_INTERVAL = parseInt(
  process.env.TOKEN_REFRESH_INTERVAL_MS || "21600000",
  10
);
export const API_REQUEST_TIMEOUT = parseInt(
  process.env.API_REQUEST_TIMEOUT || "10000",
  10
);
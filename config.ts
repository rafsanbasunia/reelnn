// SITE CONFIG
export const NEXT_PUBLIC_SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "reelnn";

export const NEXT_PUBLIC_FOOTER_DESC =
  process.env.NEXT_PUBLIC_FOOTER_DESC ||
  "This website does not host any files on its own servers; it simply provides links to media files stored in telegram.";

export const NEXT_PUBLIC_FOOTER_CONTACT =
  process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT || "reelnn@example.com";

export const SITE_SECRET = process.env.SITE_SECRET || "your_secret_key";

// Backend API
export const BACKEND_URL = process.env.BACKEND_URL || "http://0.0.0.0:8000";
export const API_REQUEST_TIMEOUT = parseInt(
  process.env.API_REQUEST_TIMEOUT || "10000",
  10
);

// Telegram
export const NEXT_PUBLIC_TELEGRAM_BOT_NAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "reelnnbot";

export const TOKEN_REFRESH_INTERVAL = parseInt(
  process.env.TOKEN_REFRESH_INTERVAL_MS || "21600000",
  10
);

export const SHORTENER_API_URL = process.env.SHORTENER_API_URL || '';
export const SHORTENER_API_KEY = process.env.SHORTENER_API_KEY || '';


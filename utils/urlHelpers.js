// Function to generate the short code
const generateShortCode = (length = 7) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const removeTrailingSlash = (url) => {
  return url.replace(/\/$/, '');
};

const normalizeUrl = (url) => {
  try {
    let normalized = new URL(url.trim());

    // Convert to lowercase for hostname
    normalized.hostname = normalized.hostname.toLowerCase();

    // Remove trailing dots or slashes from the hostname
    normalized.hostname = normalized.hostname.replace(/\.+$/, "").replace(/\/+$/, "");

    // Remove 'www.' if you want a consistent format
    if (normalized.hostname.startsWith("www.")) {
      normalized.hostname = normalized.hostname.substring(4);
    }

    // Remove default ports
    if ((normalized.protocol === "https:" && normalized.port === "443") ||
        (normalized.protocol === "http:" && normalized.port === "80")) {
      normalized.port = "";
    }

    // Remove trailing slash
    normalized.pathname = normalized.pathname.replace(/\/+$/, '');

    // Decode percent-encoded characters
    normalized.pathname = decodeURIComponent(normalized.pathname);

    // Sort query parameters alphabetically
    if (normalized.search) {
      let params = new URLSearchParams(normalized.search);
      normalized.search = "?" + [...params.entries()].sort().map(([k, v]) => `${k}=${v}`).join("&");
    }

    return removeTrailingSlash(normalized.toString());
  } catch (error) {
    throw new Error("Invalid URL provided");
  }
};

// Get the current date and time in ISO 8601 string format
const getCurrentDate = () => {
    return new Date().toISOString();
};

module.exports = { generateShortCode, normalizeUrl, getCurrentDate };
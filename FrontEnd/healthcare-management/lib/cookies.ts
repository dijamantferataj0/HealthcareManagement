/**
 * Cookie utility functions for managing authentication token
 * Uses HttpOnly-compatible cookies that work across tabs and browser sessions
 */

const TOKEN_COOKIE_NAME = 'healthcare_token';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds (matches token expiration)

/**
 * Set a cookie with the token value
 */
export function setTokenCookie(token: string): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Get the token from cookies
 */
export function getTokenCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const name = TOKEN_COOKIE_NAME + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return decodeURIComponent(cookie.substring(name.length, cookie.length));
    }
  }
  
  return null;
}

/**
 * Remove the token cookie
 */
export function removeTokenCookie(): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    if (!payload.exp) return true; // No expiration claim means expired
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true; // Invalid token format means expired
  }
}

/**
 * Get the authentication token (from cookie, with localStorage fallback for migration)
 * Also validates that the token is not expired
 */
export function getAuthToken(): string | null {
  const cookieToken = getTokenCookie();
  if (cookieToken) {
    if (isTokenExpired(cookieToken)) {
      // Token is expired, remove it
      removeTokenCookie();
      return null;
    }
    return cookieToken;
  }
  
  // Fallback to localStorage for backwards compatibility during migration
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem(TOKEN_COOKIE_NAME);
    if (localToken) {
      if (isTokenExpired(localToken)) {
        // Token is expired, remove it
        localStorage.removeItem(TOKEN_COOKIE_NAME);
        return null;
      }
      // Migrate from localStorage to cookie
      setTokenCookie(localToken);
      localStorage.removeItem(TOKEN_COOKIE_NAME);
      return localToken;
    }
  }
  
  return null;
}


import { createCookieSessionStorage } from '@remix-run/node';
import { createThemeSessionResolver } from 'remix-themes';

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === 'production';

const themeSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'theme',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: [`${process.env.SESSION_SECRET}`],
    // Set domain and secure only if in production
    ...(isProduction
      ? { domain: 'your-production-domain.com', secure: true }
      : {}),
  },
});

export const themeSessionResolver =
  createThemeSessionResolver(themeSessionStorage);

// Launch context session storage
const urlSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'url_context', // Different name from theme cookie
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: [`${process.env.SESSION_SECRET}`], // Can use the same secret as theme
    ...(isProduction ? { domain: 'launchlist.space', secure: true } : {}),
  },
});

// Export launch session helpers
export const {
  getSession: getUrlSession,
  commitSession: commitUrlSession,
  destroySession: destroyUrlSession,
} = urlSessionStorage;

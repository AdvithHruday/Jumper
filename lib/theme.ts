/**
 * The colour-theme preference: "system" follows the device, "light" and "dark"
 * force one. Stored in localStorage and applied as `data-theme` on <html>,
 * which the tokens in app/globals.css already understand.
 *
 * The preference is applied by a tiny inline script before the page paints, so
 * a visitor who chose dark never sees a white flash. The React side reads the
 * same value through useSyncExternalStore, so server and client agree on the
 * first render ("system") and then update without an effect.
 */

export type Theme = 'system' | 'light' | 'dark';

export const THEME_KEY = 'ohmwise.theme';
export const THEMES: Theme[] = ['system', 'light', 'dark'];

/** Runs in <head> before first paint. Kept dependency-free and try/catch-wrapped: storage can be blocked. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

const EVENT = 'ohmwise-theme-change';

function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return isTheme(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme): void {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeTheme(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

'use client';

import './globals.css';

/**
 * The last resort, used only when the root layout itself fails. It replaces the
 * whole document, so it cannot use the header, the fonts or any component that
 * depends on them; it keeps to the colour tokens and plain elements.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: '4rem 1.25rem', maxWidth: 640, marginInline: 'auto' }}>
        <h1 style={{ margin: '0 0 0.5rem' }}>Ohmwise hit a problem</h1>
        <p style={{ margin: '0 0 1.5rem' }}>
          This is a fault in the app, not something you did. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: 44,
            padding: '0 1.1rem',
            border: 0,
            borderRadius: 10,
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            font: 'inherit',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

'use client';

import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { readTheme, setTheme, subscribeTheme, THEMES, type Theme } from '@/lib/theme';

const OPTIONS: Record<Theme, { label: string; icon: LucideIcon }> = {
  system: { label: 'System', icon: Monitor },
  light: { label: 'Light', icon: Sun },
  dark: { label: 'Dark', icon: Moon },
};

/**
 * Three-way theme choice. The server and the first client render both say
 * "system", then the stored value takes over, so there is no hydration
 * mismatch; the page itself is already themed by the inline init script.
 */
export function ThemeToggle() {
  const current = useSyncExternalStore(subscribeTheme, readTheme, () => 'system' as Theme);

  return (
    <div role="group" aria-label="Colour theme" className="grid grid-cols-3 gap-1 rounded-control bg-panel-2 p-1">
      {THEMES.map((theme) => {
        const { label, icon: Icon } = OPTIONS[theme];
        const active = current === theme;
        return (
          <button
            key={theme}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(theme)}
            className={cn(
              'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[8px] px-2 text-small font-bold',
              active ? 'bg-panel text-ink shadow-[inset_0_0_0_1.5px_var(--border-ui)]' : 'text-muted hover:text-ink',
            )}
          >
            <Icon aria-hidden size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

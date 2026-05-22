import { NavLink } from 'react-router-dom';
import { IconCalc, IconHistory, IconPresets, IconAccount } from './icons';

type Tab = {
  to: string;
  label: string;
  Icon: () => JSX.Element;
};

const TABS: Tab[] = [
  { to: '/calc',    label: 'Calc',    Icon: IconCalc    },
  { to: '/history', label: 'History', Icon: IconHistory  },
  { to: '/presets', label: 'Presets', Icon: IconPresets  },
  { to: '/account', label: 'Account', Icon: IconAccount  },
];

export default function BottomNav() {
  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 border-t border-ink/[0.08] pb-[env(safe-area-inset-bottom)] flex"
      style={{ background: 'rgb(var(--color-paper-rgb))' }}
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="flex-1 min-h-[56px] flex flex-col items-center justify-center gap-1 active:bg-ink/[0.03]"
        >
          {({ isActive }) => (
            <span className="relative inline-flex flex-col items-center gap-1">
              <span
                className={isActive ? 'text-ink' : 'text-graphite'}
                style={{ display: 'flex' }}
              >
                <Icon />
              </span>
              <span
                className={[
                  'font-serif tracking-wider',
                  isActive ? 'font-medium text-ink' : 'text-graphite',
                  // underline indicator
                  'after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2px] after:bg-pigment',
                  isActive ? 'after:opacity-100' : 'after:opacity-0',
                ].join(' ')}
                style={{ fontSize: '11px' }}
              >
                {label}
              </span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

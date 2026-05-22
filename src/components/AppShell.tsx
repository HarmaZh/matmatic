import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  // Keyboard listener: hide nav when software keyboard is up
  useEffect(() => {
    if (!window.visualViewport) return;
    const handler = () => {
      const ratio = window.visualViewport!.height / window.innerHeight;
      document.body.setAttribute('data-keyboard', ratio < 0.75 ? 'open' : 'closed');
    };
    window.visualViewport.addEventListener('resize', handler);
    return () => window.visualViewport!.removeEventListener('resize', handler);
  }, []);

  return (
    <>
      <div style={{ paddingBottom: 'calc(var(--app-nav-h) + env(safe-area-inset-bottom) + 1rem)' }}>
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

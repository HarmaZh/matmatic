import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import LandingPage from './pages/LandingPage';
import CalcPage from './pages/CalcPage';
import HistoryPage from './pages/HistoryPage';
import AccountPage from './pages/AccountPage';
import PresetsPage from './pages/PresetsPage';
import ComparePage from './pages/ComparePage';
import SeriesPage from './pages/SeriesPage';
import CutListPage from './pages/CutListPage';
import NotFoundPage from './pages/NotFoundPage';
import { useLocalStorage } from './lib/useLocalStorage';
import { DEFAULT_PROFILE, type Profile } from './lib/profile';

/**
 * Applies data-theme to <html> for every route, including chrome-less ones
 * (/, /calc/:id/cutlist, *) that render outside AppShell.
 * AppShell must NOT duplicate this effect — it is removed there.
 */
function ThemeApplier({ children }: { children: React.ReactNode }) {
  const [profile] = useLocalStorage<Profile>('matmatic.profile', DEFAULT_PROFILE);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeApplier>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* MUST be before * — react-router-dom v6 declaration order matters */}
          <Route path="/calc/:id/cutlist" element={<CutListPage />} />
          <Route element={<AppShell />}>
            <Route path="/calc" element={<CalcPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/presets" element={<PresetsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/profile" element={<Navigate to="/history" replace />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ThemeApplier>
    </BrowserRouter>
  );
}

import { Link } from 'react-router-dom';

/** Chrome-less 404. No tab bar — rendered outside AppShell. */
export default function NotFoundPage() {
  return (
    <main className="min-h-[100dvh] bg-paper text-ink flex flex-col items-center justify-center px-8 text-center">
      <p
        className="font-serif font-medium tabular-nums leading-none tracking-tight"
        style={{ fontSize: 'clamp(4rem, 20vw, 7rem)', color: '#9C3E2C' }}
      >
        404
      </p>
      <p className="text-graphite mt-4 mb-8 font-serif" style={{ fontSize: '18px' }}>
        This page doesn&rsquo;t exist.
      </p>
      <Link
        to="/"
        className="font-serif text-lg text-pigment hover:opacity-80 transition-opacity"
      >
        Back to Matmatic
      </Link>
    </main>
  );
}

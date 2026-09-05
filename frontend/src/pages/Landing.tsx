import { Link } from 'react-router-dom';
import { LiveDocumentPanel } from '../components/LiveDocumentPanel';

export function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-display text-lg italic text-ink">Together</span>
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-indigo px-4 py-2 text-[15px] font-medium text-paper transition-colors hover:bg-indigo-deep"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:py-20">
        <div className="max-w-xl">
          <h1 className="font-display text-[2.75rem] leading-[1.08] text-ink sm:text-[3.5rem]">
            Write it once,
            <br />
            <em className="not-italic text-indigo">write it together.</em>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Every keystroke, every comment, every cursor — synced the instant
            it happens. No more "final_v3_ACTUALLY_final" file names.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-indigo px-6 py-3 text-[15px] font-medium text-paper transition-all hover:bg-indigo-deep active:scale-[0.98]"
            >
              Start writing free
            </Link>
            <Link
              to="/login"
              className="rounded-lg px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <LiveDocumentPanel />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink-soft/60 sm:px-10">
        © {new Date().getFullYear()} Together. Built for teams who write in the open.
      </footer>
    </div>
  );
}

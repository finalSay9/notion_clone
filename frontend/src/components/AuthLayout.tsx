import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-indigo px-12 py-10 lg:flex">
        <Link to="/" className="font-display text-lg italic text-paper">
          Together
        </Link>
        <div className="max-w-sm">
          <p className="font-display text-3xl italic leading-snug text-paper">
            "The best draft is the one three people are already improving."
          </p>
        </div>
        <div className="flex gap-2">
          <span className="h-1.5 w-6 rounded-full bg-cursor-coral" />
          <span className="h-1.5 w-6 rounded-full bg-cursor-green" />
          <span className="h-1.5 w-6 rounded-full bg-cursor-amber" />
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-lg italic text-ink lg:hidden">
            Together
          </Link>

          <p className="mt-8 text-sm font-medium text-cursor-green lg:mt-0">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
          <p className="mt-2 text-[15px] text-ink-soft">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-[15px] text-ink-soft">
            {footerText}{' '}
            <Link to={footerLinkTo} className="font-medium text-indigo hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

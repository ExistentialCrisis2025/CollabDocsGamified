import { useEffect, useState, type ReactNode } from 'react';
import api from '../api/axios';

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [quote, setQuote] = useState<{
    quote: string;
    author: string;
    category?: string;
  } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchQuote() {
      try {
        setQuoteError(false);
        const response = await api.get('/quotes/random');
        if (isMounted) {
          setQuote(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setQuoteError(true);
        }
        console.error('[auth] quote fetch failed', error);
      } finally {
        if (isMounted) {
          setQuoteLoading(false);
        }
      }
    }

    fetchQuote();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-[float_14s_ease-in-out_infinite]" />
        <div className="absolute right-16 top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-[drift_18s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-120px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_45%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10 lg:py-0">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-between gap-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.45em] text-cyan-400">
              Task Forge
            </div>
            <h1 className="mt-6 text-4xl font-black text-slate-100 sm:text-5xl">
              Master your missions
            </h1>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              Elevate productivity through tactical task management and focused execution.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
              Daily briefing
            </div>
            <div className="mt-4 min-h-[200px] rounded-2xl border border-dashed border-cyan-400/30 bg-slate-950/60 p-5 text-sm text-slate-300">
              {quoteLoading ? (
                <p className="text-slate-400">Loading briefing...</p>
              ) : quoteError ? (
                <p className="text-slate-400">Briefing temporarily offline.</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed text-slate-100">"{quote?.quote}"</p>
                  <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/70">
                    {quote?.author || 'Unknown'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_20px_60px_rgba(3,7,18,0.65)] backdrop-blur">
            {children}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
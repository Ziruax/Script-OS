'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  detail?: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind, detail?: string) => string;
  dismiss: (id: string) => void;
  update: (id: string, message: string, kind?: ToastKind, detail?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;
const nextId = () => `toast_${Date.now()}_${++counter}`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'info', detail?: string) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, kind, detail }]);
    if (kind !== 'loading') {
      // auto-dismiss after 3.5s (loading toasts must be manually updated/dismissed)
      setTimeout(() => dismiss(id), 3500);
    }
    return id;
  }, [dismiss]);

  const update = useCallback((id: string, message: string, kind: ToastKind = 'info', detail?: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, message, kind, detail } : t)));
    if (kind !== 'loading') {
      setTimeout(() => dismiss(id), 3500);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, update }}>
      {children}
      {/* Toast viewport — fixed bottom-right, stacked */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none">
        {toasts.map((t) => {
          const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertCircle : t.kind === 'loading' ? Loader2 : Info;
          const accent =
            t.kind === 'success'
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100'
              : t.kind === 'error'
              ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100'
              : t.kind === 'loading'
              ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-100'
              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100';
          const iconColor =
            t.kind === 'success'
              ? 'text-emerald-600 dark:text-emerald-400'
              : t.kind === 'error'
              ? 'text-rose-600 dark:text-rose-400'
              : t.kind === 'loading'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-neutral-500';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 pr-9 rounded-xl border shadow-lg backdrop-blur-md animate-in fade-in duration-200 ${accent}`}
              role="status"
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor} ${t.kind === 'loading' ? 'animate-spin' : ''}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold leading-snug">{t.message}</div>
                {t.detail && <div className="text-[10px] opacity-75 mt-0.5 leading-snug">{t.detail}</div>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="absolute top-2 right-2 p-0.5 rounded-md opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful no-op fallback so components rendered outside the provider don't crash
    return {
      toast: (_msg: string, _kind?: ToastKind, _detail?: string) => 'noop',
      dismiss: (_id: string) => {},
      update: (_id: string, _msg: string, _kind?: ToastKind, _detail?: string) => {},
    };
  }
  return ctx;
}

import * as Sentry from "@sentry/nextjs";

const dsn =
  (typeof window !== "undefined" && (window as unknown as Record<string, string>).__SENTRY_DSN__) ||
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "";

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

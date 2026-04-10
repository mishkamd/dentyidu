export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    let dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const settings = await prisma.sentrySettings.findFirst();
      await prisma.$disconnect();
      if (settings?.isEnabled && settings.dsn) dsn = settings.dsn;
    } catch { /* DB not ready yet — use env fallback */ }
    if (dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
        enableLogs: true,
      });
    }
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

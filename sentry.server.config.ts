import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for tracing.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // Configure release
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  beforeSend(event, hint) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === 'development') {
      // Don't send database connection errors in development
      if (event.exception?.values?.[0]?.value?.includes('database')) {
        return null;
      }
    }

    // Don't send errors for 404s or other expected errors
    if (event.exception?.values?.[0]?.type === 'NotFoundError') {
      return null;
    }

    return event;
  },

  integrations: [
    // Add integrations as needed
  ],

  // Set initial scope
  initialScope: {
    tags: {
      app: 'sisdat-forecast',
      component: 'backend',
    },
  },
});
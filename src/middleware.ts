import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(); // This is the Clerk middleware

export const config = { // Configures the middleware to run on all routes except for static files and Next.js internals
  // This middleware will run on all routes except for static files and Next.js internals
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ], // The matcher defines which routes the middleware should apply to
  // This matcher will run on all routes except for static files and Next.js internals
}; // The config object is exported to configure the middleware behavior
// The matcher is used to specify which routes the middleware should apply to
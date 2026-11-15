import { NextResponse, type NextRequest } from "next/server";

/* /blog → /blog/, as Netlify did. Google has the blog at /blog/, WITH the slash, so that's its address.

   This can't be a redirect in next.config.mjs: Next matches those rules with or without a trailing slash, so a rule
   for /blog caught /blog/ too and sent it to itself, forever. Here the address arrives exactly as typed
   (skipTrailingSlashRedirect is on), which is what Next's docs give this file for. The matcher keeps it to the blog's
   address, so nothing else on the site runs through it. */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/blog") {
    // a plain URL: Next's own URL object drops a trailing slash when it's written out
    return NextResponse.redirect(new URL("/blog/", request.url), 308);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/blog", "/blog/"] };

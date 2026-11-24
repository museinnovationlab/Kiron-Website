/* Routing that keeps every address the old site answered (it was plain files on Netlify, with "pretty URLs"):

   - /blog/ keeps its trailing slash. Next normally strips trailing slashes with a redirect, which would send Google's
     /blog/ away, so that's switched off (skipTrailingSlashRedirect) and done by hand instead: every address ending in
     a slash except /blog/ goes to the one without (/privacy/ → /privacy), as on Netlify, and proxy.ts sends /blog to
     /blog/ (a rule here for /blog also catches /blog/, and looped).
   - The old .html files answer at their old addresses, and without .html too: /privacy and /privacy.html are the
     same page (the shipped app opens /privacy; App Store Connect, the sitemap and Google have .html). Each page's
     canonical link names one of them. Rewrites, not redirects: the address stays as typed.
   - Apple's and Android's app-link files are served as JSON (Apple's has no extension, so it needs saying), straight
     from public/.well-known, with no redirect: both platforms refuse a redirect there.
   - Every page's metadata goes in <head> before the page is sent (htmlLimitedBots matches everyone). Only the share
     pages fetch theirs; the apps that draw link previews read only <head>, as does scripts/check-site.mjs. */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  htmlLimitedBots: /.*/,
  async redirects() {
    return [
      { source: "/:path((?!blog/?$).+)/", destination: "/:path", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/index.html", destination: "/" },
      { source: "/blog/index.html", destination: "/blog" },
      { source: "/blog/:slug.html", destination: "/blog/:slug" },
      { source: "/privacy.html", destination: "/privacy" },
      { source: "/terms.html", destination: "/terms" },
      { source: "/support.html", destination: "/support" },
      { source: "/delete-data.html", destination: "/delete-data" },
    ];
  },
  async headers() {
    const json = [{ key: "Content-Type", value: "application/json" }];
    return [
      { source: "/.well-known/apple-app-site-association", headers: json },
      { source: "/.well-known/assetlinks.json", headers: json },
      // Screen recordings app reviewers are pointed at. Nothing links to them, and search engines are told to skip them.
      { source: "/review/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;

/* Structured data for search engines (schema.org JSON-LD), as the old site carried it: SoftwareApplication,
   Organization and FAQPage on the home page, an Article on each post. `<` is escaped so no string in the data can close
   the script element early. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

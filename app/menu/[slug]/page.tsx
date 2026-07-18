import Storefront from "@/components/Storefront";

// Force static prerendering — slug is accepted for future multi-tenant routing.
// When multi-tenant is wired, remove this and generate slugs from a DB/CMS.
export const dynamic = "force-static";

export default function MenuBySlug({
  params,
}: {
  params: { slug: string };
}) {
  // Pass slug as a data attribute so client-side JS can scope localStorage keys
  // per business (e.g. lineasur.business.{slug}.v1) when multi-tenant is enabled.
  return <Storefront slug={params.slug} />;
}

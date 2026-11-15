import { sharePage } from "@/components/share-page";

/* A shared gym setup: trykiron.com/g/<id>. See app/w/[id]/page.tsx. */
const { generateMetadata, Page } = sharePage("g");
export const dynamic = "force-dynamic";
export { generateMetadata };
export default Page;

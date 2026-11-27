import { sharePage } from "@/components/share-page";

/* A shared workout: trykiron.com/w/<id>. The app makes these links; iOS and Android open them in Kiron when it's
   installed (public/.well-known), and everyone else lands here. */
const { generateMetadata, Page } = sharePage("w");
export const dynamic = "force-dynamic";
export { generateMetadata };
export default Page;

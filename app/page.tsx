import KashurmewaVeginaHome from "./kashurmewa-vegina-home-client";
import { fetchAllProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const products = await fetchAllProducts();
    return <KashurmewaVeginaHome initialProducts={products} />;
  } catch (error) {
    console.error("Unable to render the live KASHURMEWA catalogue:", error);
    return <KashurmewaVeginaHome initialProducts={[]} catalogueError />;
  }
}

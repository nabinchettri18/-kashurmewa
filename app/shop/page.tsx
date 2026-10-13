import ShopClient from "./shop-client";
import { fetchAllProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  try {
    const products = await fetchAllProducts();
    return <ShopClient initialProducts={products} />;
  } catch (error) {
    console.error("Unable to render the live KASHURMEWA catalogue:", error);
    return <ShopClient initialProducts={[]} catalogueError />;
  }
}

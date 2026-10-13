import { redirect } from "next/navigation";

// Checkout is intentionally handled in the cart drawer so the customer can
// review their live prices and delivery total before placing the order.
export default function CheckoutPage() {
  redirect("/cart?checkout=1");
}

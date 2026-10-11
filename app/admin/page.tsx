"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowUp, ArrowDown, ImagePlus, Plus, Save, Trash2, LogOut, Package, RefreshCw } from "lucide-react";

type Variant = { id: string; size: string; price_inr: number; stock: number; sku: string | null; active: boolean };
type ProductImage = { id: string; url: string; alt_text: string | null; sort_order: number; storage_path: string | null };
type Product = { id: string; slug: string; name: string; description: string; origin: string; ingredients: string; storage_instructions: string | null; shelf_life: string | null; active: boolean; km_product_variants: Variant[]; km_product_images: ProductImage[] };
type VariantDraft = { id?: string; size: string; price_inr: string; stock: string; sku: string; active: boolean };

const emptyDraft = () => ({ name: "", slug: "", description: "", origin: "", ingredients: "", storage_instructions: "", shelf_life: "", active: false });
const slugify = (value: string) => value.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const inr = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function AdminDashboard() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"checking" | "signed-out" | "denied" | "allowed">("checking");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(emptyDraft());
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async (preferredId?: string) => {
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase
        .from("km_products")
        .select("id,slug,name,description,origin,ingredients,storage_instructions,shelf_life,active,km_product_variants(id,size,price_inr,stock,sku,active),km_product_images(id,url,alt_text,sort_order,storage_path)")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      const list = (data || []) as Product[];
      setProducts(list);
      const nextId = preferredId && list.some((p) => p.id === preferredId) ? preferredId : selectedId && list.some((p) => p.id === selectedId) ? selectedId : list[0]?.id || "";
      if (nextId) chooseProduct(list.find((p) => p.id === nextId)!);
      else { setSelectedId(""); setDraft(emptyDraft()); setVariants([]); setImages([]); setIsNew(false); }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products. Check the admin migration and permissions.");
    } finally { setLoading(false); }
  }, [selectedId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session) { setAuthState("signed-out"); router.replace("/account?next=%2Fadmin"); return; }
      const { data, error: adminError } = await supabase.from("km_admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (adminError || !data) { setAuthState("denied"); return; }
      setAuthState("allowed");
      void loadProducts();
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAuthState("signed-out"); router.replace("/account?next=%2Fadmin"); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [router, loadProducts]);

  function chooseProduct(p: Product) {
    setSelectedId(p.id);
    setDraft({ name: p.name || "", slug: p.slug || "", description: p.description || "", origin: p.origin || "", ingredients: p.ingredients || "", storage_instructions: p.storage_instructions || "", shelf_life: p.shelf_life || "", active: Boolean(p.active) });
    setVariants((p.km_product_variants || []).map((v) => ({ id: v.id, size: v.size, price_inr: String(v.price_inr), stock: String(v.stock), sku: v.sku || "", active: Boolean(v.active) })));
    setImages([...(p.km_product_images || [])].sort((a, b) => a.sort_order - b.sort_order));
    setFiles([]);
    setIsNew(false);
    setMessage("");
    setError("");
  }

  function startNewProduct() {
    setSelectedId("");
    setDraft(emptyDraft());
    setVariants([{ size: "", price_inr: "", stock: "0", sku: "", active: true }]);
    setImages([]);
    setFiles([]);
    setIsNew(true);
    setMessage("");
    setError("");
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((v, i) => i === index ? { ...v, ...patch } : v));
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      const name = draft.name.trim();
      const slug = slugify(draft.slug || name);
      if (!name || !slug) throw new Error("Product name and a valid slug are required.");
      if (draft.active && variants.length === 0) throw new Error("Add at least one pack size before publishing this product.");
      if (variants.some((v) => !v.size.trim() || !Number.isInteger(Number(v.price_inr)) || Number(v.price_inr) < 0 || !Number.isInteger(Number(v.stock)) || Number(v.stock) < 0)) {
        throw new Error("Each pack needs a size, a whole-number price, and a non-negative whole-number stock count.");
      }
      const productPayload = { name, slug, description: draft.description.trim(), origin: draft.origin.trim(), ingredients: draft.ingredients.trim(), storage_instructions: draft.storage_instructions.trim() || null, shelf_life: draft.shelf_life.trim() || null, active: draft.active, updated_at: new Date().toISOString() };
      let productId = selectedId;
      if (isNew) {
        const { data, error: insertError } = await supabase.from("km_products").insert(productPayload).select("id").single();
        if (insertError) throw insertError;
        productId = data.id;
      } else {
        const { error: updateError } = await supabase.from("km_products").update(productPayload).eq("id", productId);
        if (updateError) throw updateError;
      }

      const existing = products.find((p) => p.id === productId)?.km_product_variants || [];
      const draftIds = variants.flatMap((v) => v.id ? [v.id] : []);
      const removed = existing.filter((v) => !draftIds.includes(v.id));
      for (const v of removed) {
        const { error: deleteError } = await supabase.from("km_product_variants").delete().eq("id", v.id);
        if (deleteError) throw deleteError;
      }
      for (const v of variants) {
        const payload = { product_id: productId, size: v.size.trim(), price_inr: Number(v.price_inr), stock: Number(v.stock), sku: v.sku.trim() || null, active: v.active, updated_at: new Date().toISOString() };
        const result = v.id
          ? await supabase.from("km_product_variants").update(payload).eq("id", v.id)
          : await supabase.from("km_product_variants").insert(payload);
        if (result.error) throw result.error;
      }
      setSelectedId(productId);
      setIsNew(false);
      await loadProducts(productId);
      setMessage("Product details saved. Upload or arrange product photos below.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed. Your changes were not confirmed.");
      if (isNew) await loadProducts();
    } finally { setSaving(false); }
  }

  async function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) return;
    if (!selectedId || isNew) { setError("Save the product first, then upload its photos."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      for (const file of selectedFiles) {
        if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) throw new Error(`${file.name}: use JPG, PNG, WebP or AVIF.`);
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name}: image must be 10 MB or smaller.`);
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
        const path = `${selectedId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("kashurmewa-products").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("kashurmewa-products").getPublicUrl(path);
        const { error: insertError } = await supabase.from("km_product_images").insert({ product_id: selectedId, url: publicUrl, alt_text: draft.name, sort_order: images.length, storage_path: path });
        if (insertError) {
          await supabase.storage.from("kashurmewa-products").remove([path]);
          throw insertError;
        }
      }
      setMessage("Product photos uploaded successfully.");
      await loadProducts(selectedId);
    } catch (e) { setError(e instanceof Error ? e.message : "Image upload failed."); }
    finally { setSaving(false); }
  }

  async function removeImage(image: ProductImage) {
    if (!window.confirm("Remove this product photo?")) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const { error: deleteError } = await supabase.from("km_product_images").delete().eq("id", image.id);
      if (deleteError) throw deleteError;
      if (image.storage_path) {
        const { error: storageError } = await supabase.storage.from("kashurmewa-products").remove([image.storage_path]);
        if (storageError) throw storageError;
      }
      setMessage("Photo removed."); await loadProducts(selectedId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not remove photo."); }
    finally { setSaving(false); }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const ordered = [...images];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setSaving(true); setError(""); setMessage("");
    try {
      for (let i = 0; i < ordered.length; i++) {
        const { error: updateError } = await supabase.from("km_product_images").update({ sort_order: i }).eq("id", ordered[i].id);
        if (updateError) throw updateError;
      }
      setMessage("Photo order saved."); await loadProducts(selectedId);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not reorder photos."); }
    finally { setSaving(false); }
  }

  async function deleteProduct() {
    if (!selectedId || !window.confirm("Delete this product and its variants/photos from the catalogue? This cannot be undone.")) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const current = products.find((p) => p.id === selectedId);
      const paths = (current?.km_product_images || []).flatMap((i) => i.storage_path ? [i.storage_path] : []);
      const { error: deleteError } = await supabase.from("km_products").delete().eq("id", selectedId);
      if (deleteError) throw deleteError;
      if (paths.length) await supabase.storage.from("kashurmewa-products").remove(paths);
      setMessage("Product deleted."); setSelectedId(""); await loadProducts();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete product."); }
    finally { setSaving(false); }
  }

  async function signOut() { await supabase.auth.signOut(); router.replace("/account"); }

  if (authState === "checking" || authState === "signed-out") return <main className="km-admin-screen"><div className="km-admin-card"><span className="km-admin-kicker">KASHURMEWA · PRIVATE ADMIN</span><h1>Checking access…</h1><p>Please wait while we verify your admin account.</p></div></main>;
  if (authState === "denied") return <main className="km-admin-screen"><div className="km-admin-card"><span className="km-admin-kicker">KASHURMEWA · PRIVATE ADMIN</span><h1>Admin access required.</h1><p>This account is not on the store admin list. Sign in with the owner account or add your user ID to <code>public.km_admin_users</code> after applying the admin migration.</p><button className="km-admin-button secondary" onClick={signOut}><LogOut size={16}/> Sign out</button><Link className="km-admin-link" href="/">Return to storefront</Link></div></main>;

  const activeProduct = products.find((p) => p.id === selectedId);
  return <main className="km-admin-screen">
    <header className="km-admin-header">
      <Link className="km-admin-brand" href="/"><span>KASHUR<span>MEWA</span></span><small>THE TASTE OF KASHMIR · ADMIN</small></Link>
      <div className="km-admin-header-actions"><span>Catalogue management</span><button className="km-admin-button secondary" onClick={signOut}><LogOut size={15}/> Sign out</button></div>
    </header>
    <div className="km-admin-layout">
      <aside className="km-admin-sidebar">
        <div className="km-admin-side-title">YOUR STORE <small>PRODUCTS & INVENTORY</small></div>
        <button className="km-admin-button primary" onClick={startNewProduct}><Plus size={16}/> Add product</button>
        <button className="km-admin-button secondary" onClick={() => void loadProducts()}><RefreshCw size={15}/> Refresh catalogue</button>
        <div className="km-admin-product-list">
          {products.map((p) => <button key={p.id} className={selectedId === p.id && !isNew ? "km-admin-product-choice selected" : "km-admin-product-choice"} onClick={() => chooseProduct(p)}>
            <span>{p.name}</span><small>{p.active ? "Published" : "Draft"} · {(p.km_product_variants || []).length} pack options</small>
          </button>)}
          {!products.length && !loading && <p className="km-admin-muted">No products yet. Add your first product.</p>}
        </div>
        <Link className="km-admin-link" href="/shop"><ArrowLeft size={14}/> View customer shop</Link>
      </aside>
      <section className="km-admin-editor">
        <div className="km-admin-page-heading"><div><span className="km-admin-kicker">PRODUCT STUDIO</span><h1>{isNew ? "Create a product" : draft.name || "Choose a product"}</h1><p>Manage product details, pack sizes, pricing, stock and photographs. Changes save to the live catalogue.</p></div>
          {!isNew && selectedId && <span className={draft.active ? "km-admin-status published" : "km-admin-status"}>{draft.active ? "PUBLISHED" : "DRAFT"}</span>}
        </div>
        {message && <div className="km-admin-alert success" role="status">{message}</div>}
        {error && <div className="km-admin-alert error" role="alert">{error}</div>}
        {loading && <div className="km-admin-alert">Loading catalogue…</div>}
        {(isNew || activeProduct) ? <>
          <form className="km-admin-card" onSubmit={saveProduct}>
            <div className="km-admin-card-heading"><div><span>01 · PRODUCT INFORMATION</span><h2>Tell its story</h2></div><Package size={20}/></div>
            <div className="km-admin-form-grid">
              <label>Product name<input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })} placeholder="e.g. Kashmiri Walnuts"/></label>
              <label>URL slug<input required value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} placeholder="kashmiri-walnuts"/></label>
              <label className="wide">Description<textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Tell customers what makes this product special."/></label>
              <label>Origin<input value={draft.origin} onChange={(e) => setDraft({ ...draft, origin: e.target.value })} placeholder="Product origin"/></label>
              <label>Ingredients<input value={draft.ingredients} onChange={(e) => setDraft({ ...draft, ingredients: e.target.value })} placeholder="Ingredients / materials"/></label>
              <label>Storage instructions<input value={draft.storage_instructions} onChange={(e) => setDraft({ ...draft, storage_instructions: e.target.value })} placeholder="How to store"/></label>
              <label>Shelf life<input value={draft.shelf_life} onChange={(e) => setDraft({ ...draft, shelf_life: e.target.value })} placeholder="e.g. 6 months"/></label>
            </div>
            <label className="km-admin-publish-toggle"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })}/><span><b>Publish this product</b><small>Published products appear in the customer shop. Drafts remain hidden.</small></span></label>
            <div className="km-admin-actions"><button className="km-admin-button primary" disabled={saving}><Save size={16}/>{saving ? "Saving…" : "Save product"}</button>{!isNew && <button type="button" className="km-admin-button danger" disabled={saving} onClick={deleteProduct}><Trash2 size={15}/> Delete product</button>}</div>
          </form>

          <section className="km-admin-card">
            <div className="km-admin-card-heading"><div><span>02 · PACK SIZES & INVENTORY</span><h2>Every pack, your way</h2></div><button className="km-admin-button secondary" onClick={() => setVariants((current) => [...current, { size: "", price_inr: "", stock: "0", sku: "", active: true }])}><Plus size={15}/> Add pack size</button></div>
            <p className="km-admin-muted">Prices are in INR. Keep a size unique within this product. Changes are saved with “Save product”.</p>
            <div className="km-admin-variant-list">
              {variants.map((v, index) => <div className="km-admin-variant" key={v.id || `new-${index}`}>
                <label>Pack size<input required value={v.size} onChange={(e) => updateVariant(index, { size: e.target.value })} placeholder="e.g. 250 g"/></label>
                <label>Price (₹)<input required type="number" min="0" step="1" value={v.price_inr} onChange={(e) => updateVariant(index, { price_inr: e.target.value })} placeholder="0"/></label>
                <label>Stock units<input required type="number" min="0" step="1" value={v.stock} onChange={(e) => updateVariant(index, { stock: e.target.value })}/></label>
                <label>SKU (optional)<input value={v.sku} onChange={(e) => updateVariant(index, { sku: e.target.value })} placeholder="Internal code"/></label>
                <label className="km-admin-variant-active"><input type="checkbox" checked={v.active} onChange={(e) => updateVariant(index, { active: e.target.checked })}/> Available in shop</label>
                <button className="km-admin-icon-button" type="button" aria-label="Remove pack size" onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}><Trash2 size={16}/></button>
              </div>)}
              {!variants.length && <p className="km-admin-muted">No pack sizes yet. Add at least one pack before publishing.</p>}
            </div>
            <button className="km-admin-button primary" disabled={saving} onClick={(e) => { e.preventDefault(); const form = document.querySelector<HTMLFormElement>(".km-admin-editor form"); form?.requestSubmit(); }}><Save size={16}/> Save product & pack sizes</button>
          </section>

          {!isNew && selectedId && <section className="km-admin-card">
            <div className="km-admin-card-heading"><div><span>03 · PRODUCT PHOTOGRAPHY</span><h2>Build the gallery</h2></div><ImagePlus size={20}/></div>
            <p className="km-admin-muted">Upload JPG, PNG, WebP or AVIF images up to 10 MB each. The first photo is used as the product cover. Use arrows to change the order.</p>
            <label className="km-admin-upload"><ImagePlus size={22}/><b>Choose product photos</b><span>Upload one or multiple images</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={uploadImages} disabled={saving}/></label>
            {images.length > 0 ? <div className="km-admin-gallery">{images.map((image, index) => <article className="km-admin-gallery-item" key={image.id}>
              <img src={image.url} alt={image.alt_text || draft.name}/>
              <div><b>{index === 0 ? "Cover photo" : `Gallery image ${index + 1}`}</b><small>{image.alt_text || draft.name}</small></div>
              <div className="km-admin-gallery-actions"><button type="button" aria-label="Move photo up" disabled={index === 0 || saving} onClick={() => void moveImage(index, -1)}><ArrowUp size={15}/></button><button type="button" aria-label="Move photo down" disabled={index === images.length - 1 || saving} onClick={() => void moveImage(index, 1)}><ArrowDown size={15}/></button><button type="button" aria-label="Remove photo" disabled={saving} onClick={() => void removeImage(image)}><Trash2 size={15}/></button></div>
            </article>)}</div> : <div className="km-admin-empty-gallery">No product photos uploaded yet. Add your own photographs here.</div>}
          </section>}
        </> : <div className="km-admin-card km-admin-empty"><Package size={28}/><h2>Your product studio</h2><p>Choose a product from the list or create one to begin.</p><button className="km-admin-button primary" onClick={startNewProduct}><Plus size={16}/> Create first product</button></div>}
        <footer className="km-admin-footer">KASHURMEWA · THE TASTE OF KASHMIR <span>PRODUCTS ARE MANAGED FROM YOUR CATALOGUE</span></footer>
      </section>
    </div>
  </main>;
}

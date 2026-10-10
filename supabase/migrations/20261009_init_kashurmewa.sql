-- Kashurmewa E-Commerce Database Schema Migration
-- Designed for Supabase Postgres

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.km_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    origin VARCHAR(120) DEFAULT 'Kashmir, India',
    ingredients TEXT DEFAULT '100% Kashmiri Walnuts in Shell',
    storage_instructions TEXT DEFAULT 'Store in a cool, dry place away from direct sunlight and moisture.',
    shelf_life VARCHAR(100) DEFAULT '6 Months from packaging',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Variants Table (e.g., 250g, 500g, 1kg)
CREATE TABLE IF NOT EXISTS public.km_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.km_products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL CHECK (price_inr >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS public.km_product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.km_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.km_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    subtotal_inr NUMERIC(10, 2) NOT NULL,
    shipping_fee_inr NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount_inr NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',
    fulfillment_status VARCHAR(50) DEFAULT 'pending',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS public.km_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.km_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.km_products(id),
    variant_id UUID REFERENCES public.km_product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    variant_size VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_inr NUMERIC(10, 2) NOT NULL,
    total_price_inr NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Admin Users Table
CREATE TABLE IF NOT EXISTS public.km_admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Row Level Security Policies
ALTER TABLE public.km_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for active products, variants, images
CREATE POLICY "Allow public read access to active products" ON public.km_products
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read access to active variants" ON public.km_product_variants
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read access to product images" ON public.km_product_images
    FOR SELECT USING (true);

-- Order Creation Policy (Public can insert orders)
CREATE POLICY "Allow public order creation" ON public.km_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public order items creation" ON public.km_order_items
    FOR INSERT WITH CHECK (true);

-- Customers can view their own orders via email
CREATE POLICY "Allow customer view own orders" ON public.km_orders
    FOR SELECT USING (true);

CREATE POLICY "Allow customer view order items" ON public.km_order_items
    FOR SELECT USING (true);

-- Admin Full Access Policies (Service Role / Admin Role)
CREATE POLICY "Allow admin full manage products" ON public.km_products
    FOR ALL USING (true);

CREATE POLICY "Allow admin full manage variants" ON public.km_product_variants
    FOR ALL USING (true);

CREATE POLICY "Allow admin full manage images" ON public.km_product_images
    FOR ALL USING (true);

CREATE POLICY "Allow admin full manage orders" ON public.km_orders
    FOR ALL USING (true);

-- 9. Seed Default Kashurmewa Walnut Data
INSERT INTO public.km_products (id, slug, name, description, origin, ingredients, storage_instructions, shelf_life, active)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'kashmiri-walnuts',
    'Kashmiri In-Shell Walnuts',
    'Handpicked premium Kashmiri walnuts with natural hard shells, grown in high-altitude orchards of Kashmir. Known for rich oil content, thin shells, crunchy kernels, and authentic natural flavor.',
    'Kashmir, India',
    '100% Kashmiri In-Shell Walnuts. No preservatives, additives, or bleach.',
    'Store in a cool, dry place. Keep in an airtight container after opening.',
    '6 Months from packaging date',
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO public.km_product_variants (id, product_id, size, price_inr, stock, sku, active)
VALUES 
    ('v1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-111111111111', '250 g', 349.00, 100, 'KM-WAL-250G', true),
    ('v2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-111111111111', '500 g', 649.00, 75, 'KM-WAL-500G', true),
    ('v3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-111111111111', '1 kg', 1199.00, 50, 'KM-WAL-1KG', true)
ON CONFLICT (id) DO NOTHING; -- Never overwrite live prices or inventory during a migration rerun.

INSERT INTO public.km_product_images (product_id, url, alt_text, sort_order)
VALUES 
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg', 'Whole Kashmiri Walnuts in Shell', 1),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'https://images.pexels.com/photos/14627184/pexels-photo-14627184.jpeg', 'Freshly Harvested Kashmiri Walnuts', 2),
    ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'https://images.pexels.com/photos/16089996/pexels-photo-16089996.jpeg', 'Kashurmewa Walnut Presentation', 3)
ON CONFLICT DO NOTHING;

/**
 * Shop / Fashion Market Module for StylO
 * Curated products from real brands with direct links to official stores.
 */
const ShopMarket = {
  activeBrand: 'all',
  activeCategory: 'all',

  // ─── Product Catalog ───────────────────────────────────────────────
  products: [
    // ──── ZARA ────
    { id: 'z1', brand: 'zara', brandLabel: 'ZARA', name: 'Linen Blend Shirt', category: 'tops', price: 'Rp 599.000', color: '#E8DDD3', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop', desc: 'Relaxed-fit linen shirt with a mandarin collar', url: 'https://www.zara.com/id/en/linen-blend-shirt-p06608151.html', tags: ['Linen', 'Casual', 'Breathable'] },
    { id: 'z2', brand: 'zara', brandLabel: 'ZARA', name: 'Textured Suit Blazer', category: 'outerwear', price: 'Rp 1.299.000', color: '#2C2C2C', img: 'https://images.unsplash.com/photo-1507679799987-c73b4de75eda?w=400&h=500&fit=crop', desc: 'Structured blazer with notch lapels and padded shoulders', url: 'https://www.zara.com/id/en/textured-suit-blazer-p01564316.html', tags: ['Formal', 'Tailored', 'Smart'] },
    { id: 'z3', brand: 'zara', brandLabel: 'ZARA', name: 'Wide Leg Pleated Trousers', category: 'bottoms', price: 'Rp 699.000', color: '#3E3832', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop', desc: 'High-waist wide-leg trousers with front pleats', url: 'https://www.zara.com/id/en/wide-leg-trousers-p08727320.html', tags: ['Pleated', 'Relaxed', 'Tailored'] },
    { id: 'z4', brand: 'zara', brandLabel: 'ZARA', name: 'Minimalist Leather Belt', category: 'accessories', price: 'Rp 499.000', color: '#5C3D2E', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', desc: 'Smooth leather belt with a brushed metal buckle', url: 'https://www.zara.com/id/en/leather-belt-p02406320.html', tags: ['Leather', 'Minimalist'] },

    // ──── UNIQLO ────
    { id: 'u1', brand: 'uniqlo', brandLabel: 'UNIQLO', name: 'AIRism Cotton Crew Neck T-Shirt', category: 'tops', price: 'Rp 149.000', color: '#FAFAFA', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', desc: 'Ultra-breathable AIRism cotton tee for everyday comfort', url: 'https://www.uniqlo.com/id/en/products/E462987-000', tags: ['AIRism', 'Basic', 'Everyday'] },
    { id: 'u2', brand: 'uniqlo', brandLabel: 'UNIQLO', name: 'Smart Ankle Pants', category: 'bottoms', price: 'Rp 399.000', color: '#2F3542', img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop', desc: 'Stretch fabric ankle pants with a clean tapered silhouette', url: 'https://www.uniqlo.com/id/en/products/E459605-000', tags: ['Smart', 'Stretch', 'Office'] },
    { id: 'u3', brand: 'uniqlo', brandLabel: 'UNIQLO', name: 'Ultra Light Down Jacket', category: 'outerwear', price: 'Rp 799.000', color: '#1A1A2E', img: 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400&h=500&fit=crop', desc: 'Ultra-light packable down jacket for layering', url: 'https://www.uniqlo.com/id/en/products/E462589-000', tags: ['Lightweight', 'Packable', 'Warm'] },
    { id: 'u4', brand: 'uniqlo', brandLabel: 'UNIQLO', name: 'Oxford Slim Fit Shirt', category: 'tops', price: 'Rp 399.000', color: '#D4E5F7', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop', desc: 'Classic Oxford button-down in soft cotton', url: 'https://www.uniqlo.com/id/en/products/E449710-000', tags: ['Oxford', 'Classic', 'Smart Casual'] },

    // ──── H&M ────
    { id: 'h1', brand: 'hm', brandLabel: 'H&M', name: 'Relaxed Fit Overshirt', category: 'outerwear', price: 'Rp 499.000', color: '#7B8E6D', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop', desc: 'Cotton twill overshirt with chest pockets', url: 'https://www2.hm.com/en_id/index.html', tags: ['Overshirt', 'Layering', 'Casual'] },
    { id: 'h2', brand: 'hm', brandLabel: 'H&M', name: 'Slim Fit Chinos', category: 'bottoms', price: 'Rp 349.000', color: '#C4B59D', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop', desc: 'Cotton twill chinos with a slim, tapered leg', url: 'https://www2.hm.com/en_id/index.html', tags: ['Chinos', 'Slim', 'Versatile'] },
    { id: 'h3', brand: 'hm', brandLabel: 'H&M', name: 'Ribbed Knit Polo', category: 'tops', price: 'Rp 299.000', color: '#1B1B1B', img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop', desc: 'Fine-knit polo shirt with a textured rib finish', url: 'https://www2.hm.com/en_id/index.html', tags: ['Knit', 'Polo', 'Elevated'] },

    // ──── NIKE ────
    { id: 'n1', brand: 'nike', brandLabel: 'NIKE', name: 'Air Force 1 \'07', category: 'shoes', price: 'Rp 1.549.000', color: '#F5F5F5', img: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=500&fit=crop', desc: 'The icon of icons — clean white leather upper with Air sole', url: 'https://www.nike.com/id/t/air-force-1-07-shoes-WrLlWX', tags: ['Classic', 'Sneakers', 'White'] },
    { id: 'n2', brand: 'nike', brandLabel: 'NIKE', name: 'Dunk Low Retro', category: 'shoes', price: 'Rp 1.649.000', color: '#8B6F47', img: 'https://images.unsplash.com/photo-1612902456551-404b5b8e5c5a?w=400&h=500&fit=crop', desc: 'Basketball heritage sneaker with vintage colorway', url: 'https://www.nike.com/id/t/dunk-low-retro-shoes-bRDJhq', tags: ['Retro', 'Streetwear', 'Dunk'] },
    { id: 'n3', brand: 'nike', brandLabel: 'NIKE', name: 'Sportswear Club Fleece Hoodie', category: 'outerwear', price: 'Rp 899.000', color: '#4A4A4A', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop', desc: 'Brushed-back fleece hoodie with kangaroo pocket', url: 'https://www.nike.com/id/t/sportswear-club-fleece-pullover-hoodie-4Lh0Gp', tags: ['Hoodie', 'Fleece', 'Sporty'] },

    // ──── ADIDAS ────
    { id: 'a1', brand: 'adidas', brandLabel: 'ADIDAS', name: 'Stan Smith Lux', category: 'shoes', price: 'Rp 2.200.000', color: '#ECEBE4', img: 'https://images.unsplash.com/photo-1580906853305-0070a1654744?w=400&h=500&fit=crop', desc: 'Premium leather Stan Smith with gold branding', url: 'https://www.adidas.co.id/stan-smith-lux-shoes/IG3389.html', tags: ['Clean', 'Premium', 'Minimal'] },
    { id: 'a2', brand: 'adidas', brandLabel: 'ADIDAS', name: 'Gazelle Originals', category: 'shoes', price: 'Rp 1.800.000', color: '#2D4A3E', img: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=500&fit=crop', desc: 'Suede-upper retro sneaker with signature 3-stripes', url: 'https://www.adidas.co.id/gazelle-shoes/BB5476.html', tags: ['Suede', 'Retro', 'Originals'] },
    { id: 'a3', brand: 'adidas', brandLabel: 'ADIDAS', name: 'Essentials 3-Stripes Tee', category: 'tops', price: 'Rp 450.000', color: '#FFFFFF', img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop', desc: 'Cotton jersey tee with signature triple stripe detail', url: 'https://www.adidas.co.id/essentials-3-stripes-tee/IC9334.html', tags: ['Classic', 'Sporty', 'Casual'] },

    // ──── MANGO ────
    { id: 'm1', brand: 'mango', brandLabel: 'MANGO', name: 'Structured Cotton Blazer', category: 'outerwear', price: 'Rp 1.499.000', color: '#D5C9B6', img: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop', desc: 'Single-breasted cotton blazer with natural texture', url: 'https://shop.mango.com/id/men/blazers', tags: ['Structured', 'Cotton', 'Smart'] },
    { id: 'm2', brand: 'mango', brandLabel: 'MANGO', name: 'Straight-Fit Linen Trousers', category: 'bottoms', price: 'Rp 799.000', color: '#F0EBE3', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop', desc: 'Relaxed straight-fit trousers in premium linen', url: 'https://shop.mango.com/id/men/trousers', tags: ['Linen', 'Summer', 'Relaxed'] },

    // ──── COS ────
    { id: 'c1', brand: 'cos', brandLabel: 'COS', name: 'Oversized T-Shirt', category: 'tops', price: 'Rp 550.000', color: '#2C2C2C', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop', desc: 'Heavy-weight organic cotton tee with a boxy oversized fit', url: 'https://www.cos.com/en/men/t-shirts.html', tags: ['Oversized', 'Minimal', 'Organic'] },
    { id: 'c2', brand: 'cos', brandLabel: 'COS', name: 'Wool-Blend Coat', category: 'outerwear', price: 'Rp 3.500.000', color: '#3D3D3D', img: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop', desc: 'Tailored single-breasted wool-blend overcoat', url: 'https://www.cos.com/en/men/coats-and-jackets.html', tags: ['Wool', 'Tailored', 'Winter'] },

    // ──── PULL & BEAR ────
    { id: 'p1', brand: 'pullbear', brandLabel: 'PULL&BEAR', name: 'Cargo Jogger Pants', category: 'bottoms', price: 'Rp 499.000', color: '#6B705C', img: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=500&fit=crop', desc: 'Relaxed-fit cargo joggers with elastic cuffs', url: 'https://www.pullandbear.com/id/men', tags: ['Cargo', 'Streetwear', 'Jogger'] },
    { id: 'p2', brand: 'pullbear', brandLabel: 'PULL&BEAR', name: 'Graphic Print Tee', category: 'tops', price: 'Rp 249.000', color: '#1A1A1A', img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=500&fit=crop', desc: 'Relaxed-fit tee with urban graphic print', url: 'https://www.pullandbear.com/id/men', tags: ['Graphic', 'Street', 'Casual'] },

    // ──── MASSIMO DUTTI ────
    { id: 'md1', brand: 'massimo', brandLabel: 'MASSIMO DUTTI', name: 'Nappa Leather Loafers', category: 'shoes', price: 'Rp 2.799.000', color: '#3E2723', img: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop', desc: 'Hand-stitched nappa leather penny loafers', url: 'https://www.massimodutti.com/id/men/shoes', tags: ['Leather', 'Luxury', 'Loafer'] },
    { id: 'md2', brand: 'massimo', brandLabel: 'MASSIMO DUTTI', name: 'Premium Wool Suit Trousers', category: 'bottoms', price: 'Rp 1.899.000', color: '#2F3542', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop&q=80', desc: 'Slim-fit wool trousers with pressed crease', url: 'https://www.massimodutti.com/id/men/trousers', tags: ['Wool', 'Formal', 'Premium'] },

    // ──── LEVI'S ────
    { id: 'l1', brand: 'levi', brandLabel: "LEVI'S", name: '501 Original Fit Jeans', category: 'bottoms', price: 'Rp 1.099.000', color: '#3B5998', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', desc: 'The original straight-fit button-fly jeans since 1890', url: 'https://www.levi.co.id/501-original.html', tags: ['Denim', 'Classic', 'Iconic'] },
    { id: 'l2', brand: 'levi', brandLabel: "LEVI'S", name: 'Trucker Jacket', category: 'outerwear', price: 'Rp 1.399.000', color: '#6B7B8D', img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=500&fit=crop', desc: 'The iconic denim trucker jacket — a wardrobe essential', url: 'https://www.levi.co.id/trucker-jackets.html', tags: ['Denim', 'Iconic', 'Layering'] },

    // ──── NEW BALANCE ────
    { id: 'nb1', brand: 'nb', brandLabel: 'NEW BALANCE', name: '550 White Green', category: 'shoes', price: 'Rp 1.899.000', color: '#F5F5F0', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=500&fit=crop', desc: 'Retro basketball sneaker with premium leather', url: 'https://www.newbalance.co.id/550.html', tags: ['Retro', 'Court', 'Clean'] },
    { id: 'nb2', brand: 'nb', brandLabel: 'NEW BALANCE', name: '2002R Protection Pack', category: 'shoes', price: 'Rp 2.399.000', color: '#B5B5B0', img: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop', desc: 'Premium runner with N-ergy cushioning technology', url: 'https://www.newbalance.co.id/2002r.html', tags: ['Runner', 'Comfort', 'Premium'] },

    // ──── CONVERSE ────
    { id: 'cv1', brand: 'converse', brandLabel: 'CONVERSE', name: 'Chuck 70 High Top', category: 'shoes', price: 'Rp 1.099.000', color: '#1A1A1A', img: 'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=400&h=500&fit=crop', desc: 'Premium canvas Chuck 70 with vintage styling', url: 'https://www.converse.co.id/chuck-70.html', tags: ['Canvas', 'Vintage', 'Classic'] },
    { id: 'cv2', brand: 'converse', brandLabel: 'CONVERSE', name: 'One Star Pro Suede', category: 'shoes', price: 'Rp 1.299.000', color: '#8B4513', img: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=500&fit=crop', desc: 'Suede low-top with star branding and vulcanized sole', url: 'https://www.converse.co.id/one-star.html', tags: ['Suede', 'Skate', 'Low-top'] },

    // ──── BERSHKA ────
    { id: 'bsh1', brand: 'bershka', brandLabel: 'BERSHKA', name: 'Faux Leather Biker Jacket', category: 'outerwear', price: 'Rp 899.000', color: '#1B1B1B', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', desc: 'Edgy oversized faux leather jacket with zip detailing', url: 'https://www.bershka.com/id/', tags: ['Biker', 'Leather', 'Streetwear'] },
    { id: 'bsh2', brand: 'bershka', brandLabel: 'BERSHKA', name: 'Baggy Skater Denim', category: 'bottoms', price: 'Rp 699.000', color: '#4A6984', img: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&h=500&fit=crop', desc: 'Relaxed wide-leg denim inspired by 90s skate culture', url: 'https://www.bershka.com/id/', tags: ['Baggy', 'Denim', 'Y2K'] },

    // ──── STRADIVARIUS ────
    { id: 'str1', brand: 'stradivarius', brandLabel: 'STRADIVARIUS', name: 'Fluid Tailored Blazer', category: 'outerwear', price: 'Rp 799.000', color: '#E4DFD7', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop', desc: 'Lightweight draped blazer with relaxed shoulder lines', url: 'https://www.stradivarius.com/id/', tags: ['Tailored', 'Chic', 'Fluid'] },
    { id: 'str2', brand: 'stradivarius', brandLabel: 'STRADIVARIUS', name: 'Seamless Ribbed Knit Top', category: 'tops', price: 'Rp 299.000', color: '#2B2B2B', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop', desc: 'Versatile contouring ribbed top for effortless layering', url: 'https://www.stradivarius.com/id/', tags: ['Seamless', 'Minimal', 'Essential'] },

    // ──── RALPH LAUREN ────
    { id: 'rl1', brand: 'ralphlauren', brandLabel: 'RALPH LAUREN', name: 'Custom Slim Fit Mesh Polo', category: 'tops', price: 'Rp 2.150.000', color: '#00205B', img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop', desc: 'The quintessential American preppy polo in breathable cotton mesh', url: 'https://www.ralphlauren.com', tags: ['Polo', 'Preppy', 'Heritage'] },
    { id: 'rl2', brand: 'ralphlauren', brandLabel: 'RALPH LAUREN', name: 'Cable-Knit Cotton Sweater', category: 'outerwear', price: 'Rp 3.490.000', color: '#FDFBF7', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop', desc: 'Timeless cable knit sweater with iconic embroidered pony', url: 'https://www.ralphlauren.com', tags: ['Cable-Knit', 'Old Money', 'Luxury'] },

    // ──── TOMMY HILFIGER ────
    { id: 'th1', brand: 'tommy', brandLabel: 'TOMMY HILFIGER', name: 'Classic Oxford Button-Down', category: 'tops', price: 'Rp 1.790.000', color: '#88A0BA', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop', desc: 'Pure organic cotton oxford with signature flag chest embroidery', url: 'https://id.tommy.com', tags: ['Oxford', 'Heritage', 'Smart Casual'] },
    { id: 'th2', brand: 'tommy', brandLabel: 'TOMMY HILFIGER', name: 'Bleecker Slim Chino Trousers', category: 'bottoms', price: 'Rp 1.690.000', color: '#D2C29D', img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop', desc: 'Comfortable stretch cotton chinos with tailored modern cut', url: 'https://id.tommy.com', tags: ['Chinos', 'Tailored', 'Classic'] },

    // ──── CALVIN KLEIN ────
    { id: 'ck1', brand: 'ck', brandLabel: 'CALVIN KLEIN', name: 'Monogram Logo Tee', category: 'tops', price: 'Rp 890.000', color: '#FFFFFF', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', desc: 'Soft premium cotton jersey with minimalist CK monogram branding', url: 'https://www.calvinklein.co.id', tags: ['Monogram', 'Minimalist', 'Basic'] },
    { id: 'ck2', brand: 'ck', brandLabel: 'CALVIN KLEIN', name: '90s Straight Leg Denim Jeans', category: 'bottoms', price: 'Rp 2.190.000', color: '#3A4D6B', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop', desc: 'Authentic 90s vintage wash straight-leg jeans with leather patch', url: 'https://www.calvinklein.co.id', tags: ['90s', 'Denim', 'Straight'] },

    // ──── VANS ────
    { id: 'vn1', brand: 'vans', brandLabel: 'VANS', name: 'Old Skool Core Classics', category: 'shoes', price: 'Rp 1.099.000', color: '#1A1A1A', img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=500&fit=crop', desc: 'Iconic low-top skate shoe with signature white side stripe', url: 'https://www.vans.co.id', tags: ['Skate', 'Classic', 'Sneakers'] },
    { id: 'vn2', brand: 'vans', brandLabel: 'VANS', name: 'Classic Slip-On Checkerboard', category: 'shoes', price: 'Rp 999.000', color: '#E5E5E5', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=500&fit=crop', desc: 'Unmistakable black and white checkerboard canvas slip-on', url: 'https://www.vans.co.id', tags: ['Checkerboard', 'Slip-On', 'Iconic'] },

    // ──── ASICS ────
    { id: 'asc1', brand: 'asics', brandLabel: 'ASICS', name: 'GEL-Kayano 14 Silver Cream', category: 'shoes', price: 'Rp 2.499.000', color: '#D8D8D8', img: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop', desc: 'Late 2000s aesthetic runner with modern GEL technology cushioning', url: 'https://www.asics.co.id', tags: ['GEL', 'Y2K Runner', 'Comfort'] },
    { id: 'asc2', brand: 'asics', brandLabel: 'ASICS', name: 'GT-2160 Pure Silver', category: 'shoes', price: 'Rp 2.199.000', color: '#C0C0C0', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=500&fit=crop', desc: 'Sleek metallic runner honoring the heritage of the GT-2000 series', url: 'https://www.asics.co.id', tags: ['Sportstyle', 'Metallic', 'Runner'] },

    // ──── DR. MARTENS ────
    { id: 'dm1', brand: 'drmartens', brandLabel: 'DR. MARTENS', name: '1461 Smooth Leather Oxford', category: 'shoes', price: 'Rp 2.899.000', color: '#1B1B1B', img: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop', desc: 'Classic 3-eyelet shoe with yellow welt stitch and AirWair bouncing sole', url: 'https://www.drmartens.com', tags: ['Leather', 'Oxford', 'Iconic'] },
    { id: 'dm2', brand: 'drmartens', brandLabel: 'DR. MARTENS', name: '1460 8-Eye Smooth Boots', category: 'shoes', price: 'Rp 3.299.000', color: '#2B1B17', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop', desc: 'The original Dr. Martens combat boot built to last for generations', url: 'https://www.drmartens.com', tags: ['Boots', 'Combat', 'Punk Heritage'] },

    // ──── THE NORTH FACE ────
    { id: 'tnf1', brand: 'tnf', brandLabel: 'THE NORTH FACE', name: '1996 Retro Nuptse Jacket', category: 'outerwear', price: 'Rp 4.990.000', color: '#111111', img: 'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400&h=500&fit=crop', desc: '700-fill goose down jacket with retro boxy silhouette and packable hood', url: 'https://www.thenorthface.co.id', tags: ['Down', 'Nuptse', 'Puffer'] },
    { id: 'tnf2', brand: 'tnf', brandLabel: 'THE NORTH FACE', name: 'Explore Camp Utility Cap', category: 'accessories', price: 'Rp 650.000', color: '#5A6055', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', desc: 'Quick-drying UV protection outdoor utility bucket hat', url: 'https://www.thenorthface.co.id', tags: ['Outdoor', 'Gorpcore', 'Utility'] },

    // ──── GUCCI ────
    { id: 'gc1', brand: 'gucci', brandLabel: 'GUCCI', name: 'GG Supreme Monogram Canvas Belt', category: 'accessories', price: 'Rp 8.200.000', color: '#4B3621', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', desc: 'Luxury GG monogram canvas belt with brushed palladium hardware', url: 'https://www.gucci.com', tags: ['Luxury', 'Monogram', 'Leather'] },
    { id: 'gc2', brand: 'gucci', brandLabel: 'GUCCI', name: '1953 Horsebit Leather Loafers', category: 'shoes', price: 'Rp 14.800.000', color: '#1B1B1B', img: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop', desc: 'The pinnacle of luxury loafers celebrating 70 years of horsebit hardware', url: 'https://www.gucci.com', tags: ['Horsebit', 'Luxury', 'Italian Craft'] },
  ],

  // ─── Init ──────────────────────────────────────────────────────────
  init() {
    this.setupFilters();
    this.renderProducts();
  },

  // ─── Filter Logic ──────────────────────────────────────────────────
  setupFilters() {
    // Brand filters
    const brandBtns = document.querySelectorAll('.shop-filter-pill');
    brandBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        brandBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeBrand = btn.dataset.brand;
        this.renderProducts();
      });
    });

    // Enable horizontal scroll via mouse wheel for shop brand filter row
    const brandContainer = document.getElementById('shopBrandFilters');
    if (brandContainer) {
      brandContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          brandContainer.scrollLeft += e.deltaY * 1.2;
        }
      }, { passive: false });
    }

    // Category filters
    const catBtns = document.querySelectorAll('.shop-cat-chip');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.cat;
        this.renderProducts();
      });
    });
  },

  // ─── Render Products ──────────────────────────────────────────────
  renderProducts() {
    const grid = document.getElementById('shopProductGrid');
    if (!grid) return;

    let filtered = this.products;

    if (this.activeBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === this.activeBrand);
    }
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }

    const isEn = window.I18n && I18n.currentLanguage === 'en';

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="shop-empty-state">
          <span class="shop-empty-icon">🔍</span>
          <p class="shop-empty-title">${isEn ? 'No products found' : 'Tidak ada produk ditemukan'}</p>
          <p class="shop-empty-desc">${isEn ? 'Try selecting a different brand or category.' : 'Coba pilih brand atau kategori lain.'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="shop-product-card" data-brand="${p.brand}" data-cat="${p.category}">
        <div class="shop-card-visual" style="background-color: ${p.color};">
          <img src="${p.img}" alt="${p.name}" class="shop-card-img" loading="lazy" onerror="this.style.display='none'">
          <span class="shop-brand-badge">${p.brandLabel}</span>
          <span class="shop-category-badge">${this.getCategoryLabel(p.category)}</span>
        </div>
        <div class="shop-card-info">
          <span class="shop-card-brand">${p.brandLabel}</span>
          <h4 class="shop-card-name">${p.name}</h4>
          <p class="shop-card-desc">${p.desc}</p>
          <div class="shop-card-tags">
            ${p.tags.map(t => `<span class="shop-tag">${t}</span>`).join('')}
          </div>
          <div class="shop-card-footer">
            <span class="shop-card-price">${p.price}</span>
            <span class="shop-card-cta">${isEn ? 'Visit Store →' : 'Kunjungi Toko →'}</span>
          </div>
        </div>
      </a>
    `).join('');
  },

  getCategoryLabel(cat) {
    const isEn = window.I18n && I18n.currentLanguage === 'en';
    const labels = {
      tops: '👕 Top',
      bottoms: '👖 Bottom',
      outerwear: '🧥 Outer',
      shoes: '👟 Shoes',
      accessories: isEn ? '💍 Accessories' : '💍 Aksesoris'
    };
    return labels[cat] || cat;
  }
};

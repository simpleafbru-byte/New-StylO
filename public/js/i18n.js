/**
 * StylO — Internationalization (i18n) Engine
 * Manages active language (id / en), translations, and DOM updates.
 */
const I18n = {
  currentLanguage: 'id',
  listeners: [],

  translations: {
    id: {
      // Navbar
      'nav.home': 'Home',
      'nav.studio': 'Studio AI',
      'nav.wardrobe': 'Lemari',
      'nav.shop': 'Shop',
      'nav.puzzle': 'Puzzle',
      'nav.history': 'Riwayat',
      'nav.profile': 'Profil',
      'nav.stores': 'Toko Terdekat',
      'nav.action': 'Racik Outfit',
      'nav.weather_title': 'Prakiraan Cuaca Hari Ini (Klik untuk rincian)',
      'nav.lang_toggle_title': 'Ganti Bahasa (Switch to English)',

      // Hero
      'hero.badge': '✨ Powered by Gemini 3.5 Flash',
      'hero.headline': 'Dress with ease.',
      'hero.description': 'Desain gaya lebih cerdas bersama AI yang memahami Anda.<br>Tampil memukau tanpa rasa cemas.',
      'hero.cta': 'Mulai Sekarang →',
      'hero.scroll': 'GULIR KE BAWAH ↓',

      // Marquee
      'marquee.effortless': 'EFFORTLESS CHIC',
      'marquee.body_ai': 'PERSONAL PROPORTION AI',
      'marquee.harmony': 'WARDROBE HARMONY',
      'marquee.multimodal': 'GEMINI MULTIMODAL AI',
      'marquee.undertone': 'UNDERTONE COLOR ANALYSIS',
      'marquee.silhouettes': 'TIMELESS SILHOUETTES',
      'marquee.curation': 'SMART CURATION',
      'marquee.daily_inspo': 'DAILY OUTFIT INSPIRATION',

      // Workspace Tab Capsule
      'tab.studio': '✨ Studio Stylist',
      'tab.wardrobe': '👗 Lemari Digital',
      'tab.history': '🤍 Riwayat & Favorit',
      'tab.shop': '🛍️ Shop',
      'tab.profile': '⚙️ Profil Gaya',

      // Weather Banner
      'weather.your_loc': 'Lokasi Anda:',
      'weather.detecting': 'Mendeteksi Lokasi...',
      'weather.refresh_gps': 'Perbarui Lokasi',
      'weather.feels_like': 'Terasa Seperti',
      'weather.humidity': 'Kelembaban',
      'weather.wind_speed': 'Kecepatan Angin',
      'weather.guide_tag': '👗 Panduan Busana Hari Ini',
      'weather.btn_racik': '⚡ Racik Outfit Sesuai Cuaca Hari Ini',
      'weather.btn_apply': '✨ Terapkan ke Form',
      'weather.btn_chat': '💬 Tanya Stylist AI di Chat',
      'weather.timeline_morning': 'Pagi',
      'weather.timeline_afternoon': 'Siang',
      'weather.timeline_evening': 'Sore',
      'weather.timeline_night': 'Malam',

      // Studio Modes
      'mode.form': 'Form Cepat',
      'mode.see_something': '👀 See Something I Like',
      'mode.photo': '📸 Analisis Proporsi',
      'mode.chat': '🎙️ Voice & Chat Stylist',

      // Form Cepat
      'form.occasion_label': 'Acara atau Momen',
      'form.chip_interview': 'Interview Kerja',
      'form.chip_date': 'Kencan Cafe',
      'form.chip_wedding': 'Kondangan',
      'form.chip_casual': 'Casual Weekend',
      'form.chip_campus': 'Kampus',
      'form.chip_travel': 'Traveling',
      'form.occasion_placeholder': 'Tuliskan acara...',
      'form.weather_label': 'Cuaca',
      'form.vibe_label': 'Vibe Gaya',
      'form.pair_wardrobe': 'Padukan pakaian dari lemariku',
      'form.items_available': 'item tersedia',
      'form.notes_label': 'Catatan Tambahan (Opsional)',
      'form.notes_placeholder': 'Contoh: Saya ingin terlihat ramping, lebih suka celana daripada rok, hindari warna mencolok.',
      'form.submit_btn': '✨ Racik Outfit dengan AI',

      // See Something I Like (Inspo Recreator)
      'inspo.intro_title': 'Lihat Outfit Keren di Luar?',
      'inspo.intro_desc': 'Foto seseorang yang berpakaian keren (di jalan, Pinterest, atau Instagram). AI akan mendeteksi gayanya, memeriksa apa yang kamu miliki di lemarimu, dan <strong>meracik replika terbaik dari pakaianmu sendiri</strong>!',
      'inspo.presets_label': '⚡ Coba Cepat dengan Contoh Inspirasi:',
      'inspo.upload_label': 'Atau Unggah / Foto Outfit yang Kamu Suka',
      'inspo.dropzone_title': 'Ambil foto atau seret gambar outfit ke sini',
      'inspo.dropzone_sub': 'Foto seseorang atau OOTD inspirasi (JPG, PNG, WebP)',
      'inspo.choose_btn': 'Pilih Foto Inspirasi',
      'inspo.ready_badge': '✨ Siap Direka Ulang',
      'inspo.change_btn': 'Ganti Foto',
      'inspo.notes_placeholder': 'Misal: Saya ingin versi yang lebih santai untuk nongkrong di cafe',
      'inspo.closet_title': 'Pencocokan Otomatis Koleksi Lemarimu',
      'inspo.closet_desc': 'AI akan memindai pakaian di lemarimu untuk menemukan potongan yang paling identik.',
      'inspo.submit_btn': '✨ Deteksi Gaya & Recreate Dari Lemariku',
      'inspo.style_detected': 'Gaya terdeteksi:',
      'inspo.closet_match': 'Pencocokan Lemari',
      'inspo.closest_match': 'Paling Mendekati Dari Lemarimu:',
      'inspo.closest_desc': 'Berikut adalah padanan pakaian yang sudah kamu miliki di lemari untuk mereplikasi gaya ini semirip mungkin hari ini.',

      // Photo Matcher (Analisis Proporsi)
      'photo.upload_label': 'Unggah Foto Selfie atau Seluruh Tubuh',
      'photo.dropzone_title': 'Klik atau seret foto ke sini',
      'photo.dropzone_sub': 'Foto wajah selfie atau seluruh badan (JPG, PNG, WebP)',
      'photo.choose_btn': 'Pilih Foto',
      'photo.ready_badge': '✨ Siap Dianalisis',
      'photo.change_btn': 'Ganti Foto',
      'photo.occasion_label': 'Tujuan Acara / Konteks Tampilan',
      'photo.occasion_placeholder': 'Contoh: Kencan Cafe, Interview Kerja, atau Kondangan',
      'photo.cuaca_label': 'Cuaca',
      'photo.vibe_label': 'Karakter Gaya',
      'photo.closet_title': 'Pencocokan Otomatis Lemari Pakaian',
      'photo.closet_desc': 'AI akan mencocokkan foto fisik Anda dengan pakaian yang sudah tersimpan di lemarimu.',
      'photo.notes_label': 'Catatan Tambahan (Opsional)',
      'photo.notes_placeholder': 'Contoh: Ingin menyamarkan bagian perut dan menonjolkan kaki jenjang.',
      'photo.submit_btn': '✨ Analisis Foto & Cocokkan Outfit Lemari',
      'photo.eval_title': '📸 Evaluasi Foto & Proporsi Tubuh',
      'photo.silhouette_prop': '📏 Proporsi Siluet',
      'photo.undertone_skin': '🎨 Rona Kulit & Undertone',

      // Chat Stylist
      'chat.ready_status': 'Voice Assistant Ready',
      'chat.voice_on': 'Voice: ON',
      'chat.voice_off': 'Voice: OFF',
      'chat.reset': 'Reset',
      'chat.ai_author': 'Personal Stylist AI',
      'chat.welcome_msg': 'Halo! Saya asisten stylist pribadimu. Kamu bisa berbicara langsung menggunakan suara atau mengetik. Ceritakan rencana acaramu hari ini!',
      'chat.listening': 'Mendengarkan suara Anda... Silakan berbicara',
      'chat.input_field_placeholder': 'Ketik pesan atau tekan 🎙️ untuk berbicara...',

      // Visual Outfit Lookbook Board
      'outfit.loading_title': 'Menyusun Padu Padan Busana...',
      'outfit.loading_sub': 'Menganalisis harmoni warna, siluet, dan konteks acara Anda.',
      'outfit.fav_title': 'Simpan ke Favorit',
      'outfit.copy_title': 'Salin Ringkasan',
      'outfit.color_harmony': 'Harmoni Warna:',
      'outfit.top': 'Atasan (Top)',
      'outfit.outerwear': 'Outerwear / Layering',
      'outfit.bottom': 'Bawahan (Bottom)',
      'outfit.shoes': 'Alas Kaki (Footwear)',
      'outfit.accessories': 'Aksesori & Aksen',
      'outfit.opinion_title': 'Opini & Alasan Stylist',
      'outfit.tips_title': 'Tips Styling Pro',
      'outfit.variation_btn': 'Variasi Gaya Lain',
      'outfit.refine_chat_btn': 'Revisi Lewat Chat',
      'outfit.shopping_kicker': 'Kapsul Belanja Pelengkap Lemari',
      'outfit.shopping_missing': 'Outfit Anda kurang:',
      'outfit.shopping_btn': 'Rekomendasi Belanja',
      'outfit.curated_title': 'Item Serupa & Terkurasi',
      'outfit.curated_sub': 'Pilihan siap pakai yang cocok dengan toko lokal terdekat',

      // Wardrobe Section
      'wardrobe.pretitle': 'Koleksi Pakaian',
      'wardrobe.title': 'Lemari Digital Anda',
      'wardrobe.desc': 'Pakaian yang Anda miliki. AI memprioritaskan item ini saat menyusun padu padan.',
      'wardrobe.btn_gaps': '🛍️ Missing Pieces Lemari',
      'wardrobe.btn_add': '+ Tambah Pakaian',
      'wardrobe.gaps_kicker': 'Analisis Kapsul Lemari',
      'wardrobe.gaps_title': 'Potongan Kunci yang Belum Anda Miliki',
      'wardrobe.gaps_desc': 'Item berikut paling banyak membuka kombinasi padu padan baru dengan pakaian yang sudah Anda miliki.',
      'wardrobe.btn_refresh_gaps': 'Refresh Missing Pieces',
      'wardrobe.filter_all': 'Semua',
      'wardrobe.filter_tops': 'Atasan',
      'wardrobe.filter_outer': 'Outerwear',
      'wardrobe.filter_bottoms': 'Bawahan',
      'wardrobe.filter_shoes': 'Sepatu',
      'wardrobe.filter_accessories': 'Aksesori',
      'wardrobe.empty_title': 'Belum ada pakaian di kategori ini',
      'wardrobe.empty_desc': 'Klik "+ Tambah Pakaian" untuk menambahkan koleksi baru ke lemari digital Anda.',

      // History Section
      'history.pretitle': 'Lookbook Arsip',
      'history.title': 'Riwayat Rekomendasi',
      'history.desc': 'Koleksi inspirasi padu padan outfit yang pernah diracik oleh AI Stylist.',
      'history.toggle_all': 'Semua Look',
      'history.toggle_favs': '❤️ Hanya Favorit',
      'history.btn_clear_all': 'Hapus Semua',
      'history.view_in_studio': 'Lihat di Studio',
      'history.empty_favs': 'Belum ada rekomendasi yang difavoritkan.',
      'history.empty_all': 'Belum ada riwayat rekomendasi.',
      'history.empty_sub': 'Kembali ke Studio Stylist untuk mulai meracik tampilan Anda!',

      // Shop Section
      'shop.pretitle': 'Belanja Langsung',
      'shop.title': 'Fashion Market',
      'shop.desc': 'Koleksi terkurasi dari brand fashion ternama. Klik produk untuk langsung menuju toko resmi.',
      'shop.brand_all': '✦ Semua Brand',
      'shop.cat_all': 'Semua',
      'shop.cat_tops': 'Atasan',
      'shop.cat_bottoms': 'Bawahan',
      'shop.cat_outerwear': 'Outerwear',
      'shop.cat_shoes': 'Sepatu',
      'shop.cat_accessories': 'Aksesori',

      // Profile Section
      'profile.pretitle': 'Personalisasi Fisik & Selera',
      'profile.title': 'Profil & Data Tubuh',
      'profile.desc': 'Bantu AI memahami ukuran fisik, bentuk tubuh, dan preferensi estetika Anda.',
      'profile.name_label': 'Nama Panggilan',
      'profile.gender_label': 'Jenis Kelamin / Gender',
      'profile.gender_female': 'Wanita (Female)',
      'profile.gender_male': 'Pria (Male)',
      'profile.physical_divider': '📏 Informasi Fisik & Ukuran Tubuh',
      'profile.physical_sub': 'Digunakan AI untuk merekomendasikan siluet & potongan busana proporsional',
      'profile.height_label': 'Tinggi Badan (cm)',
      'profile.weight_label': 'Berat Badan (kg)',
      'profile.body_shape_label': 'Bentuk Tubuh (Body Shape)',
      'profile.size_label': 'Ukuran Pakaian Biasa',
      'profile.proportions_notes': 'Catatan Proporsi & Fit Khusus (Opsional)',
      'profile.proportions_placeholder': 'Misal: Kaki jenjang torso pendek, ingin celana high-waist',
      'profile.style_palette_divider': '🎨 Preferensi Gaya & Palet',
      'profile.fav_styles': 'Gaya Berpakaian Favorit',
      'profile.fav_colors': 'Palet Warna Favorit',
      'profile.budget_label': 'Tingkat Budget',
      'profile.budget_affordable': 'Terjangkau (Thrift / Lokal)',
      'profile.budget_mid': 'Menengah (Brand Populer)',
      'profile.budget_premium': 'Premium & Designer',
      'profile.fit_label': 'Preferensi Potongan',
      'profile.fit_slim': 'Slim Fit',
      'profile.fit_regular': 'Regular Fit Seimbang',
      'profile.fit_oversized': 'Oversized / Relaxed',
      'profile.lang_label': '🌐 Preferensi Bahasa / Language',
      'profile.lang_id': '🇮🇩 Bahasa Indonesia',
      'profile.lang_en': '🇬🇧 English',
      'profile.btn_save': 'Simpan Profil & Sinkron AI',
      'profile.saved_status': '✓ Profil & Preferensi berhasil disimpan!',
      'profile.intel_badge': 'Tersinkron dengan Chat Stylist AI',
      'profile.intel_title': 'Ringkasan Proporsi Tubuh',
      'profile.intel_desc': 'Informasi yang dipelajari dan dianalisis AI Stylist saat meracik padu padan & memberikan saran.',
      'profile.stat_height': 'Tinggi Badan',
      'profile.stat_weight': 'Berat Badan',
      'profile.stat_shape': 'Bentuk Tubuh',
      'profile.stat_size': 'Ukuran Busana',
      'profile.note_focus': 'Fokus Proporsi Anda:',
      'profile.silhouette_rec_title': 'Rekomendasi Siluet AI untuk Postur Anda',
      'profile.consult_title': 'Tanya Tips Stylist untuk Tubuh Anda',
      'profile.consult_desc': 'Pilih pertanyaan cepat di bawah. AI Chat Stylist akan langsung membaca profil tubuh Anda dan memberikan saran eksklusif:',
      'profile.btn_open_chat': 'Konsultasikan dengan Chat Stylist →',

      // Stores Section
      'stores.pretitle': 'Eksplorasi Offline',
      'stores.title': 'Toko Pakaian Terdekat',
      'stores.desc': 'Temukan butik desainer, toko retail fashion, dan thrift shop di sekitar lokasimu untuk melengkapi padu padan outfit.',
      'stores.status_locating': '📍 Menemukan koordinat lokasi Anda...',
      'stores.btn_detect': 'Deteksi Lokasi GPS',
      'stores.filter_all': 'Semua Toko',
      'stores.filter_mall': 'Mall & Brand Populer',
      'stores.filter_thrift': 'Thrift & Vintage',
      'stores.filter_boutique': 'Butik Desainer Lokal',
      'stores.filter_tailor': 'Tailor & Jahit',
      'stores.search_placeholder': 'Cari nama toko, mall, atau kawasan...',
      'stores.sidebar_title': 'Rekomendasi Terpilih',
      'stores.sidebar_sub': 'Klik untuk melihat lokasi di peta',
      'stores.open_maps': 'Buka di Google Maps ↗',

      // Footer
      'footer.tagline': 'Dress with ease. Style with intelligence.',
      'footer.quote': 'Desain gaya lebih cerdas bersama AI personal yang memahami siluet dan lemari pakaian Anda.',
      'footer.nav_title': 'Navigasi Cepat:',
      'footer.feature1_title': 'Kalibrasi Proporsi AI',
      'footer.feature1_desc': 'Analisis siluet tubuh untuk paduan busana yang proporsional.',
      'footer.feature2_title': 'Harmoni Warna & Rona',
      'footer.feature2_desc': 'Pencocokan kontras warna undertone yang mengangkat pesona alami.',
      'footer.feature3_title': 'Rekomendasi Belanja Cerdas',
      'footer.feature3_desc': 'Temukan item yang melengkapi lemari pakaian Anda berdasarkan AI.',
      'footer.feature4_title': 'Adaptasi Cuaca Cerdas',
      'footer.feature4_desc': 'Rekomendasi real-time berdasarkan suhu dan kondisi atmosfer hari ini.',
      'footer.system_ready': 'Sistem Gemini 3.5 Flash Aktif',
      'footer.local_privacy': '🔒 Privasi Data & Penyimpanan Lokal Aman',
      'footer.back_to_top': 'Kembali ke Atas',
      'footer.copyright': '© 2026 StylO • Padu Padan AI. Hak cipta dilindungi.',

      // Modals & General
      'modal.add_title': 'Tambah Pakaian Baru',
      'modal.name_label': 'Nama Pakaian',
      'modal.name_placeholder': 'Contoh: Kemeja Linen Putih Kerah Shanghai',
      'modal.cat_label': 'Kategori',
      'modal.cat_top': 'Atasan (Top)',
      'modal.cat_outer': 'Outerwear (Blazer/Jaket)',
      'modal.cat_bottom': 'Bawahan (Pants/Skirt)',
      'modal.cat_shoes': 'Alas Kaki (Shoes/Sneakers)',
      'modal.cat_acc': 'Aksesori / Tas',
      'modal.color_label': 'Warna Utama',
      'modal.color_placeholder': 'Misal: Putih Bersih, Hitam, Sage',
      'modal.tag_label': 'Tag Gaya (Pisahkan dengan koma)',
      'modal.tag_placeholder': 'Misal: formal, casual, adem, linen',
      'modal.notes_label': 'Catatan Tambahan',
      'modal.notes_placeholder': 'Misal: Bahan katun adem, pas untuk cuaca panas',
      'modal.btn_cancel': 'Batal',
      'modal.btn_save': 'Simpan Pakaian',
      'confirm.default_title': 'Konfirmasi Hapus',
      'confirm.default_msg': 'Apakah Anda yakin ingin menghapus item ini?',
      'confirm.btn_cancel': 'Batal',
      'confirm.btn_delete': 'Hapus',
      'toast.profile_saved': 'Data proporsi tubuh & preferensi gaya berhasil disimpan ke AI! ✨',
      'toast.lang_switched': 'Bahasa berhasil diubah ke Bahasa Indonesia 🇮🇩'
    },

    en: {
      // Navbar
      'nav.home': 'Home',
      'nav.studio': 'AI Studio',
      'nav.wardrobe': 'Wardrobe',
      'nav.shop': 'Shop',
      'nav.puzzle': 'Puzzle',
      'nav.history': 'History',
      'nav.profile': 'Profile',
      'nav.stores': 'Nearby Stores',
      'nav.action': 'Mix Outfit',
      'nav.weather_title': "Today's Weather Forecast (Click for details)",
      'nav.lang_toggle_title': 'Switch Language (Ganti ke Bahasa Indonesia)',

      // Hero
      'hero.badge': '✨ Powered by Gemini 3.5 Flash',
      'hero.headline': 'Dress with ease.',
      'hero.description': 'Design smarter with personal AI that understands your silhouette.<br>Step out confident without the guesswork.',
      'hero.cta': 'Get Started →',
      'hero.scroll': 'SCROLL DOWN ↓',

      // Marquee
      'marquee.effortless': 'EFFORTLESS CHIC',
      'marquee.body_ai': 'PERSONAL PROPORTION AI',
      'marquee.harmony': 'WARDROBE HARMONY',
      'marquee.multimodal': 'GEMINI MULTIMODAL AI',
      'marquee.undertone': 'UNDERTONE COLOR ANALYSIS',
      'marquee.silhouettes': 'TIMELESS SILHOUETTES',
      'marquee.curation': 'SMART CURATION',
      'marquee.daily_inspo': 'DAILY OUTFIT INSPIRATION',

      // Workspace Tab Capsule
      'tab.studio': '✨ Styling Studio',
      'tab.wardrobe': '👗 Digital Wardrobe',
      'tab.history': '🤍 History & Favorites',
      'tab.shop': '🛍️ Shop Market',
      'tab.profile': '⚙️ Style Profile',

      // Weather Banner
      'weather.your_loc': 'Your Location:',
      'weather.detecting': 'Locating your city...',
      'weather.refresh_gps': 'Update Location',
      'weather.feels_like': 'Feels Like',
      'weather.humidity': 'Humidity',
      'weather.wind_speed': 'Wind Speed',
      'weather.guide_tag': "👗 Today's Dressing Guide",
      'weather.btn_racik': "⚡ Mix Outfit for Today's Weather",
      'weather.btn_apply': '✨ Apply to Form',
      'weather.btn_chat': '💬 Ask Stylist AI in Chat',
      'weather.timeline_morning': 'Morning',
      'weather.timeline_afternoon': 'Afternoon',
      'weather.timeline_evening': 'Evening',
      'weather.timeline_night': 'Night',

      // Studio Modes
      'mode.form': 'Quick Form',
      'mode.see_something': '👀 See Something I Like',
      'mode.photo': '📸 Silhouette Analysis',
      'mode.chat': '🎙️ Voice & Chat Stylist',

      // Form Cepat
      'form.occasion_label': 'Occasion or Event',
      'form.chip_interview': 'Job Interview',
      'form.chip_date': 'Cafe Date',
      'form.chip_wedding': 'Wedding / Party',
      'form.chip_casual': 'Casual Weekend',
      'form.chip_campus': 'Campus',
      'form.chip_travel': 'Traveling',
      'form.occasion_placeholder': 'Describe your occasion...',
      'form.weather_label': 'Weather',
      'form.vibe_label': 'Style Vibe',
      'form.pair_wardrobe': 'Pair items from my closet',
      'form.items_available': 'items available',
      'form.notes_label': 'Additional Notes (Optional)',
      'form.notes_placeholder': 'e.g., Prefer relaxed pants over skirts, want to elongate legs, avoid neon colors.',
      'form.submit_btn': '✨ Mix Outfit with AI',

      // See Something I Like (Inspo Recreator)
      'inspo.intro_title': 'See a Great Outfit Somewhere?',
      'inspo.intro_desc': 'Snap a photo of someone wearing great style (on the street, Pinterest, or Instagram). AI detects the vibe, checks what is inside your closet, and <strong>recreates the best look from your own clothes</strong>!',
      'inspo.presets_label': '⚡ Quick Test with Inspiration Presets:',
      'inspo.upload_label': 'Or Upload / Snap an Outfit You Like',
      'inspo.dropzone_title': 'Snap a photo or drag outfit image here',
      'inspo.dropzone_sub': 'Photo of someone or OOTD inspo (JPG, PNG, WebP)',
      'inspo.choose_btn': 'Choose Inspo Photo',
      'inspo.ready_badge': '✨ Ready to Recreate',
      'inspo.change_btn': 'Change Photo',
      'inspo.notes_placeholder': 'e.g., I want a more relaxed version for a casual coffee hangout',
      'inspo.closet_title': 'Automatic Closet Matching',
      'inspo.closet_desc': 'AI will scan your wardrobe items to find the most matching identical pieces.',
      'inspo.submit_btn': '✨ Detect Style & Recreate From Closet',
      'inspo.style_detected': 'Style detected:',
      'inspo.closet_match': 'Closet Match',
      'inspo.closest_match': 'Closest Match From Your Closet:',
      'inspo.closest_desc': 'Here are pieces you already own in your digital closet to replicate this look effortlessly today.',

      // Photo Matcher (Analisis Proporsi)
      'photo.upload_label': 'Upload Full-Body or Selfie Photo',
      'photo.dropzone_title': 'Click or drag your photo here',
      'photo.dropzone_sub': 'Selfie or full-body picture (JPG, PNG, WebP)',
      'photo.choose_btn': 'Choose Photo',
      'photo.ready_badge': '✨ Ready for Analysis',
      'photo.change_btn': 'Change Photo',
      'photo.occasion_label': 'Target Occasion / Event Context',
      'photo.occasion_placeholder': 'e.g., Casual Cafe Date, Tech Interview, or Wedding',
      'photo.cuaca_label': 'Weather',
      'photo.vibe_label': 'Style Vibe',
      'photo.closet_title': 'Automatic Wardrobe Matching',
      'photo.closet_desc': 'AI will match your physical photo with clothing saved in your digital closet.',
      'photo.notes_label': 'Additional Notes (Optional)',
      'photo.notes_placeholder': 'e.g., Elongate leg lines, balance torso, flatter waistline.',
      'photo.submit_btn': '✨ Analyze Photo & Match Closet Outfits',
      'photo.eval_title': '📸 Photo Evaluation & Body Proportions',
      'photo.silhouette_prop': '📏 Silhouette Proportions',
      'photo.undertone_skin': '🎨 Skin Undertone & Color Harmony',

      // Chat Stylist
      'chat.ready_status': 'Voice Assistant Ready',
      'chat.voice_on': 'Voice: ON',
      'chat.voice_off': 'Voice: OFF',
      'chat.reset': 'Reset',
      'chat.ai_author': 'Personal Stylist AI',
      'chat.welcome_msg': 'Hello! I am your personal AI stylist. You can speak directly with voice or type. What are your outfit plans for today?',
      'chat.listening': 'Listening to your voice... Speak now',
      'chat.input_field_placeholder': 'Type a message or press 🎙️ to talk...',

      // Visual Outfit Lookbook Board
      'outfit.loading_title': 'Curating Outfit Combination...',
      'outfit.loading_sub': 'Analyzing color harmony, silhouettes, and event context.',
      'outfit.fav_title': 'Save to Favorites',
      'outfit.copy_title': 'Copy Summary',
      'outfit.color_harmony': 'Color Harmony:',
      'outfit.top': 'Top (Atasan)',
      'outfit.outerwear': 'Outerwear / Layering',
      'outfit.bottom': 'Bottom (Bawahan)',
      'outfit.shoes': 'Footwear (Alas Kaki)',
      'outfit.accessories': 'Accessories & Accents',
      'outfit.opinion_title': 'Stylist Rationale & Opinion',
      'outfit.tips_title': 'Pro Styling Tips',
      'outfit.variation_btn': 'Other Style Variations',
      'outfit.refine_chat_btn': 'Refine in Chat',
      'outfit.shopping_kicker': 'Capsule Wardrobe Gap Shopping',
      'outfit.shopping_missing': 'Your outfit is missing:',
      'outfit.shopping_btn': 'Shopping Picks',
      'outfit.curated_title': 'Similar & Curated Items',
      'outfit.curated_sub': 'Ready-to-wear options matching nearby official stores',

      // Wardrobe Section
      'wardrobe.pretitle': 'Garment Collection',
      'wardrobe.title': 'Your Digital Wardrobe',
      'wardrobe.desc': 'Clothes you own. AI prioritizes these items when curating outfits.',
      'wardrobe.btn_gaps': '🛍️ Missing Pieces',
      'wardrobe.btn_add': '+ Add Garment',
      'wardrobe.gaps_kicker': 'Capsule Wardrobe Analysis',
      'wardrobe.gaps_title': 'Key Pieces Missing From Your Closet',
      'wardrobe.gaps_desc': 'These items unlock the highest number of new outfit combinations with your existing clothing.',
      'wardrobe.btn_refresh_gaps': 'Refresh Missing Pieces',
      'wardrobe.filter_all': 'All',
      'wardrobe.filter_tops': 'Tops',
      'wardrobe.filter_outer': 'Outerwear',
      'wardrobe.filter_bottoms': 'Bottoms',
      'wardrobe.filter_shoes': 'Shoes',
      'wardrobe.filter_accessories': 'Accessories',
      'wardrobe.empty_title': 'No garments in this category yet',
      'wardrobe.empty_desc': 'Click "+ Add Garment" to add a new piece to your digital closet.',

      // History Section
      'history.pretitle': 'Lookbook Archive',
      'history.title': 'Recommendation History',
      'history.desc': 'Collection of outfit inspirations crafted by your personal AI Stylist.',
      'history.toggle_all': 'All Looks',
      'history.toggle_favs': '❤️ Favorites Only',
      'history.btn_clear_all': 'Clear All',
      'history.view_in_studio': 'View in Studio',
      'history.empty_favs': 'No favorite recommendations yet.',
      'history.empty_all': 'No recommendation history yet.',
      'history.empty_sub': 'Head back to the Styling Studio to start creating your looks!',

      // Shop Section
      'shop.pretitle': 'Direct Shopping',
      'shop.title': 'Fashion Market',
      'shop.desc': 'Curated collections from premier fashion brands. Click any item to visit the official store.',
      'shop.brand_all': '✦ All Brands',
      'shop.cat_all': 'All',
      'shop.cat_tops': 'Tops',
      'shop.cat_bottoms': 'Bottoms',
      'shop.cat_outerwear': 'Outerwear',
      'shop.cat_shoes': 'Shoes',
      'shop.cat_accessories': 'Accessories',

      // Profile Section
      'profile.pretitle': 'Physical & Taste Personalization',
      'profile.title': 'Profile & Body Data',
      'profile.desc': 'Help AI understand your physical metrics, silhouette, and aesthetic preferences.',
      'profile.name_label': 'Nickname / Display Name',
      'profile.gender_label': 'Gender',
      'profile.gender_female': 'Female',
      'profile.gender_male': 'Male',
      'profile.physical_divider': '📏 Physical Info & Measurements',
      'profile.physical_sub': 'Used by AI to recommend proportional silhouettes and flattering cuts',
      'profile.height_label': 'Height (cm)',
      'profile.weight_label': 'Weight (kg)',
      'profile.body_shape_label': 'Body Shape',
      'profile.size_label': 'Standard Clothing Size',
      'profile.proportions_notes': 'Proportion & Fit Notes (Optional)',
      'profile.proportions_placeholder': 'e.g., Long legs short torso, high-waist preference',
      'profile.style_palette_divider': '🎨 Style Preferences & Palette',
      'profile.fav_styles': 'Favorite Clothing Styles',
      'profile.fav_colors': 'Favorite Color Palette',
      'profile.budget_label': 'Budget Tier',
      'profile.budget_affordable': 'Affordable (Thrift / Local)',
      'profile.budget_mid': 'Mid-Tier (Popular Brands)',
      'profile.budget_premium': 'Premium & Designer',
      'profile.fit_label': 'Fit Preference',
      'profile.fit_slim': 'Slim Fit',
      'profile.fit_regular': 'Balanced Regular Fit',
      'profile.fit_oversized': 'Oversized / Relaxed',
      'profile.lang_label': '🌐 Language Preference / Bahasa',
      'profile.lang_id': '🇮🇩 Bahasa Indonesia',
      'profile.lang_en': '🇬🇧 English',
      'profile.btn_save': 'Save Profile & Sync with AI',
      'profile.saved_status': '✓ Profile & Preferences saved successfully!',
      'profile.intel_badge': 'Synced with AI Chat Stylist',
      'profile.intel_title': 'Body Proportion Summary',
      'profile.intel_desc': 'Information analyzed by the AI Stylist when curating outfits & styling advice.',
      'profile.stat_height': 'Height',
      'profile.stat_weight': 'Weight',
      'profile.stat_shape': 'Body Shape',
      'profile.stat_size': 'Clothing Size',
      'profile.note_focus': 'Your Proportion Focus:',
      'profile.silhouette_rec_title': 'AI Silhouette Guidance for Your Posture',
      'profile.consult_title': 'Ask Stylist Tips for Your Body',
      'profile.consult_desc': 'Select a quick question below. The AI Stylist will read your body profile and give tailored advice:',
      'profile.btn_open_chat': 'Consult with Chat Stylist →',

      // Stores Section
      'stores.pretitle': 'Offline Exploration',
      'stores.title': 'Nearby Clothing Stores',
      'stores.desc': 'Discover designer boutiques, fashion retailers, and thrift shops near you to complete your looks.',
      'stores.status_locating': '📍 Locating your GPS coordinates...',
      'stores.btn_detect': 'Detect GPS Location',
      'stores.filter_all': 'All Stores',
      'stores.filter_mall': 'Malls & Popular Brands',
      'stores.filter_thrift': 'Thrift & Vintage',
      'stores.filter_boutique': 'Local Designer Boutiques',
      'stores.filter_tailor': 'Tailors & Alterations',
      'stores.search_placeholder': 'Search store name, mall, or area...',
      'stores.sidebar_title': 'Featured Recommendations',
      'stores.sidebar_sub': 'Click to view location on map',
      'stores.open_maps': 'Open in Google Maps ↗',

      // Footer
      'footer.tagline': 'Dress with ease. Style with intelligence.',
      'footer.quote': 'Design smarter with personal AI that understands your silhouette and wardrobe.',
      'footer.nav_title': 'Quick Navigation:',
      'footer.feature1_title': 'AI Silhouette Intelligence',
      'footer.feature1_desc': 'Body proportion calibration for tailored, flattering cuts.',
      'footer.feature2_title': 'Color Palette Harmony',
      'footer.feature2_desc': 'Undertone-matched contrast that elevates your natural complexion.',
      'footer.feature3_title': 'Smart Shopping Picks',
      'footer.feature3_desc': 'AI-curated shop recommendations to fill the gaps in your wardrobe.',
      'footer.feature4_title': 'Atmospheric Adaptation',
      'footer.feature4_desc': 'Real-time outfit recommendations based on live weather and agenda.',
      'footer.system_ready': 'Gemini 3.5 Flash Engine Active',
      'footer.local_privacy': '🔒 Privacy First • Secure Local Storage',
      'footer.back_to_top': 'Back to Top',
      'footer.copyright': '© 2026 StylO • Padu Padan AI. All rights reserved.',

      // Modals & General
      'modal.add_title': 'Add New Garment',
      'modal.name_label': 'Garment Name',
      'modal.name_placeholder': 'e.g. Crisp White Linen Button-Down',
      'modal.cat_label': 'Category',
      'modal.cat_top': 'Top (Atasan)',
      'modal.cat_outer': 'Outerwear (Blazer/Jacket)',
      'modal.cat_bottom': 'Bottom (Pants/Skirt)',
      'modal.cat_shoes': 'Footwear (Shoes/Sneakers)',
      'modal.cat_acc': 'Accessories / Bag',
      'modal.color_label': 'Primary Color',
      'modal.color_placeholder': 'e.g. Crisp White, Charcoal, Sage',
      'modal.tag_label': 'Style Tags (Comma separated)',
      'modal.tag_placeholder': 'e.g. formal, casual, breathable, linen',
      'modal.notes_label': 'Additional Notes',
      'modal.notes_placeholder': 'e.g. Breathable cotton fabric, great for warm weather',
      'modal.btn_cancel': 'Cancel',
      'modal.btn_save': 'Save Garment',
      'confirm.default_title': 'Confirm Action',
      'confirm.default_msg': 'Are you sure you want to delete this item?',
      'confirm.btn_cancel': 'Cancel',
      'confirm.btn_delete': 'Delete',
      'toast.profile_saved': 'Body metrics & style preferences saved to AI! ✨',
      'toast.lang_switched': 'Language changed to English 🇬🇧'
    }
  },

  // Dynamic Vibe & Weather Option Translations for Custom Pull-down Dropdowns
  dropdownTranslations: {
    vibes: {
      'Smart Casual & Proporsional': { en: 'Smart Casual', desc: 'Sharp, versatile & flexible for office, casual or semi-formal' },
      'Smart Casual & Elegan': { en: 'Smart Casual', desc: 'Sharp, versatile & flexible for office, casual or semi-formal' },
      'Effortless Chic': { en: 'Effortless Chic', desc: 'Understated elegance, minimal styling without overthinking' },
      'Old Money Aesthetic': { en: 'Old Money', desc: 'Timeless quiet luxury, quality fabrics & subdued palettes' },
      'Old Money & Quiet Luxury': { en: 'Old Money', desc: 'Timeless quiet luxury, quality fabrics & subdued palettes' },
      'Korean Soft Aesthetic': { en: 'Korean Soft', desc: 'Cozy pastel tones, relaxed silhouette & clean aesthetics' },
      'Modern Streetwear & Urban Edgy': { en: 'Modern Streetwear', desc: 'Oversized cuts, statement sneakers & bold urban accents' },
      'Streetwear Trendsetter': { en: 'Modern Streetwear', desc: 'Oversized cuts, statement sneakers & bold urban accents' },
      'Minimalist Monochrome': { en: 'Clean Minimalist', desc: 'Black, white & grey with crisp lines and sharp silhouette' },
      'Earth Tone & Japandi Natural': { en: 'Earth Tone Chic', desc: 'Terracotta, sage, sand, beige & organic textured fabrics' },
      'Dark Academia & Vintage Classic': { en: 'Dark Academia', desc: 'Intellectual preppy, patterned blazers & moody vintage knits' },
      'Parisian Chic & Tailored': { en: 'Parisian Chic', desc: 'Iconic Parisian tailoring, trench coats & effortless elegance' },
      'Athleisure & Sporty Luxe': { en: 'Athleisure Luxe', desc: 'Dynamic sporty functional comfort tailored for active days' },
      'Y2K Retro & Playful': { en: 'Y2K Retro', desc: 'Early 2000s nostalgic flair, statement denim & playful energy' },
      'Formal & Black Tie Elegance': { en: 'Formal Glamour', desc: 'Evening elegance, tailored suits & gala-ready sophistication' },
      'Bohemian & Relaxed Resort': { en: 'Bohemian Resort', desc: 'Flowy resort silhouettes, subtle ethnic patterns & vacation vibes' },
      'Vintage 90s Grunge & Denim': { en: '90s Grunge', desc: 'Distressed denim, flannels, leather jackets & retro rebellion' },
      'Clean Aesthetic & Fresh Minimal': { en: 'Clean Aesthetic', desc: 'Fresh glowing aesthetic, neutral basics & polished lines' }
    },
    weather: {
      'Panas Terik Tropis (30°C+)': { en: 'Hot Tropical Sun (30°C+)', desc: 'Over 30°C, prioritize breathable, lightweight cotton & linen' },
      'Ruangan Ber-AC Dingin (Indoor)': { en: 'Cold A/C Indoors (18-22°C)', desc: 'Chilly 18-22°C indoor temperature, light layering / blazer needed' },
      'Hujan Sejuk / Berangin': { en: 'Rainy & Cool Breeze', desc: 'Wet & humid weather, water-repellent or warm outer layer' },
      'Sore Teduh & Berangin': { en: 'Breezy Mild Afternoon', desc: 'Comfortable 25-28°C weather, relaxed & flexible styling' },
      'Malam Dingin / Outdoor': { en: 'Cool Night Outdoors', desc: 'Chilly evening temperatures, stylish jacket / layering essential' }
    }
  },

  init() {
    const saved = localStorage.getItem('stylO_language');
    if (saved && (saved === 'id' || saved === 'en')) {
      this.currentLanguage = saved;
    } else {
      this.currentLanguage = 'id';
    }

    this.applyLanguage();
  },

  getLanguage() {
    return this.currentLanguage;
  },

  setLanguage(lang) {
    if (lang !== 'id' && lang !== 'en') return;
    if (this.currentLanguage === lang) return;

    this.currentLanguage = lang;
    localStorage.setItem('stylO_language', lang);
    this.applyLanguage();

    this.listeners.forEach(fn => {
      try { fn(lang); } catch (e) { console.error('[i18n] Listener error:', e); }
    });

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));

    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(this.t('toast.lang_switched'));
    }
  },

  toggleLanguage() {
    const next = this.currentLanguage === 'id' ? 'en' : 'id';
    this.setLanguage(next);
  },

  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  },

  t(key, fallback = '') {
    const dict = this.translations[this.currentLanguage] || this.translations['id'];
    if (dict && typeof dict[key] !== 'undefined') {
      return dict[key];
    }
    const fallbackDict = this.translations['id'];
    return (fallbackDict && fallbackDict[key]) || fallback || key;
  },

  applyLanguage() {
    const lang = this.currentLanguage;
    const isEn = lang === 'en';
    document.documentElement.lang = lang;

    // 1. Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = val;
        } else {
          if (val.includes('<') && val.includes('>')) {
            el.innerHTML = val;
          } else {
            el.textContent = val;
          }
        }
      }
    });

    // 2. Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.t(key);
      if (val) el.setAttribute('placeholder', val);
    });

    // 3. Update titles / aria-labels
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = this.t(key);
      if (val) el.setAttribute('title', val);
    });

    // 4. Update navbar language indicator pill
    const langLabel = document.getElementById('navLangLabel');
    if (langLabel) {
      langLabel.textContent = lang.toUpperCase();
    }
    const langFlag = document.getElementById('navLangFlag');
    if (langFlag) {
      langFlag.textContent = isEn ? '🇬🇧' : '🇮🇩';
    }
    const navPill = document.getElementById('navLangToggle');
    if (navPill) {
      navPill.setAttribute('title', this.t('nav.lang_toggle_title'));
    }

    // 5. Update profile dropdown if present
    const profBahasa = document.getElementById('profBahasa');
    if (profBahasa && profBahasa.value !== lang) {
      profBahasa.value = lang;
    }

    // 6. Update Custom Select Dropdowns Options (Vibes & Weather)
    this.updateDropdownsLanguage(isEn);

    // 7. Update Quick Occasion Chips
    this.updateOccasionChips(isEn);

    // 8. Refresh dynamic modules if available
    this.refreshDynamicModules(isEn);
  },

  updateDropdownsLanguage(isEn) {
    const vibeSelects = [document.getElementById('selectVibe'), document.getElementById('selectPhotoVibe')];
    vibeSelects.forEach(selectEl => {
      if (!selectEl) return;
      Array.from(selectEl.options).forEach(opt => {
        const trans = this.dropdownTranslations.vibes[opt.value];
        if (trans) {
          if (isEn) {
            if (!opt.dataset.origText) opt.dataset.origText = opt.text;
            if (!opt.dataset.origDesc) opt.dataset.origDesc = opt.dataset.desc || '';
            opt.text = trans.en;
            opt.dataset.desc = trans.desc;
          } else {
            if (opt.dataset.origText) opt.text = opt.dataset.origText;
            if (opt.dataset.origDesc) opt.dataset.desc = opt.dataset.origDesc;
          }
        }
      });
      // Trigger custom select update if customized
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const weatherSelects = [document.getElementById('selectCuaca'), document.getElementById('selectPhotoCuaca')];
    weatherSelects.forEach(selectEl => {
      if (!selectEl) return;
      Array.from(selectEl.options).forEach(opt => {
        const trans = this.dropdownTranslations.weather[opt.value];
        if (trans) {
          if (isEn) {
            if (!opt.dataset.origText) opt.dataset.origText = opt.text;
            if (!opt.dataset.origDesc) opt.dataset.origDesc = opt.dataset.desc || '';
            opt.text = trans.en;
            opt.dataset.desc = trans.desc;
          } else {
            if (opt.dataset.origText) opt.text = opt.dataset.origText;
            if (opt.dataset.origDesc) opt.dataset.desc = opt.dataset.origDesc;
          }
        }
      });
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    });
  },

  updateOccasionChips(isEn) {
    const chipTranslations = {
      'Interview Kerja Formal': { en: 'Job Interview', id: 'Interview Kerja' },
      'Kencan Pertama Cafe Romantis': { en: 'Cafe Date', id: 'Kencan Cafe' },
      'Kondangan Modern Outdoor': { en: 'Wedding Party', id: 'Kondangan' },
      'Nongkrong Santai Sore Weekend': { en: 'Casual Weekend', id: 'Casual Weekend' },
      'Presentasi Kampus & Kuliah': { en: 'Campus', id: 'Kampus' },
      'Airport Look & Traveling': { en: 'Traveling', id: 'Traveling' }
    };

    document.querySelectorAll('.chip-acara').forEach(chip => {
      const val = chip.getAttribute('data-val');
      if (chipTranslations[val]) {
        chip.textContent = isEn ? chipTranslations[val].en : chipTranslations[val].id;
      }
    });
  },

  refreshDynamicModules(isEn) {
    // Wardrobe Manager
    if (window.WardrobeManager && typeof window.WardrobeManager.renderGrid === 'function') {
      window.WardrobeManager.renderGrid();
      if (typeof window.WardrobeManager.updateCounters === 'function') {
        window.WardrobeManager.updateCounters();
      }
    }

    // History Grid
    if (window.App && typeof window.App.renderHistoryGrid === 'function' && window.App.recommendationHistory) {
      window.App.renderHistoryGrid(false);
    }

    // Weather Forecast UI
    if (window.WeatherService && window.WeatherService.currentData) {
      window.WeatherService.renderWeatherUI(window.WeatherService.currentData);
    }

    // Shop Market
    if (window.ShopMarket && typeof window.ShopMarket.renderProducts === 'function') {
      window.ShopMarket.renderProducts();
    }

    // Store Locator
    if (window.StoreLocator && typeof window.StoreLocator.renderStoreCards === 'function') {
      window.StoreLocator.renderStoreCards();
    }
  }
};

// Initialize as soon as script runs
if (typeof window !== 'undefined') {
  window.I18n = I18n;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
  } else {
    I18n.init();
  }
}

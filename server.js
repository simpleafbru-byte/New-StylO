require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Try loading Google Gen AI SDK
let GoogleGenAI, Type;
try {
  const genai = require('@google/genai');
  GoogleGenAI = genai.GoogleGenAI;
  Type = genai.Type;
} catch (e) {
  console.warn('[@google/genai] Note: GenAI SDK will be initialized once dependencies finish installing.');
}

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Fallback chain in case of temporary 503 capacity spikes, 429 rate limits, or deprecations
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
].filter(Boolean);
const UNIQUE_MODELS = [...new Set(CANDIDATE_MODELS)];

function cleanJsonString(str) {
  let cleaned = (str || '').trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return cleaned;
}

async function generateWithGeminiFallback(ai, params, preferredModel) {
  const modelsToTry = preferredModel
    ? [...new Set([preferredModel, ...UNIQUE_MODELS])]
    : UNIQUE_MODELS;

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelName
      });
      return { response, model: modelName };
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} error (${err.status || err.message}), attempting fallback...`);
      lastError = err;
    }
  }
  throw lastError;
}

// Paths to JSON storage
const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const REKOMENDASI_FILE = path.join(DATA_DIR, 'rekomendasi.json');
const WARDROBE_FILE = path.join(DATA_DIR, 'wardrobe.json');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// JSON File Helpers (Safe atomic read/write + Vercel cache)
// -------------------------------------------------------------
const vCache = {};

async function readJsonFile(filePath, defaultValue = []) {
  if (process.env.VERCEL && vCache[filePath]) {
    return vCache[filePath];
  }
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(content);
    if (process.env.VERCEL) {
      vCache[filePath] = parsed;
    }
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      } catch (_) {}
      return defaultValue;
    }
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

async function writeJsonFile(filePath, data) {
  if (process.env.VERCEL) {
    vCache[filePath] = data;
    return;
  }
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    throw err;
  }
}

// -------------------------------------------------------------
// Smart Wardrobe-Gap Shopping Engine
// -------------------------------------------------------------
function calculateWardrobeSynergy(missingItemDesc, kategori, wardrobeItems = []) {
  const cat = (kategori || '').toLowerCase();
  const desc = (missingItemDesc || '').toLowerCase();

  let compatible = [];

  if (cat.includes('outer') || desc.includes('jacket') || desc.includes('blazer') || desc.includes('cardigan') || desc.includes('outer') || desc.includes('overshirt')) {
    const tops = wardrobeItems.filter(i => i.kategori === 'atasan');
    const bottoms = wardrobeItems.filter(i => i.kategori === 'bawahan');
    compatible = [...tops, ...bottoms];
  } else if (cat.includes('atas') || desc.includes('kemeja') || desc.includes('kaos') || desc.includes('tee') || desc.includes('top') || desc.includes('knit')) {
    const bottoms = wardrobeItems.filter(i => i.kategori === 'bawahan');
    const outers = wardrobeItems.filter(i => i.kategori === 'outerwear');
    compatible = [...bottoms, ...outers];
  } else if (cat.includes('bawah') || desc.includes('celana') || desc.includes('trousers') || desc.includes('denim') || desc.includes('rok')) {
    const tops = wardrobeItems.filter(i => i.kategori === 'atasan');
    const shoes = wardrobeItems.filter(i => i.kategori === 'alasKaki');
    compatible = [...tops, ...shoes];
  } else if (cat.includes('alas') || desc.includes('sepatu') || desc.includes('sneaker') || desc.includes('loafer') || desc.includes('mule') || desc.includes('heel')) {
    const bottoms = wardrobeItems.filter(i => i.kategori === 'bawahan');
    compatible = [...bottoms];
  } else {
    compatible = wardrobeItems.slice(0, 4);
  }

  let synergyCount = 0;
  if (cat.includes('outer') || desc.includes('jacket') || desc.includes('blazer') || desc.includes('outer')) {
    const topCount = Math.max(1, wardrobeItems.filter(i => i.kategori === 'atasan').length);
    const bottomCount = Math.max(1, wardrobeItems.filter(i => i.kategori === 'bawahan').length);
    synergyCount = topCount * bottomCount;
  } else {
    synergyCount = Math.max(compatible.length, 3);
  }
  // Ensure a realistic engaging number (between 4 and 9)
  synergyCount = Math.max(synergyCount, Math.min(wardrobeItems.length + 1, 7));

  return {
    synergyCount,
    compatibleNames: compatible.map(i => i.nama).slice(0, 4)
  };
}

function generateCuratedShoppingItems(missingItemName, kategori, konteks = {}) {
  const nameLower = (missingItemName || '').toLowerCase();
  const catLower = (kategori || '').toLowerCase();

  if (catLower.includes('outer') || nameLower.includes('jacket') || nameLower.includes('blazer') || nameLower.includes('overshirt')) {
    const isBlack = nameLower.includes('black') || nameLower.includes('hitam') || nameLower.includes('charcoal');
    const colorLabel = isBlack ? 'Hitam / Dark Noir' : 'Sand Beige / Neutral';
    const colorHex = isBlack ? '#1E1E24' : '#CBB59B';

    return [
      {
        id: 'shop_' + Date.now() + '_1',
        nama: isBlack ? 'Relaxed Lightweight Cotton Utility Jacket' : 'Unlined Linen Blend Oversized Blazer',
        brand: 'Uniqlo',
        estimasiHarga: 'Rp 499.000',
        badge: '✨ Best Wardrobe Match',
        warna: colorLabel,
        warnaHex: colorHex,
        kategori: 'outerwear',
        alasanCocok: 'Potongan versatile dengan bahan adem yang sangat mudah di-layering di atas kaos maupun kemeja Anda.',
        link: `https://www.google.com/search?q=uniqlo+${encodeURIComponent(missingItemName)}+indonesia`,
        queryStore: 'Uniqlo Grand Indonesia'
      },
      {
        id: 'shop_' + Date.now() + '_2',
        nama: isBlack ? 'Minimal Tailored Cropped Overshirt' : 'Structured Flowy Blazer Coat',
        brand: 'Zara',
        estimasiHarga: 'Rp 799.000',
        badge: '💎 Contemporary Tailoring',
        warna: colorLabel,
        warnaHex: colorHex,
        kategori: 'outerwear',
        alasanCocok: 'Siluet tegas berkarakter modern untuk elevating outfit kasual ke smart casual seketika.',
        link: `https://www.google.com/search?q=zara+${encodeURIComponent(missingItemName)}+indonesia`,
        queryStore: 'Zara Senayan City'
      },
      {
        id: 'shop_' + Date.now() + '_3',
        nama: isBlack ? 'Vintage Denim & Cotton Chore Coat' : 'Curated Vintage Linen Harrington Jacket',
        brand: 'Pasar Senen Thrift',
        estimasiHarga: 'Rp 165.000',
        badge: '🌿 Eco & Budget Choice',
        warna: colorLabel,
        warnaHex: colorHex,
        kategori: 'outerwear',
        alasanCocok: 'Karakter vintage dengan tekstur washed unik berbobot ringan dan ramah di kantong.',
        link: `https://www.google.com/search?q=pasar+senen+thrift+${encodeURIComponent(missingItemName)}`,
        queryStore: 'Pasar Senen Blok III (Pusat Thrifting)'
      }
    ];
  }

  if (catLower.includes('alas') || nameLower.includes('sepatu') || nameLower.includes('sneaker') || nameLower.includes('loafer') || nameLower.includes('mule') || nameLower.includes('heel')) {
    const isSneaker = nameLower.includes('sneaker');
    return [
      {
        id: 'shop_' + Date.now() + '_1',
        nama: isSneaker ? 'Low-Top Minimalist Leather Sneakers' : 'Classic Leather Penny Loafers',
        brand: 'Uniqlo / Pedro',
        estimasiHarga: 'Rp 599.000',
        badge: '✨ Best Everyday Match',
        warna: isSneaker ? 'Crisp White' : 'Dark Espresso',
        warnaHex: isSneaker ? '#F8F9FA' : '#2D1E18',
        kategori: 'alasKaki',
        alasanCocok: 'Sol ergonomis empuk dengan siluet clean yang cocok dengan celana bahan maupun denim.',
        link: `https://www.google.com/search?q=${encodeURIComponent(missingItemName)}+indonesia`,
        queryStore: 'Uniqlo Grand Indonesia'
      },
      {
        id: 'shop_' + Date.now() + '_2',
        nama: isSneaker ? 'Retro Suede Accent Court Sneakers' : 'Chunky Track Sole Loafers',
        brand: 'Zara',
        estimasiHarga: 'Rp 899.000',
        badge: '💎 Fashion Editorial',
        warna: isSneaker ? 'White & Grey' : 'Polished Noir',
        warnaHex: isSneaker ? '#ECEFF1' : '#1C1C1E',
        kategori: 'alasKaki',
        alasanCocok: 'Aksen berkelas yang mempertegas proporsi kaki dan tampilan keseluruhan.',
        link: `https://www.google.com/search?q=zara+${encodeURIComponent(missingItemName)}+indonesia`,
        queryStore: 'Zara Senayan City'
      },
      {
        id: 'shop_' + Date.now() + '_3',
        nama: isSneaker ? 'Vintage Leather Trainers' : 'Classic Leather Loafers Curated',
        brand: 'Pasar Senen Thrift / Metro Atom',
        estimasiHarga: 'Rp 220.000',
        badge: '🌿 Vintage Bargain',
        warna: isSneaker ? 'Vintage Chalk' : 'Chestnut Brown',
        warnaHex: isSneaker ? '#EDE8DF' : '#4E3629',
        kategori: 'alasKaki',
        alasanCocok: 'Kualitas kulit asli dengan patina alami yang tahan lama.',
        link: `https://www.google.com/search?q=thrift+shoes+${encodeURIComponent(missingItemName)}`,
        queryStore: 'Metro Atom Plaza Pasar Baru'
      }
    ];
  }

  // Default / bottoms / tops / accessories
  return [
    {
      id: 'shop_' + Date.now() + '_1',
      nama: `Relaxed Essential ${missingItemName}`,
      brand: 'Uniqlo',
      estimasiHarga: 'Rp 399.000',
      badge: '✨ Best Wardrobe Match',
      warna: 'Neutral Harmony',
      warnaHex: '#BCAAA4',
      kategori: kategori || 'atasan',
      alasanCocok: 'Material katun bernapas dengan potongan modern yang nyaman dipakai seharian.',
      link: `https://www.google.com/search?q=uniqlo+${encodeURIComponent(missingItemName)}+indonesia`,
      queryStore: 'Uniqlo Grand Indonesia'
    },
    {
      id: 'shop_' + Date.now() + '_2',
      nama: `Contemporary Tailored ${missingItemName}`,
      brand: 'Zara',
      estimasiHarga: 'Rp 699.000',
      badge: '💎 Elevated Modern',
      warna: 'Soft Sand',
      warnaHex: '#D7CCC8',
      kategori: kategori || 'atasan',
      alasanCocok: 'Jahitan presisi yang memberi aksen estetis dan siluet proporsional.',
      link: `https://www.google.com/search?q=zara+${encodeURIComponent(missingItemName)}+indonesia`,
      queryStore: 'Zara Senayan City'
    },
    {
      id: 'shop_' + Date.now() + '_3',
      nama: `Curated Heritage ${missingItemName}`,
      brand: 'Pasar Baru / Local Brand',
      estimasiHarga: 'Rp 180.000',
      badge: '🌿 Budget & Timeless',
      warna: 'Warm Khaki',
      warnaHex: '#A1887F',
      kategori: kategori || 'atasan',
      alasanCocok: 'Pilihan ekonomis berkualitas tinggi dengan karakter unik.',
      link: `https://www.google.com/search?q=${encodeURIComponent(missingItemName)}+pasar+baru`,
      queryStore: 'Metro Atom Plaza Pasar Baru'
    }
  ];
}

function enrichShoppingRecommendation(rawRec, outfit, wardrobeItems = [], konteks = {}) {
  let missingItem = rawRec?.missingItem;
  let kategori = rawRec?.kategori || 'outerwear';
  let icon = rawRec?.icon || '🧥';
  let alasanKebutuhan = rawRec?.alasanKebutuhan;

  // Derive if not provided by Gemini or fallback
  if (!missingItem) {
    if (outfit?.saranArahBelanja && outfit.saranArahBelanja.length > 5) {
      missingItem = outfit.saranArahBelanja.replace(/^(investasikan|pertimbangkan|cari|pilih|miliki)\s+/i, '').split('.')[0].trim();
      if (missingItem.length > 50) missingItem = missingItem.substring(0, 48) + '...';
    } else {
      missingItem = 'Lightweight Black Jacket';
    }
  }

  // Detect icon & category
  const itemLower = missingItem.toLowerCase();
  if (itemLower.includes('jacket') || itemLower.includes('jaket') || itemLower.includes('blazer') || itemLower.includes('outer') || itemLower.includes('cardigan') || itemLower.includes('overshirt')) {
    icon = '🧥';
    kategori = 'outerwear';
  } else if (itemLower.includes('sepatu') || itemLower.includes('shoe') || itemLower.includes('sneaker') || itemLower.includes('loafer') || itemLower.includes('mule') || itemLower.includes('heel')) {
    icon = '👟';
    kategori = 'alasKaki';
  } else if (itemLower.includes('celana') || itemLower.includes('trouser') || itemLower.includes('pant') || itemLower.includes('jeans') || itemLower.includes('rok')) {
    icon = '👖';
    kategori = 'bawahan';
  } else if (itemLower.includes('kemeja') || itemLower.includes('shirt') || itemLower.includes('kaos') || itemLower.includes('tee') || itemLower.includes('top') || itemLower.includes('knit')) {
    icon = '👔';
    kategori = 'atasan';
  } else if (itemLower.includes('tas') || itemLower.includes('bag') || itemLower.includes('sabuk') || itemLower.includes('belt') || itemLower.includes('jam') || itemLower.includes('cuff') || itemLower.includes('selendang')) {
    icon = '👜';
    kategori = 'aksesori';
  }

  if (!alasanKebutuhan) {
    alasanKebutuhan = `Sentuhan ${missingItem} akan mengikat tampilan ${outfit?.judulLook || 'ini'} menjadi lebih utuh, proporsional, dan adaptif terhadap perubahan suasana.`;
  }

  const { synergyCount, compatibleNames } = calculateWardrobeSynergy(missingItem, kategori, wardrobeItems);

  const wardrobeSynergyReason = rawRec?.wardrobeSynergyReason || 
    `A ${missingItem.toLowerCase()} would work with ${synergyCount} different outfits in your wardrobe.`;

  const curatedItems = (rawRec?.curatedItems && rawRec.curatedItems.length === 3)
    ? rawRec.curatedItems
    : generateCuratedShoppingItems(missingItem, kategori, konteks);

  return {
    missingItem,
    kategori,
    icon,
    alasanKebutuhan,
    wardrobeSynergyCount: synergyCount,
    wardrobeSynergyReason,
    compatibleWardrobeItems: compatibleNames,
    curatedItems
  };
}

// -------------------------------------------------------------
// Fallback Stylist Engine (High quality curated fashion styling)
// -------------------------------------------------------------
function generateCuratedStylistOutfit({ konteks, wardrobeItems, profile }) {
  const { acara = 'Acara Spesial', cuaca = 'Normal', suasana = 'Smart Casual', catatanPengguna = '' } = konteks;
  const gender = profile?.gender || profile?.preferensi?.gender || 'female';
  const isMale = gender === 'male' || gender === 'pria';

  const acaraLower = acara.toLowerCase();
  const suasanaLower = (suasana || '').toLowerCase();

  let resultLook = null;

  // Curated templates based on occasion, vibe, and gender
  if (acaraLower.includes('interview') || acaraLower.includes('kantor') || acaraLower.includes('formal') || suasanaLower.includes('formal')) {
    resultLook = {
      judulLook: isMale ? 'Modern Executive Tailored' : 'Modern Executive Elegance',
      atasan: wardrobeItems.find(i => i.kategori === 'atasan')?.nama || (isMale ? 'Kemeja poplin katun putih bersih kerah lancip tailored fit' : 'Kemeja tailored poplin katun putih bersih kerah lancip'),
      outerwear: wardrobeItems.find(i => i.kategori === 'outerwear')?.nama || (isMale ? 'Single-breasted structured blazer warna charcoal grey' : 'Single-breasted tailored blazer warna charcoal grey dengan kancing tanduk'),
      bawahan: wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || (isMale ? 'Pleated tailored trousers warna charcoal grey atau navy gelap' : 'Pleated tailored trousers warna senada atau taupe gelap dengan siluet straight leg'),
      alasKaki: wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || (isMale ? 'Leather Oxford atau Derby Shoes warna dark espresso' : 'Leather Oxford atau Penny Loafers warna dark espresso mengkilap'),
      aksesori: [
        'Jam tangan dial minimalis dengan tali kulit hitam',
        isMale ? 'Tas kerja kulit briefcase minimalis warna hitam' : 'Tas kerja kulit berstruktur warna hitam/dark brown',
        'Sabuk kulit halus dengan buckle silver matte'
      ],
      paletWarna: [
        { nama: 'Crisp White', hex: '#FFFFFF' },
        { nama: 'Charcoal Noir', hex: '#2B2D42' },
        { nama: 'Taupe Stone', hex: '#8D99AE' },
        { nama: 'Dark Espresso', hex: '#1D1E2C' }
      ],
      alasanAI: `Untuk konteks "${acara}", siluet tailored blazer memberikan kesan kompeten dan berwibawa seketika. Pemilihan warna netral monokrom dengan kontras putih bersih memancarkan ketegasan profesional tanpa terlihat monoton.`,
      tipsStyling: 'Pastikan bahu blazer pas sempurna di pundak dan ujung kemeja mengintip sekitar 1 cm dari lengan blazer untuk sentuhan bespoke tailoring.',
      saranArahBelanja: 'Pertimbangkan memiliki celana bahan berbahan wool-blend atau unlined linen blazer yang nyaman untuk iklim tropis ber-AC.',
      shoppingRecommendation: {
        missingItem: 'Unlined Charcoal Wool-Blend Blazer',
        kategori: 'outerwear',
        icon: '🧥',
        alasanKebutuhan: 'Blazer berpotongan clean-line memberikan sentuhan tailored profesional instan tanpa terasa kaku.'
      }
    };
  } else if (acaraLower.includes('kencan') || acaraLower.includes('dinner') || suasanaLower.includes('aesthetic') || suasanaLower.includes('korean')) {
    if (isMale) {
      resultLook = {
        judulLook: 'Smart Evening Casual (Modern Masculine)',
        atasan: wardrobeItems.find(i => i.kategori === 'atasan')?.nama || 'Kemeja linen relax-cut warna broken white atau knit polo latte',
        outerwear: wardrobeItems.find(i => i.kategori === 'outerwear')?.nama || 'Unstructured lightweight blazer warna sand beige atau dark navy',
        bawahan: wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || 'Pleated ankle trousers warna charcoal grey atau tapered chinos oat',
        alasKaki: wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || 'Leather Penny Loafers warna dark brown atau clean white minimalist sneakers',
        aksesori: [
          'Jam tangan analog tali kulit cokelat klasik',
          'Gelang perak tali tipis minimalis',
          'Dompet kartu kulit slim'
        ],
        paletWarna: [
          { nama: 'Broken White', hex: '#F9F6F0' },
          { nama: 'Sand Beige', hex: '#D6C7B2' },
          { nama: 'Charcoal Grey', hex: '#2F3542' },
          { nama: 'Dark Brown', hex: '#3E2723' }
        ],
        alasanAI: `Paduan kemeja santai dan celana pleated trousers memberikan siluet smart casual yang maskulin, rapi, dan effortless untuk acara kencan atau dinner santai.`,
        tipsStyling: 'Biarkan 1-2 kancing atas kemeja terbuka dan gulung tipis lengan baju untuk impresi santai namun percaya diri.',
        saranArahBelanja: 'Sepasang loafers kulit cokelat tua adalah investasi esensial yang meningkatkan kelas tampilan kasual pria seketika.',
        shoppingRecommendation: {
          missingItem: 'Dark Brown Leather Penny Loafers',
          kategori: 'alasKaki',
          icon: '👞',
          alasanKebutuhan: 'Loafers kulit warna cokelat tua menyempurnakan tampilan kencan malam hari tanpa terasa kaku.'
        }
      };
    } else {
      resultLook = {
        judulLook: 'Effortless Romantic Chic',
        atasan: wardrobeItems.find(i => i.kategori === 'atasan')?.nama || 'Atasan ribbed knit halus warna cream vanilla dengan kerah boatneck atau mockneck',
        outerwear: wardrobeItems.find(i => i.kategori === 'outerwear')?.nama || 'Cardigan rajut kancing tortoise warna soft sage green bertekstur lembut',
        bawahan: wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || 'Rok plisket midi warna champagne atau high-waisted wide-leg trousers warna oat beige',
        alasKaki: wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || 'Strappy low-block heels warna nude atau leather mules minimalis',
        aksesori: [
          'Kalung liontin mungil bersepuh emas hangat',
          'Shoulder bag kulit bulan sabit warna ivory',
          'Anting mutiara kecil'
        ],
        paletWarna: [
          { nama: 'Vanilla Cream', hex: '#F9F6F0' },
          { nama: 'Soft Sage', hex: '#9EAD9B' },
          { nama: 'Oatmeal Beige', hex: '#D6C7B2' },
          { nama: 'Warm Champagne', hex: '#E5D4C0' }
        ],
        alasanAI: `Kombinasi warna lembut pastel dan earth tone memberikan aura hangat, ramah, dan memikat. Tekstur knit yang lembut menciptakan kesan approachable dan anggun saat mengobrol santai.`,
        tipsStyling: 'Gunakan aksen aksesori emas hangat untuk memantulkan cahaya lampu restoran atau cafe dengan cantik.',
        saranArahBelanja: 'Sepasang low-block heels warna nude atau mules kulit adalah investasi timeless yang cocok dipadukan dengan berbagai dress maupun celana.',
        shoppingRecommendation: {
          missingItem: 'Strappy Low-Block Nude Leather Mules',
          kategori: 'alasKaki',
          icon: '👡',
          alasanKebutuhan: 'Alas kaki berona nude memperpanjang siluet kaki dan memberi sentuhan feminin anggun.'
        }
      };
    }
  } else if (acaraLower.includes('kondangan') || acaraLower.includes('pesta') || acaraLower.includes('resepsi')) {
    if (isMale) {
      resultLook = {
        judulLook: 'Modern Heritage Batik Pria',
        atasan: wardrobeItems.find(i => i.kategori === 'atasan')?.nama || 'Kemeja batik sutra tulis lengan panjang motif parang kontemporer warna navy/bronze',
        outerwear: '',
        bawahan: wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || 'Celana bahan tailored wool-blend slim-fit warna hitam pekat',
        alasKaki: wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || 'Sepatu kulit Oxford hitam mengkilap atau dark brown derby shoes',
        aksesori: [
          'Jam tangan analog dial hitam dengan strap kulit',
          'Sabuk kulit hitam formal dengan buckle polished silver'
        ],
        paletWarna: [
          { nama: 'Midnight Navy', hex: '#1D3557' },
          { nama: 'Warm Bronze', hex: '#A87A51' },
          { nama: 'Jet Black', hex: '#121316' },
          { nama: 'Deep Charcoal', hex: '#2B2D42' }
        ],
        alasanAI: `Kemeja batik sutra lengan panjang dengan motif elegan adalah standar ketampanan busana formal pria Indonesia yang berkelas, berakar pada tradisi namun berjiwa modern.`,
        tipsStyling: 'Pastikan panjang lengan kemeja batik jatuh tepat di pergelangan tangan dan padukan dengan celana bahan yang disetrika bergaris rapi.',
        saranArahBelanja: 'Kemeja batik tulis sutra berkualitas tinggi adalah investasi busana pria seumur hidup.',
        shoppingRecommendation: {
          missingItem: 'Polished Black Leather Oxford Shoes',
          kategori: 'alasKaki',
          icon: '👞',
          alasanKebutuhan: 'Sepatu Oxford kulit hitam adalah fondasi wajib untuk setiap setelan batik atau jas formal.'
        }
      };
    } else {
      resultLook = {
        judulLook: 'Modern Heritage Glamour',
        atasan: wardrobeItems.find(i => i.kategori === 'atasan')?.nama || 'Kutubaru modern berbahan silk satin warna dusty rose dengan kancing hias',
        outerwear: wardrobeItems.find(i => i.kategori === 'outerwear')?.nama || 'Outer selendang organza transparan dengan bordir floral halus',
        bawahan: wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || 'Kain lilit batik sutra motif parang kontemporer bernuansa tembaga',
        alasKaki: wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || 'Pointed-toe slingback heels warna gold champagne',
        aksesori: [
          'Clutch bag beraksen brokat atau anyaman modern',
          'Subeng / anting etnik modern warna emas kuningan',
          'Gelang cuff ramping'
        ],
        paletWarna: [
          { nama: 'Dusty Rose', hex: '#C08081' },
          { nama: 'Gold Champagne', hex: '#D4AF37' },
          { nama: 'Copper Batik', hex: '#7D4F39' },
          { nama: 'Warm Bronze', hex: '#A87A51' }
        ],
        alasanAI: `Perpaduan siluet tradisional dengan sentuhan bahan silk modern menghormati kesakralan pesta pernikahan sembari memancarkan selera berbusana kontemporer yang sophisticated.`,
        tipsStyling: 'Tata rambut secara rapi (updo atau half-up) agar detail kerah kutubaru dan perhiasan leher tampak anggun.',
        saranArahBelanja: 'Kain lilit batik bernuansa warna netral bumi adalah investasi wajib yang bisa dipakai berulang kali dengan atasan berbeda.',
        shoppingRecommendation: {
          missingItem: 'Modern Brass Cuff & Selendang Brokat',
          kategori: 'aksesori',
          icon: '✨',
          alasanKebutuhan: 'Aksen perhiasan kuningan kontemporer menyatukan nuansa tradisional dengan sentuhan mewah modern.'
        }
      };
    }
  } else {
    // Default smart casual / weekend look
    resultLook = {
      judulLook: 'Contemporary Casual Sophisticate',
      atasan: wardrobeItems.find(i => i.kategori === 'atasan')?.nama || 'Kaos katun supima kerah crewneck warna broken white berpotongan relaxed',
      outerwear: wardrobeItems.find(i => i.kategori === 'outerwear')?.nama || 'Oversized linen overshirt warna mocha atau olive army',
      bawahan: wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || 'Straight-leg denim medium wash dengan detail hem bersih',
      alasKaki: wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || 'Sneakers kulit putih minimalis dengan sol karet natural',
      aksesori: [
        'Tote bag kanvas premium kombinasi kulit nabati',
        'Kacamata hitam berbingkai D-frame klasik',
        'Jam tangan sporty minimalis'
      ],
      paletWarna: [
        { nama: 'Broken White', hex: '#F4F3EE' },
        { nama: 'Earthy Mocha', hex: '#8B7355' },
        { nama: 'Indigo Denim', hex: '#415A77' },
        { nama: 'Caramel Leather', hex: '#B07D62' }
      ],
      alasanAI: `Kombinasi linen overshirt di atas kaos basic memberikan dimensi gaya kasual berlapis yang tidak gerah. Siluet straight denim menyeimbangkan proporsi tubuh dengan santai namun tetap rapi.`,
      tipsStyling: 'Buka kancing overshirt seluruhnya dan gulung lengan 2 lipatan untuk kesan effortless weekend vibe.',
      saranArahBelanja: 'Kaos katun berbobot berat (heavyweight tee) menjaga bentuk kerah tetap kokoh setelah dicuci berkali-kali.',
      shoppingRecommendation: {
        missingItem: 'Lightweight Black Jacket',
        kategori: 'outerwear',
        icon: '🧥',
        alasanKebutuhan: 'Outerwear ringan warna hitam adalah timeless layering piece yang menyeimbangkan kaos kasual dengan siluet yang rapi.'
      }
    };
  }

  // Enrich with full wardrobe synergy & curated items
  resultLook.shoppingRecommendation = enrichShoppingRecommendation(
    resultLook.shoppingRecommendation,
    resultLook,
    wardrobeItems,
    konteks
  );

  return resultLook;
}


// -------------------------------------------------------------
// Gemini API Call via Official @google/genai SDK
// -------------------------------------------------------------
async function callGeminiForOutfit({ apiKey, model, konteks, wardrobeItems, profile, lang = 'id' }) {
  if (!apiKey || apiKey.trim() === '' || !GoogleGenAI) {
    throw new Error('No API key provided or SDK not ready; switching to fallback stylist.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const isEn = lang === 'en';
  const langInstruction = isEn
    ? '7. LANGUAGE REQUIREMENT: All textual output (judulLook, atasan, outerwear, bawahan, alasKaki, alasanAI, tipsStyling, saranArahBelanja, alasanKebutuhan, wardrobeSynergyReason) MUST be written in fluent, chic, sophisticated English.'
    : '7. INSTRUKSI BAHASA: Semua teks output (judulLook, atasan, outerwear, bawahan, alasKaki, alasanAI, tipsStyling, saranArahBelanja, alasanKebutuhan, wardrobeSynergyReason) HARUS ditulis dalam Bahasa Indonesia yang berkelas, ramah, dan estetis.';

  const wardrobeContext = wardrobeItems && wardrobeItems.length > 0
    ? `Koleksi Lemari Pakaian Pengguna (PENTING: Sebisa mungkin padukan atau prioritaskan item-item ini jika relevan!):
${JSON.stringify(wardrobeItems, null, 2)}`
    : 'Pengguna tidak memilih item khusus dari lemari, rancang rekomendasi terbaik secara bebas.';

  const gender = profile?.gender || profile?.preferensi?.gender || 'female';
  const isMale = gender === 'male' || gender === 'pria';
  const tinggi = profile?.tinggiBadan || profile?.preferensi?.tinggiBadan;
  const berat = profile?.beratBadan || profile?.preferensi?.beratBadan;
  const bentuk = profile?.bentukTubuh || profile?.preferensi?.bentukTubuh;
  const ukuran = profile?.ukuranBaju || profile?.preferensi?.ukuranBaju;
  const catatan = profile?.catatanProporsi || profile?.preferensi?.catatanProporsi;

  const profileContext = profile
    ? `Profil & Data Proporsi Tubuh Pengguna:
- Nama: ${profile.namaOpsional || 'Pengguna'}
- Gender / Jenis Kelamin: ${isMale ? 'Pria (Male)' : 'Wanita (Female)'}
- Tinggi Badan: ${tinggi ? tinggi + ' cm' : '165 cm'}
- Berat Badan: ${berat ? berat + ' kg' : '54 kg'}
- Bentuk Tubuh: ${bentuk || (isMale ? 'Trapezoid / Atletis' : 'Jam Pasir (Hourglass)')}
- Ukuran Busana: ${ukuran || 'M'}
- Catatan Proporsi & Fit: ${catatan || 'Proporsi tubuh seimbang'}
- Gaya Favorit: ${(profile.preferensi?.gayaFavorit || []).join(', ')}
- Palet Warna Favorit: ${(profile.preferensi?.warnaFavorit || []).join(', ')}
- Tingkat Budget: ${profile.preferensi?.budget || 'menengah'}
- Preferensi Potongan: ${profile.preferensi?.tipeTubuh || 'regular'}`
    : `Profil pengguna umum (${isMale ? 'Pria' : 'Wanita'}).`;

  const prompt = `
Anda adalah seorang Personal Digital Stylist kelas dunia bernama "Padu Padan AI".
Tugas Anda adalah merancang rekomendasi padu padan outfit yang sangat stylish, proporsional, dan tepat guna untuk pengguna.

KONTEKS PERMINTAAN:
- Acara / Keperluan: "${konteks.acara || '-'}"
- Cuaca & Suhu: "${konteks.cuaca || '-'}"
- Vibe / Karakter Gaya yang diinginkan: "${konteks.suasana || '-'}"
- Catatan Khusus Pengguna: "${konteks.catatanPengguna || '-'}"

${profileContext}

${wardrobeContext}

INSTRUKSI STYLIST:
1. Rekomendasikan busana lengkap: atasan (top), bawahan (bottom), alas kaki (footwear), outerwear (opsional), dan aksesori pelengkap.
   PENTING - KESESUAIAN GENDER: Rancang paduan busana yang selaras dengan gender pengguna (${isMale ? 'PRIA / MALE: Rancang paduan busana pria berkarakter maskulin seperti kemeja/kaos/polo pria, celana/chinos/trousers pria, sepatu kulit/sneakers pria' : 'WANITA / FEMALE: Rancang paduan busana wanita yang chic dan feminin seperti dress/blouse/rok/celana wanita, outerwear, dan alas kaki wanita'}).
2. Jelaskan Opini & Alasan Stylist (alasan AI) secara mendalam: mengapa potongan dan perpaduan warna ini cocok dengan bentuk tubuh, acara, dan cuaca.
3. Berikan Tips Styling Pro (misal teknik lipat celana, tuck-in, cara pakai outer, aksesoris kunci).
4. Tentukan 3-4 Palet Harmoni Warna (nama warna & kode HEX).
5. Berikan Saran Arah Belanja busana kunci jika ada barang esensial yang layak diinvestasikan.
6. IDENTIFIKASI 1 "MISSING PIECE" (POTONGAN BELANJA PELENGKAP BERMANFAAT TINGGI):
   Tentukan 1 item esensial spesifik yang belum tentu ada di lemari pengguna, tetapi memiliki nilai guna tinggi karena melengkapi outfit ini DAN sangat cocok dipadukan dengan banyak pakaian lain di lemari pengguna (misal: "Lightweight Black Jacket", "Unlined Linen Blazer", "White Minimalist Leather Sneakers").
   Sebutkan nama item ("missingItem"), kategori ("outerwear"/"atasan"/"bawahan"/"alasKaki"/"aksesori"), emoji icon, alasan kebutuhan, dan estimasi nilai sinergi lemari ("wardrobeSynergyReason").
${langInstruction}

KEMBALIKAN HANYA SEBAGAI JSON VALID dengan struktur persis seperti schema ini:
{
  "judulLook": "Judul nama gaya yang puitis dan keren",
  "atasan": "Deskripsi atasan lengkap bahan dan warnanya",
  "outerwear": "Deskripsi outerwear jika ada, atau string kosong jika tidak perlu",
  "bawahan": "Deskripsi bawahan lengkap",
  "alasKaki": "Deskripsi sepatu/alas kaki lengkap",
  "aksesori": ["Aksesori 1", "Aksesori 2", "Aksesori 3"],
  "paletWarna": [
    { "nama": "Nama Warna 1", "hex": "#HEXCODE" },
    { "nama": "Nama Warna 2", "hex": "#HEXCODE" },
    { "nama": "Nama Warna 3", "hex": "#HEXCODE" }
  ],
  "alasanAI": "Opini stylist profesional tentang harmoni dan kesesuaian acara...",
  "tipsStyling": "Tips trik pemakaian praktis...",
  "saranArahBelanja": "Saran investasi pakaian...",
  "shoppingRecommendation": {
    "missingItem": "Lightweight Black Jacket",
    "kategori": "outerwear",
    "icon": "🧥",
    "alasanKebutuhan": "Outerwear ringan hitam mengikat tampilan agar tidak terlalu kasual...",
    "wardrobeSynergyReason": "A lightweight black jacket would work with 7 different outfits in your wardrobe."
  }
}
`;

  const { response } = await generateWithGeminiFallback(ai, {
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  }, model);

  const responseText = cleanJsonString(response.text);
  const parsed = JSON.parse(responseText);

  // Enrich shopping recommendation with wardrobe cross-reference & curated items
  parsed.shoppingRecommendation = enrichShoppingRecommendation(
    parsed.shoppingRecommendation,
    parsed,
    wardrobeItems,
    konteks
  );

  return parsed;
}

// -------------------------------------------------------------
// Gemini Multimodal Photo Outfit Matcher (FR-7)
// -------------------------------------------------------------
function generateCuratedPhotoMatchOutfit({ konteks, wardrobeItems }) {
  const atasan = wardrobeItems.find(i => i.kategori === 'atasan')?.nama || 'Kemeja Linen Putih Kerah Shanghai';
  const outerwear = wardrobeItems.find(i => i.kategori === 'outerwear')?.nama || 'Oversized Blazer Sand Beige';
  const bawahan = wardrobeItems.find(i => i.kategori === 'bawahan')?.nama || 'Pleated Ankle Trousers Charcoal Grey';
  const alasKaki = wardrobeItems.find(i => i.kategori === 'alasKaki')?.nama || 'Leather Penny Loafers Dark Brown';

  return {
    evaluasiFoto: {
      proporsiTubuh: "Garis bahu terdefinisi dengan rasio torso yang proporsional. Sangat serasi dengan potongan tailored dan siluet clean-line.",
      undertoneWarna: "Warm Earth Undertone — rona kulit Anda bersinar maksimal dengan palet broken white, sand beige, dan charcoal contrast.",
      karakterVisual: "Modern, grounded, dan effortless natural confidence."
    },
    outfit: {
      judulLook: "Proportion-Balanced Earthy Tailoring",
      atasan,
      outerwear,
      bawahan,
      alasKaki,
      aksesori: ["Jam tangan minimalis kulit", "Tote bag kulit berstruktur"],
      paletWarna: [
        { nama: "Ivory White", hex: "#FAF9F6" },
        { nama: "Sand Beige", hex: "#D8C3A5" },
        { nama: "Charcoal Noir", hex: "#2B2D42" }
      ]
    },
    alasanAI: "Kombinasi atasan linen putih dan blazer oversized dari lemari Anda menciptakan garis vertikal yang memperpanjang siluet tubuh, serasi dengan kontras celana charcoal yang merampingkan garis kaki.",
    tipsStyling: "Gunakan teknik half-tuck pada kemeja untuk menonjolkan garis pinggang tanpa mengurangi kenyamanan rileks.",
    saranArahBelanja: "Sabuk kulit minimalis warna senada sepatu untuk mempertegas transisi torso dan kaki.",
    shoppingRecommendation: enrichShoppingRecommendation({
      missingItem: "Minimalist Leather Belt & Loafers",
      kategori: "aksesori",
      icon: "👜",
      alasanKebutuhan: "Sabuk kulit minimalis mempertegas proporsi torso-kaki dan menyeimbangkan warna sepatu."
    }, { judulLook: "Proportion-Balanced Earthy Tailoring" }, wardrobeItems, konteks)
  };
}

async function callGeminiPhotoMatcher({ apiKey, model, imageBase64, mimeType = 'image/jpeg', konteks, wardrobeItems, profile }) {
  if (!apiKey || apiKey.trim() === '' || !GoogleGenAI) {
    throw new Error('No API key provided or SDK not ready.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const cleanBase64 = imageBase64.includes('base64,')
    ? imageBase64.split('base64,')[1]
    : imageBase64;

  const wardrobeListStr = wardrobeItems && wardrobeItems.length > 0
    ? JSON.stringify(wardrobeItems.map(i => ({ id: i.id, kategori: i.kategori, nama: i.nama, warna: i.warna, tag: i.tag })), null, 2)
    : 'Lemari pakaian belum ada item tersimpan.';

  const bodyProfileInfo = profile ? `
PROFIL & PROPORSI DEKLARASI PENGGUNA:
- Tinggi Badan: ${profile.tinggiBadan || profile.preferensi?.tinggiBadan || 165} cm
- Berat Badan: ${profile.beratBadan || profile.preferensi?.beratBadan || 54} kg
- Bentuk Tubuh: ${profile.bentukTubuh || profile.preferensi?.bentukTubuh || 'Jam Pasir (Hourglass)'}
- Ukuran Busana: ${profile.ukuranBaju || profile.preferensi?.ukuranBaju || 'M'}
- Catatan Proporsi: ${profile.catatanProporsi || profile.preferensi?.catatanProporsi || 'Garis pinggang terdefinisi'}
` : '';

  const prompt = `
Anda adalah Pakar Personal Styling & Konsultan Proporsi Tubuh berkelas dunia ("Padu Padan AI Vision").
Foto pengguna telah dilampirkan (selfie atau full-body).
${bodyProfileInfo}
TUGAS ANDA:
1. EVALUASI FOTO PENGGUNA:
   - Evaluasi Siluet & Proporsi Tubuh (misal: struktur bahu, garis leher, rasio torso-kaki, kecocokan potongan busana).
   - Evaluasi Rona Kulit & Undertone (Warm, Cool, atau Neutral undertone) serta palet warna yang membuat wajah bersinar.
   - Evaluasi Karakter Visual / Personal Style yang terpancar dari foto.

2. PENCOCOKAN DENGAN LEMARI PAKAIAN PENGGUNA:
   Berikut adalah daftar pakaian yang SUDAH DIMILIKI pengguna di lemarinya:
${wardrobeListStr}

   PENTING:
   - Pilih dan padankan item outfit (atasan, bawahan, alas kaki, dan outerwear jika sesuai) UTAMANYA DARI LEMARI PENGGUNA di atas yang paling menyempurnakan proporsi tubuh dan undertone kulitnya!
   - Sesuaikan dengan konteks acara: "${konteks.acara || 'Sehari-hari / Kasual'}"
   - Cuaca: "${konteks.cuaca || 'Normal'}"
   - Catatan Pengguna: "${konteks.catatanPengguna || '-'}"

3. STRUKTUR HASIL DALAM FORMAT JSON VALID:
{
  "evaluasiFoto": {
    "proporsiTubuh": "Penjelasan analisis proporsi tubuh dan siluet yang tampak dari foto...",
    "undertoneWarna": "Analisis rona kulit (misal: Warm Golden / Cool Rosy) dan rekomendasi spektrum warna terbaik...",
    "karakterVisual": "Kesan gaya personal yang terpancar dari aura foto..."
  },
  "outfit": {
    "judulLook": "Nama look yang puitis dan keren",
    "atasan": "Item atasan terpilih dari lemari",
    "outerwear": "Item outerwear dari lemari jika ada / sesuai",
    "bawahan": "Item bawahan terpilih dari lemari",
    "alasKaki": "Item sepatu terpilih dari lemari",
    "aksesori": ["Aksesori 1", "Aksesori 2"],
    "paletWarna": [
      { "nama": "Nama Warna 1", "hex": "#HEXCODE" },
      { "nama": "Nama Warna 2", "hex": "#HEXCODE" },
      { "nama": "Nama Warna 3", "hex": "#HEXCODE" }
    ]
  },
  "alasanAI": "Penjelasan mendalam mengapa kombinasi pakaian lemari ini sangat menunjang proporsi tubuh dan warna kulit pada foto...",
  "tipsStyling": "Tips trik pemakaian khusus proporsi (misal teknik french tuck, proporsi celana, aksen bahu)...",
  "saranArahBelanja": "Saran 1 item kunci pelengkap jika ada elemen yang belum ada di lemari..."
}
`;

  const { response } = await generateWithGeminiFallback(ai, {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  }, model);

  const responseText = cleanJsonString(response.text);
  const parsed = JSON.parse(responseText);

  parsed.shoppingRecommendation = enrichShoppingRecommendation(
    parsed.shoppingRecommendation,
    parsed,
    wardrobeItems,
    konteks
  );

  return parsed;
}

// -------------------------------------------------------------
// Gemini Vision "See Something I Like" Outfit Recreator
// -------------------------------------------------------------
function generateCuratedSeeSomethingILike({ konteks = {}, wardrobeItems = [] }) {
  const atasan = wardrobeItems.find(i => i.kategori === 'atasan') || { nama: 'Kaos Oversized Katun Charcoal', warna: 'Charcoal' };
  const bawahan = wardrobeItems.find(i => i.kategori === 'bawahan') || { nama: 'Pleated Ankle Trousers Charcoal Grey', warna: 'Charcoal' };
  const alasKaki = wardrobeItems.find(i => i.kategori === 'alasKaki') || { nama: 'Leather Penny Loafers Dark Brown', warna: 'Dark Brown' };
  const outerwear = wardrobeItems.find(i => i.kategori === 'outerwear') || null;

  const styleDetected = konteks.presetStyle || 'Casual Streetwear';

  return {
    styleDetected,
    styleDescription: "Siluet santai modern dengan perpaduan atasan boxy rileks dan bawahan lurus berstruktur yang memberikan proporsi effortlessly cool.",
    spottedOutfit: {
      atasan: "Oversized Vintage Washed Graphic Tee (Charcoal/Washed Grey)",
      bawahan: "Wide-Leg Relaxed Fit Cargo Trousers (Olive Drab)",
      alasKaki: "Chunky Retro Sneakers (White & Cream)",
      outerwear: "None (Clean Layering)",
      aksesori: ["Crossbody sling bag", "Silver chain necklace", "Retro sunglasses"]
    },
    closetChecklist: [
      {
        category: "Similar Shirt",
        categoryIndo: "Atasan / Baju",
        matched: true,
        spottedPiece: "Oversized Boxy Tee Charcoal",
        closetItem: atasan.nama,
        matchScore: 92,
        statusLabel: "✅ Cocok di Lemari",
        note: "Potongan boxy drop-shoulder dan tone warna senada 92% identik dengan foto inspirasi."
      },
      {
        category: "Similar Pants",
        categoryIndo: "Bawahan / Celana",
        matched: true,
        spottedPiece: "Wide-Leg / Relaxed Trousers",
        closetItem: bawahan.nama,
        matchScore: 86,
        statusLabel: "✅ Cocok di Lemari",
        note: "Siluet drape lurus memberikan garis jatuh kaki yang santai dan proporsional."
      },
      {
        category: "Similar Shoes",
        categoryIndo: "Alas Kaki / Sepatu",
        matched: false,
        spottedPiece: "Chunky Retro Street Sneakers White/Cream",
        closetItem: alasKaki.nama,
        matchScore: 48,
        statusLabel: "❌ Belum Ada di Lemari",
        note: `Lemari Anda saat ini memiliki ${alasKaki.nama}. Disarankan sepatu chunky sneakers untuk mencapai kemiripan 100%.`
      },
      ...(outerwear ? [{
        category: "Similar Outerwear",
        categoryIndo: "Outerwear / Luaran",
        matched: true,
        spottedPiece: "Optional Light Outerwear",
        closetItem: outerwear.nama,
        matchScore: 80,
        statusLabel: "✅ Ada Alternatif",
        note: "Bisa dipadukan saat cuaca lebih dingin sebagai aksen layer modern."
      }] : [])
    ],
    recreatedOutfit: {
      judulLook: `Recreated ${styleDetected}`,
      atasan: atasan.nama,
      outerwear: outerwear ? outerwear.nama : '',
      bawahan: bawahan.nama,
      alasKaki: alasKaki.nama,
      aksesori: ["Jam tangan kasual", "Sling bag kanvas minimalis"],
      paletWarna: [
        { nama: "Charcoal Ash", hex: "#2E3033" },
        { nama: "Muted Olive", hex: "#556B2F" },
        { nama: "Off White", hex: "#F8F6F0" }
      ]
    },
    closetMatchScore: 88,
    tipsToNailTheLook: "1. Gunakan trik half-tuck di bagian depan kaos untuk menegaskan garis pinggang.\n2. Biarkan hem celana jatuh tepat di atas sepatu tanpa dilipat kaku agar menghasilkan siluet puddle yang santai.\n3. Tambahkan aksesori minimalis perak atau kalung rantai tipis untuk menyempurnakan streetwear vibe.",
    missingGapItem: {
      missingItem: "Chunky Retro Sneakers (White/Cream)",
      kategori: "alasKaki",
      icon: "👟",
      alasanKebutuhan: "Sepatu sneakers chunky sol tebal adalah elemen kunci untuk menyempurnakan proporsi streetwear look ini hingga 100% identik."
    },
    shoppingRecommendation: enrichShoppingRecommendation({
      missingItem: "Chunky Retro Sneakers (White/Cream)",
      kategori: "alasKaki",
      icon: "👟",
      alasanKebutuhan: "Sepatu sneakers chunky sol tebal menyempurnakan proporsi streetwear look ini hingga 100% identik."
    }, { judulLook: `Recreated ${styleDetected}` }, wardrobeItems, konteks)
  };
}

async function callGeminiSeeSomethingILike({ apiKey, model, imageBase64, mimeType = 'image/jpeg', wardrobeItems, profile, konteks }) {
  if (!apiKey || apiKey.trim() === '' || !GoogleGenAI) {
    throw new Error('No API key provided or SDK not ready.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const cleanBase64 = imageBase64.includes('base64,')
    ? imageBase64.split('base64,')[1]
    : imageBase64;

  const wardrobeListStr = wardrobeItems && wardrobeItems.length > 0
    ? JSON.stringify(wardrobeItems.map(i => ({ id: i.id, kategori: i.kategori, nama: i.nama, warna: i.warna, tag: i.tag })), null, 2)
    : 'Lemari pakaian belum ada item tersimpan.';

  const prompt = `
Anda adalah Pakar Personal Styling & Visual Inspo Recreator kelas dunia ("See Something I Like" AI Stylist).
Foto yang dilampirkan adalah FOTO INSPIRASI OUTFIT yang dilihat dan disukai oleh pengguna (misalnya pakaian seseorang di jalan, Pinterest, Instagram, majalah fashion).

DAFTAR PAKAIAN ASLI DI LEMARI PENGGUNA SAAT INI:
${wardrobeListStr}

TUGAS ANDA:
1. DETEKSI GAYA (Style Detected):
   - Deteksi gaya busana utama pada foto (misal: "Casual Streetwear", "Quiet Luxury Minimalist", "Old Money Tailoring", "Korean Soft Casual", "Effortless Parisian Chic", "Y2K Retro Grunge", dll).
   - Jelaskan secara singkat (1-2 kalimat) estetika dan daya tarik utama dari look ini.
   - Uraikan item-item kunci yang dikenakan orang dalam foto (atasan, bawahan, alas kaki, outerwear jika ada, aksesori).

2. ANALISIS "YOUR CLOSET" (Checklist Kecocokan Lemari):
   Lakukan perbandingan detail setiap item kunci pada foto dengan pakaian yang SUDAH DIMILIKI pengguna di lemarinya:
   - Evaluasi apakah pengguna memiliki:
     a) Similar Shirt / Top (Atasan yang mirip): Apakah ada yang serupa di lemari? (matched: true/false)
     b) Similar Pants / Bottom (Bawahan yang mirip): Apakah ada yang serupa di lemari? (matched: true/false)
     c) Similar Shoes (Sepatu yang mirip): Apakah ada yang serupa di lemari? (matched: true/false)
     d) Similar Outerwear / Accessories jika relevan pada foto.
   - Untuk setiap kategori berikan:
     * category (e.g. "Similar Shirt", "Similar Pants", "Similar Shoes")
     * categoryIndo (e.g. "Atasan / Baju", "Bawahan / Celana", "Alas Kaki / Sepatu")
     * matched (boolean true jika ada yang mirip, false jika tidak ada / missing)
     * spottedPiece (deskripsi potongan di foto)
     * closetItem (nama item pakaian dari lemari pengguna yang paling cocok, atau "Tidak ada di lemari" jika false)
     * matchScore (angka persentase 0-100)
     * statusLabel (misal "✅ Cocok di Lemari" atau "❌ Belum Ada di Lemari")
     * note (penjelasan singkat mengapa cocok atau mengapa kurang pas)

3. CIPTAKAN OUTFIT PALING MENDEKATI DARI APA YANG DIMILIKI PENGGUNA (Closest Outfit From What They Own):
   - Pilih kombinasi pakaian TERBAIK DARI LEMARI PENGGUNA untuk merekayasa ulang gaya dari foto tersebut semirip mungkin.
   - Tentukan judul look (misal "Recreated Casual Streetwear").
   - Pilih atasan, bawahan, alas kaki, outerwear (jika ada), dan aksesori DARI LEMARI PENGGUNA.
   - Ekstrak 3 warna palet kunci (nama dan hex).
   - Hitung closetMatchScore keseluruhan (angka 0-100).

4. CARA MENIRU SILUET (Tips to Nail the Look):
   - Berikan tips praktis styling (cara melipat, tuck-in, padanan aksesoris, proporsi gulungan celana/lengan) agar baju yang dimiliki pengguna menghasilkan siluet & vibe yang sama persis dengan foto.

5. IDENTIFIKASI PIECE YANG HILANG (Missing Gap Item):
   - Jika ada item yang ❌ (belum ada di lemari), sebutkan 1 item kunci yang paling dibutuhkan untuk melengkapi look ini hingga 100% sempurna, beserta alasannya.

Format Output WAJIB JSON VALID tanpa markdown berlebih:
{
  "styleDetected": "Casual Streetwear",
  "styleDescription": "Deskripsi singkat daya tarik gaya...",
  "spottedOutfit": {
    "atasan": "Deskripsi atasan pada foto",
    "bawahan": "Deskripsi bawahan pada foto",
    "alasKaki": "Deskripsi alas kaki pada foto",
    "outerwear": "Deskripsi outerwear atau None",
    "aksesori": ["Aksesori 1", "Aksesori 2"]
  },
  "closetChecklist": [
    {
      "category": "Similar Shirt",
      "categoryIndo": "Atasan / Baju",
      "matched": true,
      "spottedPiece": "Oversized Boxy Tee Charcoal",
      "closetItem": "Nama item dari lemari",
      "matchScore": 92,
      "statusLabel": "✅ Cocok di Lemari",
      "note": "Alasan kemiripan..."
    },
    {
      "category": "Similar Pants",
      "categoryIndo": "Bawahan / Celana",
      "matched": true,
      "spottedPiece": "Wide-Leg Trousers Olive",
      "closetItem": "Nama item dari lemari",
      "matchScore": 88,
      "statusLabel": "✅ Cocok di Lemari",
      "note": "Alasan kemiripan..."
    },
    {
      "category": "Similar Shoes",
      "categoryIndo": "Alas Kaki / Sepatu",
      "matched": false,
      "spottedPiece": "Chunky White Sneakers",
      "closetItem": "Nama sepatu di lemari (atau Tidak ada di lemari)",
      "matchScore": 40,
      "statusLabel": "❌ Belum Ada di Lemari",
      "note": "Alasan tidak ada / perbedaan..."
    }
  ],
  "recreatedOutfit": {
    "judulLook": "Recreated Casual Streetwear",
    "atasan": "Item atasan dari lemari",
    "outerwear": "Item outerwear dari lemari atau kosong",
    "bawahan": "Item bawahan dari lemari",
    "alasKaki": "Item sepatu dari lemari",
    "aksesori": ["Aksesori 1", "Aksesori 2"],
    "paletWarna": [
      { "nama": "Warna 1", "hex": "#HEX" },
      { "nama": "Warna 2", "hex": "#HEX" },
      { "nama": "Warna 3", "hex": "#HEX" }
    ]
  },
  "closetMatchScore": 85,
  "tipsToNailTheLook": "Panduan trik styling...",
  "missingGapItem": {
    "missingItem": "Chunky Retro Sneakers",
    "kategori": "alasKaki",
    "icon": "👟",
    "alasanKebutuhan": "Sepatu ini melengkapi siluet streetwear menjadi 100% sempurna."
  }
}
`;

  const { response } = await generateWithGeminiFallback(ai, {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  }, model);

  const responseText = cleanJsonString(response.text);
  const parsed = JSON.parse(responseText);

  parsed.shoppingRecommendation = enrichShoppingRecommendation(
    parsed.missingGapItem ? {
      missingItem: parsed.missingGapItem.missingItem,
      kategori: parsed.missingGapItem.kategori,
      icon: parsed.missingGapItem.icon || '🛍️',
      alasanKebutuhan: parsed.missingGapItem.alasanKebutuhan
    } : null,
    { outfit: parsed.recreatedOutfit, judulLook: parsed.recreatedOutfit?.judulLook },
    wardrobeItems,
    konteks
  );

  return parsed;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------


// 1. Health check & status
app.get('/api/health', (req, res) => {
  const clientKey = req.headers['x-gemini-key'];
  const hasBackendKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasKey = Boolean(clientKey || hasBackendKey);

  res.json({
    status: 'ok',
    geminiKeyConfigured: hasKey,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    serverTime: new Date().toISOString()
  });
});

// 2. Profile endpoints (FR-1)
app.get('/api/profile/:id', async (req, res) => {
  try {
    const profiles = await readJsonFile(PROFILES_FILE);
    const userProfile = profiles.find(p => p.id === req.params.id) || profiles[0] || null;
    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const newProfile = req.body;
    const profiles = await readJsonFile(PROFILES_FILE);
    const existingIndex = profiles.findIndex(p => p.id === (newProfile.id || 'usr_default'));

    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...newProfile, diubahPada: new Date().toISOString() };
    } else {
      newProfile.id = newProfile.id || `usr_${Date.now()}`;
      newProfile.dibuatPada = new Date().toISOString();
      profiles.push(newProfile);
    }

    await writeJsonFile(PROFILES_FILE, profiles);
    res.json(existingIndex >= 0 ? profiles[existingIndex] : newProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Wardrobe endpoints (FR-6)
app.get(['/api/wardrobe', '/api/wardrobe/:userId'], async (req, res) => {
  try {
    const userId = req.params.userId || 'usr_default';
    const wardrobe = await readJsonFile(WARDROBE_FILE);
    const userItems = wardrobe.filter(item => !item.userId || item.userId === userId || item.userId === 'usr_default');
    res.json(userItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wardrobe', async (req, res) => {
  try {
    const itemData = req.body;
    const wardrobe = await readJsonFile(WARDROBE_FILE);

    const newItem = {
      id: `item_${Date.now()}`,
      userId: itemData.userId || 'usr_default',
      kategori: itemData.kategori || 'atasan',
      nama: itemData.nama,
      warna: itemData.warna,
      warnaHex: itemData.warnaHex || '#C5A880',
      tag: itemData.tag || [],
      catatan: itemData.catatan || '',
      dibuatPada: new Date().toISOString()
    };

    wardrobe.unshift(newItem);
    await writeJsonFile(WARDROBE_FILE, wardrobe);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/wardrobe/:id', async (req, res) => {
  try {
    const wardrobe = await readJsonFile(WARDROBE_FILE);
    const filtered = wardrobe.filter(item => item.id !== req.params.id);
    await writeJsonFile(WARDROBE_FILE, filtered);
    res.json({ success: true, deletedId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Curated Capsule Wardrobe Gap Candidates for Varied Missing Piece Recommendations
const CAPSULE_GAP_CANDIDATES = [
  // Outerwear
  {
    missingItem: 'Lightweight Black Utility Jacket',
    kategori: 'outerwear',
    icon: '🧥',
    alasanKebutuhan: 'Outerwear ringan berpotongan fleksibel untuk layering cerdas yang menaikkan kelas tampilan kasual Anda.'
  },
  {
    missingItem: 'Unlined Linen Blend Blazer',
    kategori: 'outerwear',
    icon: '🧥',
    alasanKebutuhan: 'Blazer linen tanpa furing yang sejuk, memberikan struktur formal instan tanpa rasa gerah di cuaca tropis.'
  },
  {
    missingItem: 'Structured Wool-Touch Overshirt',
    kategori: 'outerwear',
    icon: '🧥',
    alasanKebutuhan: 'Overshirt bertekstur tebal yang sangat versatile sebagai luaran santai atau kancing tertutup untuk gaya minimalis.'
  },
  {
    missingItem: 'Minimalist Suede Bomber Jacket',
    kategori: 'outerwear',
    icon: '🧥',
    alasanKebutuhan: 'Jaket bomber bersentuhan suede matte warna netral yang mempertegas siluet bahu dan tampilan smart casual.'
  },
  {
    missingItem: 'Tailored Trench Coat Sand Beige',
    kategori: 'outerwear',
    icon: '🧥',
    alasanKebutuhan: 'Trench coat klasik warna sand yang timeless, sempurna untuk proteksi cuaca berangin dan statement gaya berkelas.'
  },
  {
    missingItem: 'Fine-Gauge Charcoal Cardigan',
    kategori: 'outerwear',
    icon: '🧶',
    alasanKebutuhan: 'Kardigan rajut halus yang mudah dipadukan di ruangan ber-AC, memberikan siluet layering rapi nan nyaman.'
  },

  // Footwear (Alas Kaki)
  {
    missingItem: 'Classic Leather Penny Loafers',
    kategori: 'alasKaki',
    icon: '👞',
    alasanKebutuhan: 'Alas kaki esensial yang menghubungkan gaya kasual dan semi-formal dengan siluet bersih tanpa tali.'
  },
  {
    missingItem: 'Minimalist White Leather Sneakers',
    kategori: 'alasKaki',
    icon: '👟',
    alasanKebutuhan: 'Sneakers putih berbahan kulit berdesain sleek dan bersih yang dapat dipasangkan dengan 90% isi lemari Anda.'
  },
  {
    missingItem: 'Espresso Suede Chelsea Boots',
    kategori: 'alasKaki',
    icon: '👢',
    alasanKebutuhan: 'Sepatu bot ramping berbahan suede cokelat gelap yang memberi elevasi maskulin/feminin yang berkelas.'
  },
  {
    missingItem: 'Chunky Retro Runner Sneakers',
    kategori: 'alasKaki',
    icon: '👟',
    alasanKebutuhan: 'Sepatu lari bergaya retro modern dengan bantalan empuk, ideal untuk paduan streetwear dan celana tailored.'
  },
  {
    missingItem: 'Mule Slip-On Loafers Earth Tone',
    kategori: 'alasKaki',
    icon: '🥿',
    alasanKebutuhan: 'Sepatu selop santai dengan detail berkelas, sangat praktis untuk tampilan effortless chic sehari-hari.'
  },

  // Bottoms (Bawahan)
  {
    missingItem: 'Pleated High-Waisted Wide Trousers',
    kategori: 'bawahan',
    icon: '👖',
    alasanKebutuhan: 'Celana berpotongan lebar dengan lipitan depan yang membuat ilusi kaki lebih jenjang dan proporsi tubuh seimbang.'
  },
  {
    missingItem: 'Straight-Leg Indigo Selvedge Denim',
    kategori: 'bawahan',
    icon: '👖',
    alasanKebutuhan: 'Jeans potongan lurus warna gelap tanpa washing berlebihan, fondasi kasual rapi yang sangat tahan lama.'
  },
  {
    missingItem: 'Tailored Drawstring Linen Trousers',
    kategori: 'bawahan',
    icon: '👖',
    alasanKebutuhan: 'Celana linen dengan pinggang serut rapi yang menggabungkan kenyamanan maksimal dan siluet resort elegan.'
  },
  {
    missingItem: 'Cropped Tailored Chinos Camel',
    kategori: 'bawahan',
    icon: '👖',
    alasanKebutuhan: 'Chino warna camel hangat dengan panjang pergelangan kaki, memperlihatkan alas kaki secara proporsional.'
  },

  // Tops & Knitwear (Atasan)
  {
    missingItem: 'Merino Wool Knit Polo (Navy / Sage)',
    kategori: 'atasan',
    icon: '👕',
    alasanKebutuhan: 'Kaos polo rajut halus bernuansa Old Money yang langsung menaikkan aura santai menjadi sangat berkelas.'
  },
  {
    missingItem: 'Relaxed Silk-Blend Camp Collar Shirt',
    kategori: 'atasan',
    icon: '👔',
    alasanKebutuhan: 'Kemeja kerah terbuka bernuansa kasual mewah yang memberi sirkulasi udara optimal dan vibe artistik santai.'
  },
  {
    missingItem: 'Heavyweight Off-White Boxy Tee',
    kategori: 'atasan',
    icon: '👕',
    alasanKebutuhan: 'Kaos katun tebal potongan boxy yang tidak tembus pandang dan menjaga siluet dada tetap proporsional.'
  },

  // Accessories & Bags (Aksesori)
  {
    missingItem: 'Structured Leather Crossbody Bag',
    kategori: 'aksesori',
    icon: '👜',
    alasanKebutuhan: 'Tas selempang kulit berstruktur kokoh dengan siluet minimalis, praktis membawa barang esensial harian dengan gaya.'
  },
  {
    missingItem: 'Woven Leather Belt with Brass Buckle',
    kategori: 'aksesori',
    icon: '🎗️',
    alasanKebutuhan: 'Ikat pinggang anyaman kulit fleksibel yang menjadi penegas garis pinggang dan pembagi proporsi tubuh.'
  }
];

// 3b. Wardrobe Gap Analysis (FR-Shopping) - Supports Dynamic Variations on Refresh
app.get('/api/wardrobe/gap-analysis/:userId', async (req, res) => {
  try {
    const wardrobe = await readJsonFile(WARDROBE_FILE);
    const userItems = wardrobe.filter(item => !item.userId || item.userId === req.params.userId || item.userId === 'usr_default');

    // Filter out items the user already heavily owns
    const ownedNames = userItems.map(i => (i.nama || '').toLowerCase());
    const available = CAPSULE_GAP_CANDIDATES.filter(c => {
      const cName = c.missingItem.toLowerCase();
      return !ownedNames.some(owned => owned.includes(cName) || cName.includes(owned));
    });

    const pool = available.length >= 2 ? available : CAPSULE_GAP_CANDIDATES;

    // Group items by category to pick diverse items from different categories
    const categoryGroups = {};
    pool.forEach(item => {
      if (!categoryGroups[item.kategori]) categoryGroups[item.kategori] = [];
      categoryGroups[item.kategori].push(item);
    });

    const shuffledCategories = Object.keys(categoryGroups).sort(() => Math.random() - 0.5);
    const selectedPicks = [];

    // Pick 1 from the first random category
    if (shuffledCategories.length > 0) {
      const itemsCat1 = categoryGroups[shuffledCategories[0]];
      selectedPicks.push(itemsCat1[Math.floor(Math.random() * itemsCat1.length)]);
    }

    // Pick 1 from the second random category
    if (shuffledCategories.length > 1) {
      const itemsCat2 = categoryGroups[shuffledCategories[1]];
      selectedPicks.push(itemsCat2[Math.floor(Math.random() * itemsCat2.length)]);
    }

    // Fallback if needed to ensure 2 distinct recommendations
    if (selectedPicks.length < 2) {
      const remaining = pool.filter(p => !selectedPicks.some(s => s.missingItem === p.missingItem));
      if (remaining.length > 0) {
        selectedPicks.push(remaining[Math.floor(Math.random() * remaining.length)]);
      }
    }

    const gaps = selectedPicks.map(candidate => {
      return enrichShoppingRecommendation(
        candidate,
        { judulLook: 'Capsule Wardrobe Essentials' },
        userItems
      );
    });

    res.json({
      userId: req.params.userId,
      totalWardrobeItems: userItems.length,
      timestamp: Date.now(),
      gaps
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Recommendation generation (FR-2, FR-3)
app.post('/api/recommendation', async (req, res) => {
  try {
    const { userId = 'usr_default', konteks = {}, wardrobeItems = [], profile = null, lang = req.headers['x-lang'] || profile?.preferensi?.bahasa || 'id' } = req.body;
    const clientKey = req.headers['x-gemini-key'];
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    let outfitResult = null;
    let isAIGenerated = false;

    // Try Gemini API first if key available
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        outfitResult = await callGeminiForOutfit({
          apiKey,
          model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
          konteks,
          wardrobeItems,
          profile,
          lang
        });
        isAIGenerated = true;
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to curated stylist:', geminiErr.message);
      }
    }

    // Fallback to high-end curated engine if Gemini unavailable
    if (!outfitResult) {
      outfitResult = generateCuratedStylistOutfit({ konteks, wardrobeItems, profile });
    }

    // Wrap into recommendation document
    const newRecommendation = {
      id: `rec_${Date.now()}`,
      userId,
      konteks,
      outfit: {
        judulLook: outfitResult.judulLook,
        atasan: outfitResult.atasan,
        outerwear: outfitResult.outerwear || '',
        bawahan: outfitResult.bawahan,
        alasKaki: outfitResult.alasKaki,
        aksesori: outfitResult.aksesori || [],
        paletWarna: outfitResult.paletWarna || []
      },
      alasanAI: outfitResult.alasanAI,
      tipsStyling: outfitResult.tipsStyling,
      saranArahBelanja: outfitResult.saranArahBelanja || '',
      shoppingRecommendation: outfitResult.shoppingRecommendation || enrichShoppingRecommendation(null, outfitResult, wardrobeItems, konteks),
      favorit: false,
      isAIGenerated,
      dibuatPada: new Date().toISOString()
    };

    // Save to rekomendasi.json
    const allRecs = await readJsonFile(REKOMENDASI_FILE);
    allRecs.unshift(newRecommendation);
    await writeJsonFile(REKOMENDASI_FILE, allRecs);

    res.json(newRecommendation);
  } catch (err) {
    console.error('Error generating recommendation:', err);
    res.status(500).json({ error: 'Gagal membuat rekomendasi outfit: ' + err.message });
  }
});

// 4b. Photo Outfit Matcher (FR-7 Multimodal Body Proportion & Wardrobe Matching)
app.post('/api/match-photo', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      userId = 'usr_default',
      konteks = {},
      profile = null
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Foto wajib diunggah untuk dianalisis.' });
    }

    const clientKey = req.headers['x-gemini-key'];
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    // Fetch user's saved wardrobe
    const wardrobe = await readJsonFile(WARDROBE_FILE);
    const userWardrobe = wardrobe.filter(item => !item.userId || item.userId === userId || item.userId === 'usr_default');

    let result = null;
    let isAIGenerated = false;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here' && GoogleGenAI) {
      try {
        result = await callGeminiPhotoMatcher({
          apiKey,
          model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
          imageBase64,
          mimeType,
          konteks,
          wardrobeItems: userWardrobe,
          profile
        });
        isAIGenerated = true;
      } catch (geminiErr) {
        console.warn('Gemini photo matching failed, falling back to curated photo matcher:', geminiErr.message);
      }
    }

    if (!result) {
      result = generateCuratedPhotoMatchOutfit({ konteks, wardrobeItems: userWardrobe });
    }

    const newRecommendation = {
      id: `rec_photo_${Date.now()}`,
      userId,
      konteks: {
        ...konteks,
        sumber: 'Photo Outfit Matcher (Gemini Vision)'
      },
      evaluasiFoto: result.evaluasiFoto || null,
      outfit: {
        judulLook: result.outfit?.judulLook || 'Personal Proportion Ensemble',
        atasan: result.outfit?.atasan || 'Atasan dari lemari',
        outerwear: result.outfit?.outerwear || '',
        bawahan: result.outfit?.bawahan || 'Bawahan dari lemari',
        alasKaki: result.outfit?.alasKaki || 'Sepatu dari lemari',
        aksesori: result.outfit?.aksesori || [],
        paletWarna: result.outfit?.paletWarna || []
      },
      alasanAI: result.alasanAI,
      tipsStyling: result.tipsStyling,
      saranArahBelanja: result.saranArahBelanja || '',
      shoppingRecommendation: result.shoppingRecommendation || enrichShoppingRecommendation(null, result, userWardrobe, konteks),
      favorit: false,
      isAIGenerated,
      isPhotoMatched: true,
      dibuatPada: new Date().toISOString()
    };

    // Save to rekomendasi.json
    const allRecs = await readJsonFile(REKOMENDASI_FILE);
    allRecs.unshift(newRecommendation);
    await writeJsonFile(REKOMENDASI_FILE, allRecs);

    res.json(newRecommendation);
  } catch (err) {
    console.error('Error in /api/match-photo:', err);
    res.status(500).json({ error: 'Gagal menganalisis foto: ' + err.message });
  }
});

// 4c. "See Something I Like" Outfit Recreator
app.post('/api/see-something-i-like', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      userId = 'usr_default',
      konteks = {},
      profile = null
    } = req.body;

    if (!imageBase64 && !konteks?.presetStyle) {
      return res.status(400).json({ error: 'Foto outfit inspirasi atau gaya preset wajib dipilih.' });
    }

    const clientKey = req.headers['x-gemini-key'];
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    // Fetch user's saved wardrobe
    const wardrobe = await readJsonFile(WARDROBE_FILE);
    const userWardrobe = wardrobe.filter(item => !item.userId || item.userId === userId || item.userId === 'usr_default');

    let result = null;
    let isAIGenerated = false;

    if (imageBase64 && apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here' && GoogleGenAI) {
      try {
        result = await callGeminiSeeSomethingILike({
          apiKey,
          model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
          imageBase64,
          mimeType,
          wardrobeItems: userWardrobe,
          profile,
          konteks
        });
        isAIGenerated = true;
      } catch (geminiErr) {
        console.warn('Gemini See-Something-I-Like failed, falling back to curated recreator:', geminiErr.message);
      }
    }

    if (!result) {
      result = generateCuratedSeeSomethingILike({ konteks, wardrobeItems: userWardrobe });
    }

    const newRecommendation = {
      id: `rec_inspo_${Date.now()}`,
      userId,
      konteks: {
        ...konteks,
        sumber: '👀 See Something I Like (Inspo Recreator)'
      },
      isSeeSomethingILike: true,
      styleDetected: result.styleDetected || 'Casual Streetwear',
      styleDescription: result.styleDescription || '',
      spottedOutfit: result.spottedOutfit || {},
      closetChecklist: result.closetChecklist || [],
      closetMatchScore: result.closetMatchScore || 85,
      tipsToNailTheLook: result.tipsToNailTheLook || '',
      missingGapItem: result.missingGapItem || null,
      // The original image is sent to Gemini for this request but deliberately
      // not persisted in D1. That keeps private photos out of recommendation
      // history and avoids storing large base64 payloads in the database.
      outfit: {
        judulLook: result.recreatedOutfit?.judulLook || `Recreated ${result.styleDetected || 'Style'}`,
        atasan: result.recreatedOutfit?.atasan || 'Atasan dari lemari',
        outerwear: result.recreatedOutfit?.outerwear || '',
        bawahan: result.recreatedOutfit?.bawahan || 'Bawahan dari lemari',
        alasKaki: result.recreatedOutfit?.alasKaki || 'Sepatu dari lemari',
        aksesori: result.recreatedOutfit?.aksesori || [],
        paletWarna: result.recreatedOutfit?.paletWarna || []
      },
      alasanAI: `AI mendeteksi gaya foto ini sebagai "${result.styleDetected || 'Casual Streetwear'}". Kami mencocokkan setiap potongannya dengan koleksi pakaian di lemarimu untuk menyusun padu padan terdekat yang siap kamu pakai hari ini.`,
      tipsStyling: result.tipsToNailTheLook || 'Gunakan aksesoris pendukung untuk menonjolkan vibe look ini.',
      saranArahBelanja: result.missingGapItem?.alasanKebutuhan || '',
      shoppingRecommendation: result.shoppingRecommendation || enrichShoppingRecommendation(null, result, userWardrobe, konteks),
      favorit: false,
      isAIGenerated,
      dibuatPada: new Date().toISOString()
    };

    // Save to rekomendasi.json
    const allRecs = await readJsonFile(REKOMENDASI_FILE);
    allRecs.unshift(newRecommendation);
    await writeJsonFile(REKOMENDASI_FILE, allRecs);

    res.json(newRecommendation);
  } catch (err) {
    console.error('Error in /api/see-something-i-like:', err);
    res.status(500).json({ error: 'Gagal menganalisis outfit inspirasi: ' + err.message });
  }
});

// 5. Multi-turn Chat Follow-up & Refinement (FR-4)
app.post('/api/recommendation/chat', async (req, res) => {
  try {
    const { pesan, currentOutfit, chatHistory = [], wardrobeItems = [], profile = null } = req.body;
    const clientKey = req.headers['x-gemini-key'];
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    if (!pesan) {
      return res.status(400).json({ error: 'Pesan chat wajib diisi' });
    }

    // Resolve user profile (from body or profiles.json fallback)
    let userProfile = profile;
    if (!userProfile || !userProfile.tinggiBadan) {
      try {
        const savedProfiles = await readJsonFile(PROFILES_FILE);
        userProfile = savedProfiles.find(p => p.id === 'usr_default') || savedProfiles[0] || userProfile;
      } catch (e) {
        // ignore fallback error
      }
    }

    const gender = userProfile?.gender || userProfile?.preferensi?.gender || 'female';
    const isMale = gender === 'male' || gender === 'pria';
    const tinggi = userProfile?.tinggiBadan || userProfile?.preferensi?.tinggiBadan || 165;
    const berat = userProfile?.beratBadan || userProfile?.preferensi?.beratBadan || 54;
    const bentukTubuh = userProfile?.bentukTubuh || userProfile?.preferensi?.bentukTubuh || (isMale ? 'Trapezoid / Atletis' : 'Jam Pasir (Hourglass)');
    const ukuranBaju = userProfile?.ukuranBaju || userProfile?.preferensi?.ukuranBaju || 'M';
    const catatanProporsi = userProfile?.catatanProporsi || userProfile?.preferensi?.catatanProporsi || '';
    const gayaFavorit = (userProfile?.preferensi?.gayaFavorit || []).join(', ') || 'Smart Casual, Minimalis';
    const warnaFavorit = (userProfile?.preferensi?.warnaFavorit || []).join(', ') || 'Neutral Earth Tones & Monochrome';
    const namaUser = userProfile?.namaOpsional || (isMale ? 'Alex' : 'Rani');
    const lang = req.body.lang || req.headers['x-lang'] || userProfile?.preferensi?.bahasa || 'id';

    // If Gemini key is available, use Gemini for conversational stylist
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here' && GoogleGenAI) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const langDirective = lang === 'en'
          ? '1. Language: English. Keep the tone warm, natural, friendly, and concise.'
          : '1. Bahasa: Bahasa Indonesia. Gunakan gaya bahasa yang ramah, santun, natural, dan ringkas.';

        const chatPrompt = `
Anda adalah Personal Digital Stylist bernama "Padu Padan AI".
Pengguna sedang berkomunikasi dengan Anda melalui pesan teks / asisten suara.

PROFIL PENGGUNA (HANYA gunakan jika pengguna meminta tips yang relevan):
- Nama: ${namaUser}
- Gender: ${isMale ? 'Pria (Male)' : 'Wanita (Female)'}
- Tinggi: ${tinggi} cm | Berat: ${berat} kg | Bentuk Tubuh: ${bentukTubuh} | Ukuran: ${ukuranBaju}
- Preferensi Gaya: ${gayaFavorit}
- Warna Favorit: ${warnaFavorit}

LOOK AKTIF DI STUDIO (HANYA gunakan jika pengguna menanyakan atau ingin mengubah look ini):
${currentOutfit ? JSON.stringify(currentOutfit.outfit, null, 2) : 'Belum ada look aktif.'}

RIWAYAT CHAT:
${chatHistory.slice(-6).map(m => `${m.sender}: ${m.text}`).join('\n')}

PESAN TERBARU PENGGUNA:
"${pesan}"

ATURAN UTAMA & RESPON INTENT (SANGAT PENTING):
${langDirective}

2. ATURAN KETAT UNTUK PESAN BUKAN REKOMENDASI PAKAIAN (Sapaan, Terima Kasih, Small Talk, Pertanyaan Umum):
   - Jika pengguna HANYA MENYAPA (misal: "hello", "hi", "halo", "selamat pagi", "hey", "p", "halo ai", dsb.):
     * Berikan balasan yang SINGKAT, RAMAH, dan SEDERHANA (MAKSIMAL 1-2 KALIMAT).
     * Sapa nama pengguna dengan hangat dan tanyakan secara santai apa yang bisa dibantu hari ini.
     * CONTOH JAWABAN: "Halo ${namaUser}! Senang menyapamu. Ada yang bisa kubantu untuk styling atau paduan outfitmu hari ini? ✨"
     * DILARANG KERAS: JANGAN menyebutkan data fisik (tinggi ${tinggi} cm, berat badan, bentuk tubuh ${bentukTubuh}) jika tidak ditanya!
     * DILARANG KERAS: JANGAN membedah atau menganalisis look aktif/pakaian saat ini jika pengguna TIDAK memintanya!
     * DILARANG KERAS: JANGAN memberikan rekomendasi busana panjang lebar ("yapping") jika pengguna belum meminta outfit!
     * Pastikan "adaRevisiOutfit": false dan "updatedOutfit": null.

   - Jika pengguna mengucapkan terima kasih, konfirmasi, atau obrolan santai (misal: "terima kasih", "makasih", "keren", "oke", "siap", "noted"):
     * Jawab dengan singkat, bersahabat, dan natural (1 kalimat).
     * Set "adaRevisiOutfit": false dan "updatedOutfit": null.

   - Jika pengguna menanyakan identitas atau fungsi Anda ("siapa kamu", "kamu bisa apa"):
     * Jelaskan secara ringkas peran Anda sebagai asisten stylist pribadi dalam 1-2 kalimat.
     * Set "adaRevisiOutfit": false dan "updatedOutfit": null.

3. KONSULTASI PROPORSI TUBUH & SILUET:
   - HANYA jika pengguna SECARA EKSPLISIT menanyakan tips berpakaian sesuai bentuk tubuh, tinggi badan, siluet flattering, potongan celana/rok yang memanjangkan kaki, atau ilusi optik:
     * Barulah kaitkan secara personal dengan data profil tubuh pengguna (Tinggi: ${tinggi} cm, Bentuk: ${bentukTubuh}).
     * Berikan tips praktis yang terarah. Jika tidak meminta outfit baru, set "adaRevisiOutfit": false dan "updatedOutfit": null.

4. PERMINTAAN REKOMENDASI OUTFIT ATAU REVISI LOOK:
   - HANYA jika pengguna SECARA EKSPLISIT meminta rekomendasi paduan outfit (misal: "bikinin outfit dinner tanpa jeans", "rekomendasi outfit santai untuk ngopi", "outfit buat meeting formal") ATAU meminta perubahan look aktif (misal: "ganti sepatunya jadi sneakers", "ganti celananya"):
     * Berikan penjelasan padu padan yang stylish, relevan, dan menarik.
     * SET "adaRevisiOutfit": true dan sertakan objek "updatedOutfit" secara LENGKAP.

Kembalikan respons HANYA DALAM FORMAT JSON VALID:
{
  "jawabanChat": "Jawaban ringkas / penjelasan stylist kepada pengguna...",
  "adaRevisiOutfit": true / false,
  "updatedOutfit": {
    "judulLook": "...",
    "atasan": "...",
    "outerwear": "...",
    "bawahan": "...",
    "alasKaki": "...",
    "aksesori": ["..."],
    "paletWarna": [{ "nama": "...", "hex": "..." }],
    "alasanAI": "...",
    "tipsStyling": "...",
    "saranArahBelanja": "..."
  } (Wajib diisi jika adaRevisiOutfit true, jika false wajib diisi null)
}
`;

        const { response } = await generateWithGeminiFallback(ai, {
          contents: chatPrompt,
          config: {
            responseMimeType: "application/json"
          }
        }, process.env.GEMINI_MODEL || DEFAULT_MODEL);

        const responseText = cleanJsonString(response.text);
        const parsed = JSON.parse(responseText);

        if (parsed.adaRevisiOutfit && parsed.updatedOutfit) {
          const allRecs = await readJsonFile(REKOMENDASI_FILE);
          const updatedDoc = {
            id: `rec_${Date.now()}`,
            userId: 'usr_default',
            konteks: currentOutfit ? currentOutfit.konteks : { acara: 'Revisi Chat' },
            outfit: parsed.updatedOutfit,
            alasanAI: parsed.updatedOutfit.alasanAI || parsed.jawabanChat,
            tipsStyling: parsed.updatedOutfit.tipsStyling || '',
            saranArahBelanja: parsed.updatedOutfit.saranArahBelanja || '',
            shoppingRecommendation: parsed.updatedOutfit.shoppingRecommendation || (currentOutfit ? currentOutfit.shoppingRecommendation : enrichShoppingRecommendation(null, parsed.updatedOutfit, wardrobeItems)),
            favorit: false,
            isAIGenerated: true,
            dibuatPada: new Date().toISOString()
          };
          allRecs.unshift(updatedDoc);
          await writeJsonFile(REKOMENDASI_FILE, allRecs);
          return res.json({
            jawabanChat: parsed.jawabanChat,
            updatedOutfit: updatedDoc
          });
        } else {
          return res.json({
            jawabanChat: parsed.jawabanChat,
            updatedOutfit: null
          });
        }
      } catch (err) {
        console.warn('Gemini chat follow-up error, switching to conversational fallback:', err.message);
      }
    }

    // Fallback Chat Handler (Intelligent, Intent-Aware Conversational Engine)
    const pesanLower = pesan.toLowerCase().trim();
    const cleanPesan = pesanLower.replace(/[!?.,;:()_]/g, ' ').replace(/\s+/g, ' ').trim();
    let jawabanChat = '';
    let updatedOutfit = null;

    // 1. Detect greetings (e.g. "hello", "hi", "halo", "hey", "pagi", "hai ai", etc.)
    const greetingWords = ['hello', 'hi', 'hai', 'halo', 'hey', 'helo', 'pagi', 'siang', 'sore', 'malam', 'good morning', 'good afternoon', 'good evening', 'assalamualaikum', 'p'];
    const isExactGreeting = greetingWords.includes(cleanPesan) || cleanPesan.startsWith('halo') || cleanPesan.startsWith('hello') || cleanPesan.startsWith('hai') || cleanPesan.startsWith('hi ') || cleanPesan === 'hi';

    // 2. Detect appreciation / acknowledgements (e.g. "terima kasih", "makasih", "keren", "oke")
    const thanksWords = ['terima kasih', 'makasih', 'thanks', 'thank you', 'thx', 'tq', 'matur nuwun', 'suksema', 'makasi'];
    const ackWords = ['keren', 'bagus', 'mantap', 'oke', 'ok', 'siap', 'noted', 'sip', 'mantul', 'nice', 'great'];
    const isThanks = thanksWords.some(w => cleanPesan.includes(w));
    const isAck = ackWords.includes(cleanPesan);

    // 3. Detect bot info / identity
    const isAboutBot = cleanPesan.includes('siapa kamu') || cleanPesan.includes('kamu siapa') || cleanPesan.includes('bisa apa') || cleanPesan.includes('who are you') || cleanPesan.includes('what can you do');

    if (isExactGreeting) {
      jawabanChat = lang === 'en'
        ? `Hello ${namaUser}! How can I help with your styling or outfit today? ✨`
        : `Halo ${namaUser}! Ada yang bisa kubantu untuk styling atau ide outfitmu hari ini? ✨`;
    } else if (isThanks) {
      jawabanChat = lang === 'en'
        ? `You're welcome, ${namaUser}! Let me know whenever you need more outfit ideas or styling advice.`
        : `Sama-sama, ${namaUser}! Senang bisa membantu. Beri tahu aku kapan pun kamu butuh ide outfit atau tips styling lainnya ya! 😊`;
    } else if (isAck) {
      jawabanChat = lang === 'en'
        ? `Glad you like it, ${namaUser}! Feel free to let me know if you want to tweak anything else.`
        : `Senang kamu menyukainya, ${namaUser}! Beri tahu aku jika ada detail lain yang ingin kamu sesuaikan.`;
    } else if (isAboutBot) {
      jawabanChat = lang === 'en'
        ? `I am Padu Padan AI, your personal digital stylist. You can ask me for outfit suggestions, body proportion tips, or revisions to your look!`
        : `Halo! Saya Padu Padan AI, asisten stylist pribadimu. Kamu bisa memintaku rekomendasi outfit untuk berbagai acara, tips siluet tubuh, atau mengubah look aktifmu. ✨`;
    }
    // 4. Voice Stylist request: dinner outfit without jeans
    else if (cleanPesan.includes('dinner') || cleanPesan.includes('makan malam') || (cleanPesan.includes('jeans') && (cleanPesan.includes('dont') || cleanPesan.includes("don't") || cleanPesan.includes('tanpa') || cleanPesan.includes('bukan') || cleanPesan.includes('not') || cleanPesan.includes('tidak')))) {
      jawabanChat = `Tentu! Untuk makan malam malam ini tanpa celana jeans, saya telah meracik tampilan Smart Evening Casual yang elegan namun tetap effortless. Saya pasangkan Pleated Ankle Trousers warna charcoal grey yang rapi dan nyaman, kemeja berkerah minimalis, serta blazer sand beige yang memberi sentuhan berkelas. Sepatu leather loafers dark brown menyempurnakan look ini agar kamu tampil percaya diri dan standout tanpa terasa kaku. Rincian paduan busananya sudah saya tampilkan di Lookbook Board! 🍽️✨`;

      const outfitData = {
        judulLook: 'Smart Evening Dinner (No-Jeans Elegance)',
        atasan: 'Kemeja Linen Putih Kerah Shanghai',
        outerwear: 'Tailored Relaxed Blazer Sand Beige',
        bawahan: 'Pleated Ankle Trousers Charcoal Grey',
        alasKaki: 'Leather Penny Loafers Dark Brown',
        aksesori: ['Jam tangan kulit klasik', 'Kalung perak rantai tipis'],
        paletWarna: [
          { nama: 'Charcoal Grey', hex: '#2F3542' },
          { nama: 'Sand Beige', hex: '#D6C0B3' },
          { nama: 'Warm Ivory', hex: '#FDFBF7' }
        ],
        alasanAI: 'Kombinasi celana bahan berlipit halus (pleated trousers) dan blazer santai memberikan impresi dinner yang berkelas tanpa harus mengenakan jeans. Warna netral hangat sangat flattering untuk suasana pencahayaan restoran malam hari.',
        tipsStyling: 'Biarkan satu atau dua kancing atas kemeja terbuka secara santai, dan kenakan blazer tanpa dikancingkan untuk menghasilkan garis jatuh siluet yang semampai.',
        saranArahBelanja: 'Look ini sudah 100% lengkap menggunakan pakaian esensial di lemarimu!'
      };

      const dinnerDoc = {
        id: `rec_${Date.now()}`,
        userId: 'usr_default',
        konteks: {
          acara: 'Dinner Malam Hari (Tanpa Jeans)',
          suasana: 'Smart Casual Elegant',
          cuaca: 'Malam Sejuk Ber-AC'
        },
        outfit: outfitData,
        alasanAI: outfitData.alasanAI,
        tipsStyling: outfitData.tipsStyling,
        saranArahBelanja: outfitData.saranArahBelanja,
        shoppingRecommendation: enrichShoppingRecommendation(null, outfitData, wardrobeItems),
        favorit: false,
        isAIGenerated: false,
        dibuatPada: new Date().toISOString()
      };

      const allRecs = await readJsonFile(REKOMENDASI_FILE);
      allRecs.unshift(dinnerDoc);
      await writeJsonFile(REKOMENDASI_FILE, allRecs);
      updatedOutfit = dinnerDoc;
    }
    // 5. Body proportion consultation (only if explicitly asking for body proportion/silhouette advice)
    else if (cleanPesan.includes('bentuk tubuh') || cleanPesan.includes('proporsi') || cleanPesan.includes('siluet') || cleanPesan.includes('postur') || ((cleanPesan.includes('tinggi') || cleanPesan.includes('berat') || cleanPesan.includes('badan')) && (cleanPesan.includes('tips') || cleanPesan.includes('cocok') || cleanPesan.includes('saran') || cleanPesan.includes('rekomendasi')))) {
      const tinggiStr = `${tinggi} cm`;
      const beratStr = `${berat} kg`;
      const bentukStr = bentukTubuh.split('(')[0].trim();

      jawabanChat = `Halo ${namaUser}! Berikut tips siluet berdasarkan profil fisikmu (**Tinggi: ${tinggiStr}**, **Berat: ${beratStr}**, **Bentuk Tubuh: ${bentukStr}**, Ukuran: ${ukuranBaju}):\n\n` +
        `1. **Rasio Siluet (1/3 - 2/3)**: Hindari membagi proporsi 50:50. Padukan bawahan high-waisted dengan atasan tucked-in untuk memperpanjang garis kaki.\n` +
        `2. **Kesesuaian Bentuk Tubuh (${bentukStr})**: Tonjolkan lekuk alami pinggang dan hindari pakaian yang terlalu boxy tanpa struktur.\n` +
        `3. **Outerwear**: Blazer atau cardigan unlined yang jatuh tepat di pinggul atau paha atas dengan kancing terbuka memberi ilusi vertikal yang jenjang.\n` +
        `4. **Alas Kaki**: Sepatu pointed-toe atau clean minimalist sneakers memberi tampilan kaki yang lebih ramping.\n\n` +
        `Apakah kamu ingin saya buatkan racikan outfit lengkap dengan panduan ini di Studio? ✨`;
    }
    // 6. Outfit revision on active look
    else if (currentOutfit && (cleanPesan.includes('ganti') || cleanPesan.includes('ubah') || cleanPesan.includes('sneaker') || cleanPesan.includes('sepatu') || cleanPesan.includes('celana') || cleanPesan.includes('warna'))) {
      const cloned = JSON.parse(JSON.stringify(currentOutfit));
      cloned.id = `rec_${Date.now()}`;
      cloned.dibuatPada = new Date().toISOString();

      if (cleanPesan.includes('sneaker') || cleanPesan.includes('sepatu')) {
        cloned.outfit.alasKaki = 'Clean white minimalist leather sneakers dengan detail suede kelabu';
        jawabanChat = `Tentu ${namaUser}! Saya sudah mengganti alas kakinya dengan clean white sneakers minimalis. Silakan periksa kartu outfit di sebelah kanan!`;
      } else if (cleanPesan.includes('jeans') || cleanPesan.includes('celana')) {
        cloned.outfit.bawahan = 'High-waisted straight relaxed raw denim trousers warna dark indigo';
        jawabanChat = `Siap! Celana telah diganti dengan high-waisted straight denim warna dark indigo. Silakan cek tampilan terbarunya di Studio!`;
      } else {
        cloned.outfit.judulLook = `${cloned.outfit.judulLook} (Revisi Persona)`;
        jawabanChat = `Saya telah menyesuaikan aksen look sesuai masukan Anda: "${pesan}". Silakan periksa kartu outfit di sebelah kanan!`;
      }

      cloned.alasanAI = `${cloned.alasanAI} [Penyesuaian: ${pesan}]`;
      cloned.shoppingRecommendation = cloned.shoppingRecommendation || enrichShoppingRecommendation(null, cloned.outfit, wardrobeItems);
      const allRecs = await readJsonFile(REKOMENDASI_FILE);
      allRecs.unshift(cloned);
      await writeJsonFile(REKOMENDASI_FILE, allRecs);
      updatedOutfit = cloned;
    }
    // 7. General conversational fallback (when not asking for outfits)
    else {
      jawabanChat = lang === 'en'
        ? `What kind of outfit or occasion would you like to explore today, ${namaUser}? Let me know what you need!`
        : `Ada rencana acara atau ide outfit tertentu yang ingin kamu tanyakan hari ini, ${namaUser}? Tanyakan saja apa yang ingin kamu ketahui seputar styling! ✨`;
    }

    res.json({
      jawabanChat,
      updatedOutfit
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Recommendation history & favorites (FR-5)
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const allRecs = await readJsonFile(REKOMENDASI_FILE);
    const userRecs = allRecs.filter(r => !r.userId || r.userId === req.params.userId || r.userId === 'usr_default');
    res.json(userRecs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recommendations/favorite', async (req, res) => {
  try {
    const { id, favorit } = req.body;
    const allRecs = await readJsonFile(REKOMENDASI_FILE);
    const rec = allRecs.find(r => r.id === id);
    if (!rec) {
      return res.status(404).json({ error: 'Rekomendasi tidak ditemukan' });
    }
    rec.favorit = Boolean(favorit);
    await writeJsonFile(REKOMENDASI_FILE, allRecs);
    res.json({ success: true, id, favorit: rec.favorit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single recommendation by id
app.delete('/api/recommendations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let allRecs = await readJsonFile(REKOMENDASI_FILE);
    const initialLen = allRecs.length;
    allRecs = allRecs.filter(r => r.id !== id);
    await writeJsonFile(REKOMENDASI_FILE, allRecs);
    res.json({ success: true, id, deleted: initialLen !== allRecs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all recommendations for a user
app.delete('/api/recommendations/all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let allRecs = await readJsonFile(REKOMENDASI_FILE);
    const initialLen = allRecs.length;
    allRecs = allRecs.filter(r => r.userId && r.userId !== userId && r.userId !== 'usr_default');
    await writeJsonFile(REKOMENDASI_FILE, allRecs);
    res.json({ success: true, deletedCount: initialLen - allRecs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`✨ Padu Padan AI server is running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}

module.exports = app;

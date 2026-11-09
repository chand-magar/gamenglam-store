import type { Product, MegaCategory, FeaturedCategory } from '@/lib/types';

export const PRODUCTS: Product[] = [
  { id:1, brand:'Solace Audio',   name:'Wireless Over-Ear Headphones',  slug:'wireless-over-ear-headphones',  category:'Electronics',  price:129, originalPrice:179, rating:4.6, reviewsN:2140, stock:'in',  badge:'bestseller', colors:['#201f1d','#bab6b6','#a06f24'], sizes:null, sku:'SA-WH-1001', description:'Studio-tuned wireless headphones with 40-hour battery life, adaptive noise cancellation, and a memory-foam headband built for all-day wear.', specs:[{k:'Battery Life',v:'40 hours (ANC on)'},{k:'Connectivity',v:'Bluetooth 5.3, 3.5mm jack'},{k:'Weight',v:'254g'},{k:'Charging',v:'USB-C, 10 min = 5 hrs'}], features:['Adaptive noise cancellation','Multipoint pairing to 2 devices','Foldable travel design','Touch controls'], imageLabel:'product photo — headphones, black, 3/4 view' },
  { id:2, brand:'Marrow',         name:'Cast Iron Skillet, 12in',       slug:'cast-iron-skillet-12in',         category:'Home & Living', price:39,  originalPrice:55,  rating:4.8, reviewsN:980,  stock:'in',  badge:'deal',        colors:null,                              sizes:null, sku:'MW-CI-1204', description:'A pre-seasoned 12-inch cast iron skillet built for stovetop, oven, and campfire cooking. Gets better with every use.', specs:[{k:'Diameter',v:'12 in'},{k:'Material',v:'Pre-seasoned cast iron'},{k:'Oven Safe',v:'Up to 500°F'},{k:'Care',v:'Hand wash, re-season as needed'}], features:['Even heat retention','Dual pour spouts','Oven and campfire safe'], imageLabel:'product photo — cast iron skillet, top-down' },
  { id:3, brand:'Fenwick',        name:'Merino Wool Crewneck Sweater',  slug:'merino-wool-crewneck-sweater',   category:'Fashion',       price:78,  originalPrice:98,  rating:4.4, reviewsN:512,  stock:'low', badge:'new',         colors:['#605d5d','#2d2b2b','#7d5411'],   sizes:['S','M','L','XL'], sku:'FW-MW-3302', description:'A midweight crewneck knit from 100% merino wool. Breathable, naturally odor-resistant, and soft enough for all-day layering.', specs:[{k:'Material',v:'100% Merino Wool'},{k:'Fit',v:'Regular'},{k:'Care',v:'Hand wash cold'}], features:['Naturally odor-resistant','Temperature-regulating','Ribbed cuffs and hem'], imageLabel:'product photo — wool sweater, flat lay' },
  { id:4, brand:'Northline',      name:'Trail Running Shoes',           slug:'trail-running-shoes',            category:'Sports',        price:94,  originalPrice:120, rating:4.5, reviewsN:1330, stock:'in',  badge:'bestseller', colors:['#201f1d','#a06f24','#605d5d'],   sizes:['7','8','9','10','11'], sku:'NL-TR-4471', description:'Lightweight trail runners with an aggressive lug outsole and a breathable engineered-mesh upper for technical terrain.', specs:[{k:'Weight',v:'265g (US 9)'},{k:'Outsole',v:'Sticky rubber, 4mm lug'},{k:'Drop',v:'6mm'},{k:'Upper',v:'Engineered mesh'}], features:['Rock plate for protection','Gaiter-compatible heel','Quick-dry lining'], imageLabel:'product photo — trail shoe, side profile' },
  { id:5, brand:'Lumen',          name:'Smart LED Desk Lamp',           slug:'smart-led-desk-lamp',            category:'Electronics',  price:44,  originalPrice:null, rating:4.3, reviewsN:410,  stock:'in',  badge:'new',         colors:null,                              sizes:null, sku:'LM-DL-5510', description:'A dimmable desk lamp with tunable white light, USB-C charging port, and app-based scheduling.', specs:[{k:'Brightness',v:'1200 lux at 30cm'},{k:'Color Temp',v:'2700K–6500K'},{k:'Ports',v:'1x USB-C, 60W passthrough'}], features:['App scheduling','Touch dimmer','Foldable arm'], imageLabel:'product photo — desk lamp, on' },
  { id:6, brand:'Verdant',        name:'Ceramic Pour-Over Coffee Set',  slug:'ceramic-pour-over-coffee-set',   category:'Home & Living', price:52,  originalPrice:65,  rating:4.7, reviewsN:298,  stock:'in',  badge:'deal',        colors:null,                              sizes:null, sku:'VD-PO-6602', description:'A hand-glazed ceramic pour-over dripper and carafe set for a cleaner, brighter cup.', specs:[{k:'Capacity',v:'600ml carafe'},{k:'Material',v:'Stoneware ceramic'},{k:'Filters',v:'Fits standard #2 cone filters'}], features:['Hand-glazed, dishwasher safe','Non-slip cork coaster included'], imageLabel:'product photo — pour-over set, on counter' },
  { id:7, brand:'Solstice',       name:'Polarized Aviator Sunglasses',  slug:'polarized-aviator-sunglasses',   category:'Fashion',       price:65,  originalPrice:null, rating:4.2, reviewsN:203,  stock:'in',  badge:null,          colors:['#2d2b2b','#a06f24'],             sizes:null, sku:'SL-AV-7703', description:'Classic aviators with polarized lenses and a lightweight titanium-alloy frame.', specs:[{k:'Lens',v:'Polarized, UV400'},{k:'Frame',v:'Titanium alloy'},{k:'Weight',v:'24g'}], features:['Scratch-resistant coating','Spring hinges'], imageLabel:'product photo — aviator sunglasses, angled' },
  { id:8, brand:'Meadow & Co',    name:'Vitamin C Brightening Serum',   slug:'vitamin-c-brightening-serum',    category:'Beauty',        price:28,  originalPrice:36,  rating:4.6, reviewsN:875,  stock:'in',  badge:'bestseller', colors:null,                              sizes:null, sku:'MC-VC-8804', description:'A 15% vitamin C serum formulated to brighten tone and soften the look of fine lines over time.', specs:[{k:'Size',v:'30ml'},{k:'Key Ingredient',v:'15% L-Ascorbic Acid'},{k:'Skin Type',v:'All types'}], features:['Fragrance-free','Cruelty-free','Dermatologist tested'], imageLabel:'product photo — serum bottle, studio' },
  { id:9, brand:'Solace Audio',   name:'Portable Bluetooth Speaker',    slug:'portable-bluetooth-speaker',     category:'Electronics',  price:59,  originalPrice:null, rating:4.4, reviewsN:640,  stock:'in',  badge:'new',         colors:['#201f1d','#7d5411'],             sizes:null, sku:'SA-BS-9905', description:'A rugged IP67-rated speaker with 20 hours of playback and surprisingly deep bass for its size.', specs:[{k:'Playtime',v:'20 hours'},{k:'Rating',v:'IP67 waterproof/dustproof'},{k:'Output',v:'30W'}], features:['Pair two for stereo','Built-in mic for calls'], imageLabel:'product photo — speaker, outdoor setting' },
  { id:10, brand:'Northline',     name:'Insulated Steel Water Bottle',  slug:'insulated-steel-water-bottle',   category:'Sports',        price:24,  originalPrice:null, rating:4.7, reviewsN:1520, stock:'in',  badge:'bestseller', colors:['#201f1d','#7d5411','#605d5d'],   sizes:null, sku:'NL-WB-1006', description:'Double-wall vacuum insulated steel bottle that keeps drinks cold for 24 hours or hot for 12.', specs:[{k:'Capacity',v:'750ml'},{k:'Material',v:'18/8 stainless steel'},{k:'Insulation',v:'24hr cold / 12hr hot'}], features:['Leak-proof lid','Wide mouth for ice'], imageLabel:'product photo — water bottle, upright' },
  { id:11, brand:'Fenwick',       name:'Tailored Cotton Chinos',        slug:'tailored-cotton-chinos',          category:'Fashion',       price:58,  originalPrice:72,  rating:4.3, reviewsN:340,  stock:'out', badge:null,          colors:['#605d5d','#2d2b2b'],             sizes:['30','32','34','36'], sku:'FW-CH-1107', description:'Tailored-fit cotton twill chinos with a touch of stretch for all-day comfort.', specs:[{k:'Material',v:'98% cotton, 2% elastane'},{k:'Fit',v:'Tailored'}], features:['Stretch waistband','Wrinkle-resistant finish'], imageLabel:'product photo — chinos, flat lay' },
  { id:12, brand:'Marrow',        name:'Linen Throw Blanket',           slug:'linen-throw-blanket',             category:'Home & Living', price:46,  originalPrice:null, rating:4.5, reviewsN:190,  stock:'in',  badge:'deal',        colors:null,                              sizes:null, sku:'MW-LB-1208', description:'A pre-washed European linen throw that softens with every wash.', specs:[{k:'Size',v:'130 × 180cm'},{k:'Material',v:'100% linen'}], features:['Pre-washed for softness','OEKO-TEX certified'], imageLabel:'product photo — throw blanket, draped' },
  { id:13, brand:'Halcyon',       name:'Noise-Isolating Sleep Earbuds', slug:'noise-isolating-sleep-earbuds',   category:'Electronics',  price:89,  originalPrice:110, rating:4.1, reviewsN:275,  stock:'in',  badge:'new',         colors:null,                              sizes:null, sku:'HC-SE-1309', description:'Ultra-soft sleep earbuds that block ambient noise and play white noise or your own audio all night.', specs:[{k:'Battery',v:'10 hours + case'},{k:'Fit',v:'Soft silicone, side-sleeper safe'}], features:['Built-in white noise library','Alarm-safe volume mode'], imageLabel:'product photo — sleep earbuds, in case' },
  { id:14, brand:'Meadow & Co',   name:'Matte Clay Lip Set (3pc)',      slug:'matte-clay-lip-set',              category:'Beauty',        price:32,  originalPrice:null, rating:4.5, reviewsN:410,  stock:'in',  badge:null,          colors:null,                              sizes:null, sku:'MC-LS-1410', description:'Three long-wear matte lip colors in a weightless clay finish that won\'t dry out lips.', specs:[{k:'Shades',v:'3 included'},{k:'Wear Time',v:'Up to 8 hours'}], features:['Transfer-resistant','Vitamin E enriched'], imageLabel:'product photo — lipstick trio, studio' },
];

export const HOME_REVIEWS = [
  { name:'Rahul S.',  product:'Cricket Equipment',    text:'Best cricket gear in Barasat. Quality is top-notch and the staff really knows their sport.' },
  { name:'Priya M.',  product:'Running Shoes',        text:'Super comfortable and durable. Perfect for my morning runs. Delivery was fast too!' },
  { name:'Arjun K.',  product:'Fitness Accessories',  text:'Great selection of gym gear. The resistance bands and weights are exactly what I needed.' },
];

export const MEGA_CATEGORIES: MegaCategory[] = [
  { name:'Electronics',     subs:['Headphones','Smart Home','Speakers'] },
  { name:'Fashion',         subs:["Men's","Women's",'Accessories'] },
  { name:'Home & Living',   subs:['Kitchen','Decor','Bedding'] },
  { name:'Beauty',          subs:['Skincare','Makeup','Haircare'] },
  { name:'Sports & Outdoors',subs:['Footwear','Fitness','Camping'] },
  { name:'Deals',           subs:['Flash Sale','Clearance','Bundles'] },
];

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  { name:'Electronics',  icon:'headphones', slug:'Electronics'    },
  { name:'Fashion',      icon:'shirt',      slug:'Fashion'        },
  { name:'Home & Living',icon:'lamp',       slug:'Home & Living'  },
  { name:'Beauty',       icon:'sparkles',   slug:'Beauty'         },
  { name:'Sports',       icon:'dumbbell',   slug:'Sports'         },
  { name:'Deals',        icon:'tag',        slug:'Deals'          },
];

export const BRANDS = ['Solace Audio','Fenwick','Northline','Marrow','Meadow & Co','Halcyon'];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'Deals') return PRODUCTS.filter((p) => p.badge === 'deal');
  return PRODUCTS.filter((p) => p.category === category);
}

export function getDiscountPct(price: number, originalPrice: number | null): number | null {
  if (!originalPrice) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

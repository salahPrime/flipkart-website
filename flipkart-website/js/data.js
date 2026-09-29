// Default Product Catalog for Flipkart Clone Store
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    title: "Apple iPhone 15 (Blue, 128 GB)",
    category: "mobiles",
    brand: "Apple",
    price: 65999,
    originalPrice: 79900,
    rating: 4.6,
    ratingCount: 38420,
    reviewCount: 2940,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "128 GB ROM",
      "15.49 cm (6.1 inch) Super Retina XDR Display",
      "48MP + 12MP Dual Rear Camera | 12MP Front Camera",
      "A16 Bionic Chip, 6 Core Processor",
      "Dynamic Island innovation for effortless alerts",
      "1 Year Manufacturer Warranty"
    ],
    offers: [
      "Bank Offer: 10% Instant Discount on HDFC Bank Credit Cards, up to ₹1,500",
      "Special Price: Get extra ₹13,901 off (price inclusive of discount)",
      "Partner Offer: Sign up for Flipkart Pay Later & get Flipkart Gift Card worth ₹250"
    ],
    description: "The iPhone 15 features the groundbreaking Dynamic Island, a 48MP main camera for super-high-resolution photos, durable color-infused glass and aluminum design, and USB-C connectivity.",
    stock: 24,
    dealOfDay: true,
    isSellerProduct: false
  },
  {
    id: "prod-2",
    title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)",
    category: "mobiles",
    brand: "Samsung",
    price: 119999,
    originalPrice: 134999,
    rating: 4.7,
    ratingCount: 15300,
    reviewCount: 1820,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "12 GB RAM | 256 GB ROM",
      "17.27 cm (6.8 inch) Dynamic AMOLED 2X Display (120Hz)",
      "200MP + 50MP + 12MP + 10MP Quad Rear | 12MP Front",
      "Snapdragon 8 Gen 3 Processor",
      "Galaxy AI Features: Live Translate, Circle to Search, Note Assist",
      "5000 mAh Battery with 45W Fast Charging"
    ],
    offers: [
      "Bank Offer: ₹5,000 Instant Discount on ICICI Bank Cards",
      "Exchange Offer: Up to ₹25,000 off on Exchange of old device"
    ],
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 17.27 cm flat display. Powered by Galaxy AI to elevate every experience.",
    stock: 14,
    dealOfDay: true,
    isSellerProduct: false
  },
  {
    id: "prod-3",
    title: "Apple MacBook Air Apple M3 (16 GB / 512 GB SSD / macOS Sonoma)",
    category: "electronics",
    brand: "Apple",
    price: 124990,
    originalPrice: 134900,
    rating: 4.8,
    ratingCount: 8940,
    reviewCount: 920,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Apple M3 8-Core CPU & 10-Core GPU",
      "16 GB Unified Memory | 512 GB SSD",
      "34.54 cm (13.6 inch) Liquid Retina Display with True Tone",
      "MagSafe 3 Charging Port, 2x Thunderbolt Ports",
      "Up to 18 Hours Battery Life",
      "Backlit Magic Keyboard with Touch ID"
    ],
    offers: [
      "Bank Offer: Flat ₹8,000 Instant Discount with SBI Credit Cards",
      "No Cost EMI available starting at ₹10,416/month"
    ],
    description: "Lean, mean M3 machine. Built for Apple Intelligence, MacBook Air sails through work and play with unbelievable portability and up to 18 hours of battery.",
    stock: 9,
    dealOfDay: true,
    isSellerProduct: false
  },
  {
    id: "prod-4",
    title: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    category: "electronics",
    brand: "Sony",
    price: 26990,
    originalPrice: 34990,
    rating: 4.7,
    ratingCount: 19800,
    reviewCount: 3100,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Industry Leading Active Noise Cancellation with Auto NC Optimizer",
      "Magnificent Sound engineered to perfection with High-Res Audio",
      "Crystal Clear Hands-free Calling with 4 beamforming microphones",
      "Up to 30 Hours Battery Life (3 min charge gives 3 hours playback)",
      "Touch Sensor Controls for seamless playback & volume"
    ],
    offers: [
      "Bank Offer: 5% Unlimited Cashback on Flipkart Axis Bank Credit Card",
      "Special Price: Additional ₹8,000 off"
    ],
    description: "The WH-1000XM5 headphones rewrite the rules for distraction-free listening. 2 processors control 8 microphones for unprecedented noise cancellation and exceptional sound quality.",
    stock: 35,
    dealOfDay: true,
    isSellerProduct: false
  },
  {
    id: "prod-5",
    title: "Nike Air Jordan 1 Low Retro Sneakers for Men",
    category: "fashion",
    brand: "Nike",
    price: 8995,
    originalPrice: 11995,
    rating: 4.5,
    ratingCount: 12400,
    reviewCount: 1450,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Genuine leather upper provides premium durability and structured feel",
      "Encapsulated Nike Air-Sole unit provides lightweight cushioning",
      "Solid rubber outsole gives traction on a variety of surfaces",
      "Iconic Wings logo stamped on heel and stitched Swoosh design"
    ],
    offers: [
      "Special Price: Flat 25% discount applied",
      "Free Delivery & 10 Days Hassle-Free Exchange"
    ],
    description: "Inspired by the 1985 original, the Air Jordan 1 Low offers a clean, classic look that's familiar yet always fresh with casual profile and timeless silhouette.",
    stock: 18,
    dealOfDay: false,
    isSellerProduct: false
  },
  {
    id: "prod-6",
    title: "Levi's Men Regular Fit Solid Casual Denim Jacket",
    category: "fashion",
    brand: "Levi's",
    price: 3299,
    originalPrice: 5999,
    rating: 4.3,
    ratingCount: 9400,
    reviewCount: 780,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Fabric: 100% Cotton Denim",
      "Pattern: Solid Indigo Wash",
      "Fit: Regular Trucker Fit",
      "Full Sleeve with Button Cuffs and Chest Pockets",
      "Machine Wash Cold"
    ],
    offers: [
      "Buy 2 items save extra 10%",
      "Flat ₹2,700 Off on MRP"
    ],
    description: "A blank canvas for self-expression, the original Jean Jacket since 1967. Designed with expert craftsmanship to stand the test of time.",
    stock: 45,
    dealOfDay: false,
    isSellerProduct: false
  },
  {
    id: "prod-7",
    title: "Samsung 138 cm (55 inch) Ultra HD (4K) Smart LED TV",
    category: "appliances",
    brand: "Samsung",
    price: 43990,
    originalPrice: 68900,
    rating: 4.4,
    ratingCount: 28400,
    reviewCount: 4100,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Ultra HD (4K) 3840 x 2160 Pixels resolution",
      "Crystal Processor 4K with PurColor & HDR 10+",
      "20W Dolby Digital Plus Audio Output",
      "3 x HDMI | 1 x USB Ports",
      "Built-in Voice Assistants: Bixby and Alexa",
      "3 Years Comprehensive Manufacturer Warranty"
    ],
    offers: [
      "Bank Offer: ₹2,000 Instant Discount on All Debit/Credit Cards",
      "Free Wall Mount & Standard Installation within 48 Hours"
    ],
    description: "Experience lifelike picture quality with vivid billion shades of color. High Dynamic Range increases the level of light range on your TV so you can enjoy an enormous spectrum of colors and all the visual details.",
    stock: 12,
    dealOfDay: true,
    isSellerProduct: false
  },
  {
    id: "prod-8",
    title: "Philips Digital Air Fryer HD9252/90 with Rapid Air Tech (4.1 L)",
    category: "home",
    brand: "Philips",
    price: 7499,
    originalPrice: 11995,
    rating: 4.5,
    ratingCount: 14120,
    reviewCount: 1950,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Rapid Air Technology: Fry with up to 90% less fat",
      "Touch screen with 7 presets for Fries, Meat, Fish, Baking & more",
      "Keep Warm function keeps food hot up to 30 mins",
      "Capacity: 4.1 Litre basket",
      "Dishwasher safe removable parts",
      "2 Years Global Warranty"
    ],
    offers: [
      "Special Offer: Free NutriU Recipe App access",
      "Extra 5% off with Flipkart Axis Bank Credit Card"
    ],
    description: "Great tasting fries with up to 90% less fat thanks to Rapid Air technology. Philips brings the world’s leading Airfryer to everyone’s home for healthy frying.",
    stock: 28,
    dealOfDay: false,
    isSellerProduct: false
  },
  {
    id: "prod-9",
    title: "OnePlus 12 5G (Flowy Emerald, 256 GB)",
    category: "mobiles",
    brand: "OnePlus",
    price: 64999,
    originalPrice: 69999,
    rating: 4.6,
    ratingCount: 17200,
    reviewCount: 2200,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "12 GB RAM | 256 GB ROM",
      "17.32 cm (6.82 inch) 2K 120 Hz ProXDR Display with LTPO",
      "4th Gen Hasselblad Camera for Mobile (50MP + 64MP 3X + 48MP)",
      "Snapdragon 8 Gen 3 Mobile Platform",
      "5400 mAh Battery with 100W SUPERVOOC + 50W AIRVOOC"
    ],
    offers: [
      "Bank Offer: ₹3,000 Instant Discount with OneCard Credit Cards",
      "Special Price: Extra ₹5,000 Off"
    ],
    description: "The OnePlus 12 delivers flagship performance without compromise, featuring Hasselblad camera tuning, Snapdragon 8 Gen 3, and stunning 2K ProXDR display.",
    stock: 20,
    dealOfDay: true,
    isSellerProduct: false
  },
  {
    id: "prod-10",
    title: "Apple Watch Series 9 GPS 45mm Midnight Aluminum Case",
    category: "electronics",
    brand: "Apple",
    price: 38900,
    originalPrice: 44900,
    rating: 4.7,
    ratingCount: 8200,
    reviewCount: 710,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Always-On Retina display with up to 2000 nits brightness",
      "S9 SiP with Double Tap gesture control",
      "Advanced health sensors: Blood Oxygen, ECG, Temperature sensing",
      "Crash Detection and Fall Detection emergency SOS",
      "Water resistant to 50 meters (Swimproof)"
    ],
    offers: [
      "Bank Offer: Flat ₹3,000 Instant Discount on Axis Bank Credit Cards",
      "No Cost EMI available from ₹3,242/month"
    ],
    description: "Smarter, brighter, mightier. Apple Watch Series 9 helps you stay connected, active, healthy, and safe with magical double-tap gestures and ultra-fast on-device Siri.",
    stock: 15,
    dealOfDay: false,
    isSellerProduct: false
  },
  {
    id: "prod-11",
    title: "Dyson V12 Detect Slim Cordless Vacuum Cleaner",
    category: "home",
    brand: "Dyson",
    price: 49900,
    originalPrice: 59900,
    rating: 4.6,
    ratingCount: 4300,
    reviewCount: 520,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "Laser reveals microscopic dust on hard floors",
      "Piezo sensor continuously sizes and counts dust particles",
      "Powerful Hyperdymium motor spins up to 125,000rpm",
      "Up to 60 minutes of run time with click-in battery",
      "LCD screen shows scientific proof of a deep clean",
      "2 Years Dyson Warranty"
    ],
    offers: [
      "Special Price: Flat ₹10,000 Off",
      "Free Home Demonstration available in 150+ cities"
    ],
    description: "Dyson's most powerful, lightweight cordless vacuum with illumination technology that reveals hidden dust on hard floors.",
    stock: 8,
    dealOfDay: false,
    isSellerProduct: false
  },
  {
    id: "prod-12",
    title: "Fossil Grant Chronograph Black Dial Men's Watch",
    category: "fashion",
    brand: "Fossil",
    price: 7995,
    originalPrice: 13995,
    rating: 4.4,
    ratingCount: 16800,
    reviewCount: 2300,
    isAssured: true,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
    ],
    highlights: [
      "44 mm Stainless Steel Case with mineral dial window",
      "Black Dial with Roman numeral hour markers",
      "Quartz movement with 3-hand analog display & 3 sub-dials",
      "Genuine Brown Leather Band with buckle closure",
      "Water resistant to 50m (165ft)"
    ],
    offers: [
      "Special Price: 42% Off on MRP",
      "2 Years International Warranty"
    ],
    description: "Modeled after vintage clocks, our Grant collection has a timeless appeal. Roman numerals set against a dark dial make this an irresistible wrist essential.",
    stock: 22,
    dealOfDay: true,
    isSellerProduct: false
  }
];

// Banner slides data for Flipkart Hero Carousel
const BANNER_SLIDES = [
  {
    id: 1,
    title: "Big Saving Days",
    tagline: "Unbeatable Deals on Top Smartphones & Laptops",
    badge: "SALE LIVE NOW",
    cta: "Explore Deals",
    bgGradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    accentColor: "#ffe100",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    categoryFilter: "mobiles"
  },
  {
    id: 2,
    title: "Next-Gen Electronics",
    tagline: "Up to 50% Off on Laptops, Audio & Wearables",
    badge: "FLIPKART SPECIAL",
    cta: "Shop Electronics",
    bgGradient: "linear-gradient(135deg, #09203f 0%, #537895 100%)",
    accentColor: "#00f2fe",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80",
    categoryFilter: "electronics"
  },
  {
    id: 3,
    title: "Grand Fashion Fest",
    tagline: "Min. 60% Off on Premium Brands & Sneakers",
    badge: "TRENDING NOW",
    cta: "Upgrade Wardrobe",
    bgGradient: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
    accentColor: "#fff",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    categoryFilter: "fashion"
  },
  {
    id: 4,
    title: "Smart Home & Appliances",
    tagline: "Smart 4K TVs, Air Fryers, Robotic Cleaners & More",
    badge: "HOME UPGRADE",
    cta: "Grab Best Prices",
    bgGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    accentColor: "#0f3854",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    categoryFilter: "home"
  }
];

// Preset sample images for quick seller product addition
const PRESET_PRODUCT_IMAGES = [
  { label: "Smartphone / Gadget", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
  { label: "Laptop / Computer", url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" },
  { label: "Headphones / Audio", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80" },
  { label: "Smartwatch / Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" },
  { label: "Sneakers / Shoes", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" },
  { label: "Clothing / Fashion", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80" },
  { label: "Home Appliance", url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80" },
  { label: "Camera / Gear", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" }
];

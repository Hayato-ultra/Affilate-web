import { RawProduct } from '../types';

interface MockProduct {
  title: string;
  price: number;
  original_price: number | null;
  image_url: string;
  merchant_name: string;
  merchant_logo_url: string;
  platform: 'amazon' | 'flipkart' | 'ebay';
  rating: number;
}

const MOCK_CATALOG: Record<string, MockProduct[]> = {
  default: [
    { title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 24990, original_price: 29990, image_url: 'https://m.media-amazon.com/images/I/51HkE50tZ7L._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.5 },
    { title: 'Sony WH-1000XM5 Wireless Headphones', price: 25999, original_price: null, image_url: 'https://rukminim2.flixcart.com/image/832/832/xif0q/headphone/k/h/k/wh-1000xm5-sony-original-imagx2az3g5hgzaz.jpeg', merchant_name: 'Flipkart', merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png', platform: 'flipkart', rating: 4.4 },
    { title: 'Sony WH-1000XM5 Wireless Headphones - Silver', price: 329.99, original_price: 399.99, image_url: 'https://i.ebayimg.com/images/g/~k4AAOSw1OdjzMpL/s-l500.jpg', merchant_name: 'eBay', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg', platform: 'ebay', rating: 4.3 },
    { title: 'Samsung Galaxy S24 Ultra 5G AI Smartphone (12GB RAM, 256GB)', price: 109999, original_price: 134999, image_url: 'https://m.media-amazon.com/images/I/61vUczbMkzL._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.6 },
    { title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256GB)', price: 111999, original_price: null, image_url: 'https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/k/l/g/-original-imagw4pgh5dpy9mf.jpeg', merchant_name: 'Flipkart', merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png', platform: 'flipkart', rating: 4.5 },
    { title: 'iPhone 15 Pro Max 256GB - Natural Titanium', price: 149900, original_price: 159900, image_url: 'https://m.media-amazon.com/images/I/61c1UzDzY4L._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.7 },
    { title: 'Apple iPhone 15 Pro Max (Natural Titanium, 256GB)', price: 152999, original_price: null, image_url: 'https://rukminim2.flixcart.com/image/832/832/xif0q/mobile/c/o/d/-original-imagxgz3heemnwzn.jpeg', merchant_name: 'Flipkart', merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png', platform: 'flipkart', rating: 4.6 },
    { title: 'MacBook Air M3 15-inch (8GB RAM, 256GB SSD)', price: 114900, original_price: 134900, image_url: 'https://m.media-amazon.com/images/I/71eJx5EuCaL._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.8 },
    { title: 'Apple 2024 MacBook Air M3 (15.3 inch, 8GB, 256GB)', price: 119990, original_price: 134990, image_url: 'https://rukminim2.flixcart.com/image/832/832/xif0q/computer/q/r/7/-original-imagzgxwf8xzchdh.jpeg', merchant_name: 'Flipkart', merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png', platform: 'flipkart', rating: 4.7 },
    { title: 'Logitech MX Master 3S Wireless Performance Mouse', price: 6995, original_price: 8495, image_url: 'https://m.media-amazon.com/images/I/61ni3t1uyQL._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.5 },
    { title: 'Logitech MX Master 3S Wireless Mouse', price: 7499, original_price: null, image_url: 'https://rukminim2.flixcart.com/image/832/832/xif0q/mouse/o/f/p/-original-imagk2zfnm3afhzz.jpeg', merchant_name: 'Flipkart', merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png', platform: 'flipkart', rating: 4.4 },
    { title: 'Boat Airdopes 141 Pro TWS Earbuds', price: 1799, original_price: 4999, image_url: 'https://m.media-amazon.com/images/I/51rUexaVYzL._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.3 },
    { title: 'boAt Airdopes 141 Pro TWS Earbuds with ANC', price: 1999, original_price: 5999, image_url: 'https://rukminim2.flixcart.com/image/832/832/xif0q/headphone/7/u/c/-original-imagzuyqbjgmbwz4.jpeg', merchant_name: 'Flipkart', merchant_logo_url: 'https://img.flipkart.com/fk-banner/flipkart-logo.png', platform: 'flipkart', rating: 4.2 },
    { title: 'Dell S2722QC 27-inch 4K UHD Monitor', price: 32195, original_price: 39995, image_url: 'https://m.media-amazon.com/images/I/71fFJ5qG1WL._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.4 },
    { title: 'LG 27UP600 27-inch 4K UHD IPS Monitor', price: 28999, original_price: 34999, image_url: 'https://m.media-amazon.com/images/I/81fDov1fMfL._SX522_.jpg', merchant_name: 'Amazon', merchant_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', platform: 'amazon', rating: 4.3 },
  ],
};

const QUERY_TAGS: Record<string, string[]> = {
  headphone: ['Sony WH-1000XM5', 'Sony WH-1000XM5 Wireless', 'Boat Airdopes'],
  earphone: ['Sony WH-1000XM5', 'Boat Airdopes'],
  earbuds: ['Boat Airdopes'],
  sony: ['Sony WH-1000XM5', 'Sony WH-1000XM5 Wireless'],
  boat: ['Boat Airdopes'],
  samsung: ['Samsung Galaxy S24'],
  galaxy: ['Samsung Galaxy S24'],
  s24: ['Samsung Galaxy S24'],
  iphone: ['iPhone 15 Pro Max'],
  apple: ['iPhone 15 Pro Max', 'MacBook Air M3'],
  macbook: ['MacBook Air M3'],
  logitech: ['Logitech MX Master'],
  mouse: ['Logitech MX Master'],
  monitor: ['Dell S2722QC', 'LG 27UP600'],
  dell: ['Dell S2722QC'],
  lg: ['LG 27UP600'],
};

function findMatchingProducts(query: string): MockProduct[] {
  const q = query.toLowerCase().trim();
  if (!q) return MOCK_CATALOG.default;

  const matchedTitles = new Set<string>();

  for (const [tag, titles] of Object.entries(QUERY_TAGS)) {
    if (q.includes(tag)) {
      for (const t of titles) matchedTitles.add(t);
    }
  }

  const matches = MOCK_CATALOG.default.filter(p => {
    if (matchedTitles.size > 0) {
      return [...matchedTitles].some(t => p.title.toLowerCase().includes(t.toLowerCase()));
    }
    return p.title.toLowerCase().includes(q);
  });

  return matches.length > 0 ? matches : MOCK_CATALOG.default.slice(0, 6);
}

export class MockClient {
  platform = 'amazon' as const;
  rateLimitConfig = { requestsPerSecond: 50, burst: 100 };

  async search(_query: string): Promise<{ platform: string; products: RawProduct[]; source: string }> {
    return { platform: 'amazon', products: [], source: 'api' };
  }

  async fetchProducts(query: string): Promise<RawProduct[]> {
    const matched = findMatchingProducts(query);

    return matched.map((p, i) => ({
      title: p.title,
      description: `${p.title} — ${p.rating} stars. Best price online.`,
      price: i === 0 ? p.price : p.price + Math.floor(Math.random() * 2000) - 1000,
      original_price: p.original_price,
      currency: p.platform === 'ebay' ? 'USD' : 'INR',
      image_url: p.image_url,
      image_urls: [p.image_url],
      product_url: `https://www.${p.platform}.${p.platform === 'flipkart' ? 'com' : p.platform === 'ebay' ? 'com' : 'in'}/dp/MOCK${String(i).padStart(3, '0')}`,
      model_number: `MOCK-${String(i).padStart(4, '0')}`,
      upc: null,
      ean: null,
      asin: p.platform === 'amazon' ? `B0MOCK${String(i).padStart(6, '0')}` : null,
      sku: `SKU-MOCK-${String(i).padStart(4, '0')}`,
      merchant_name: p.merchant_name,
      merchant_logo_url: p.merchant_logo_url,
    }));
  }
}

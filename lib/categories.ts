
export const KEYWORD_MAP: Record<string, string[]> = {
    'Electronics': ['phone', 'mobile', 'watch', 'camera', 'laptop', 'tablet', 'digital', 'tech', 'device', 'smart'],
    'Clothing': ['shirt', 'pant', 'dress', 'wear', 'cloth', 'hoodie', 'apparel', 'fashion'],
    'Home': ['home', 'kitchen', 'decor', 'lamp', 'light', 'storage', 'furniture', 'household', 'living'],
    'Audio': ['headphone', 'earphone', 'speaker', 'audio', 'sound', 'bud', 'music', 'airpods'],
    'Chargers': ['charger', 'adapter', 'cable', 'power', 'battery', 'wireless', 'dock', 'hub', 'usb'],
    'Cases': ['case', 'cover', 'protection', 'sleeve', 'bumper', 'pouch', 'skin'],
    'Accessories': ['holder', 'stand', 'mount', 'grip', 'strap', 'accessory', 'ring'],
    'iPhone': ['iphone', 'apple', 'ios'],
    'iPad': ['ipad', 'tablet'],
    'MagSafe': ['magsafe', 'magnetic'],
    'Anime': ['anime', 'manga', 'naruto', 'one piece', 'goku', 'demon slayer', 'dragon ball', 'attack on titan'],
    'Tech': ['tech', 'gadget', 'innovation'],
    'Shoes': ['shoe', 'sneaker', 'boot', 'footwear', 'sandal'],
    'Jewelry': ['jewelry', 'necklace', 'ring', 'bracelet', 'earring'],
    'Fitness': ['fitness', 'gym', 'sport', 'yoga', 'workout', 'exercise'],
};

export const CATEGORY_HIERARCHY = [
    {
        name: 'Electronics',
        slug: 'electronics',
        subcategories: ['iPhone', 'iPad', 'Audio', 'Tech', 'Chargers']
    },
    {
        name: 'Fashion',
        slug: 'fashion', // You might need to handle this slug if it doesn't exist as a tag, or just link to products? Or auto-tag 'fashion'
        subcategories: ['Clothing', 'Shoes', 'Jewelry']
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        subcategories: ['Cases', 'MagSafe', 'Accessories']
    },
    {
        name: 'Lifestyle',
        slug: 'lifestyle',
        subcategories: ['Home', 'Fitness', 'Anime']
    }
];

export const CATEGORIES = Object.keys(KEYWORD_MAP);

export function autoCategorize(name: string, description: string = '', existingCategory: string = ''): string[] {
    const text = (name + ' ' + description + ' ' + existingCategory).toLowerCase();
    const categories: Set<string> = new Set();

    // Default to 'All' or similar handling might be done in frontend, 
    // but here we just return specific matched categories.

    // Always include the existing category if it maps to one of our known ones? 
    // Or just treat it as text source.

    Object.entries(KEYWORD_MAP).forEach(([category, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            categories.add(category);
        }
    });

    // 2. Hierarchy Check: If a child category is found, ensure the parent is also added.
    CATEGORY_HIERARCHY.forEach(parent => {
        // If the parent itself was matched by keywords, that's good.
        // But if any of its subcategories were matched, we MUST add the parent.
        const hasSubcategory = parent.subcategories.some(sub => categories.has(sub));
        if (hasSubcategory) {
            categories.add(parent.name);
        }
    });

    // Ensure we convert Set to Array
    let result = Array.from(categories);

    // If no categories found, use 'General' or similar fallback if desired.
    if (result.length === 0) {
        // result.push('General');
    }

    return result;
}

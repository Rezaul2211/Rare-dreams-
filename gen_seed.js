const categories = ['Women', 'Men', 'Kids'];
const imageMap = {
  Women: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1434389672724-4fa9d120c153?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=800&auto=format&fit=crop'],
  Men: ['https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1550614000-4b95d4662444?q=80&w=800&auto=format&fit=crop'],
  Kids: ['https://images.unsplash.com/photo-1514090458221-65bb69cf640c?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1503945438517-f65904a52ce6?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop']
};

const dummyNames = {
  Women: ['Summer Flow Dress', 'Silk Blouse', 'Evening Handbag', 'Lace Top'],
  Men: ['Classic Suit Jacket', 'Cotton T-Shirt', 'Leather Belt', 'Oxford Shoes'],
  Kids: ['Playful Overalls', 'Cotton Tee', 'Sneakers', 'Rain Jacket']
};

let products = [];
for (let c of categories) {
  for (let i = 0; i < 4; i++) {
    const id = `prod-${c.toLowerCase()}-${i+1}`;
    const name = dummyNames[c][i];
    const image = imageMap[c][i % 3];
    products.push(`
  {
    id: '${id}',
    name: '${name}',
    category: '${c}',
    price: ${Math.floor(Math.random() * 150) + 20},
    comparePrice: ${Math.floor(Math.random() * 200) + 50},
    discount: ${Math.floor(Math.random() * 30)},
    stockQuantity: ${Math.floor(Math.random() * 100) + 10},
    sizeOptions: ['S', 'M', 'L'],
    colorOptions: ['Black', 'White', 'Blue'],
    material: 'Premium Material',
    description: 'This is a premium ${name.toLowerCase()} for ${c}.',
    images: ['${image}'],
    status: 'published',
    isDummy: true,
    createdAt: new Date(),
  }`);
  }
}

const fileContent = `import { collection, getDocs, doc, writeBatch, query, where, limit } from 'firebase/firestore';
import { db } from './firebase';

const DUMMY_PRODUCTS = [${products.join(',')}
];

let isSeeding = false;

export async function seedProductsIfEmpty() {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const productsRef = collection(db, 'products');
    
    // Quick check if we have products
    const limitQuery = query(productsRef, limit(1));
    const limitSnapshot = await getDocs(limitQuery);
    
    if (!limitSnapshot.empty) {
      isSeeding = false;
      return; // Already has products, skip.
    }
    
    console.log('Seeding dummy products...');
    const batch = writeBatch(db);
    
    for (const product of DUMMY_PRODUCTS) {
      batch.set(doc(db, 'products', product.id), product);
    }
    await batch.commit();
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    isSeeding = false;
  }
}
`;

import('fs').then(fs => fs.writeFileSync('src/lib/seed.ts', fileContent));

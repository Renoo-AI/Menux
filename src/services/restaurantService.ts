import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import type { Restaurant, RestaurantDocument } from '@/types';

const COLLECTION = 'restaurants';

// Demo restaurant data for offline/fallback mode
const DEMO_RESTAURANTS: Record<string, Restaurant> = {
  'demo': {
    id: 'demo-restaurant-id',
    slug: 'demo',
    name: 'Café Élégance',
    status: 'ACTIVE',
    currency: 'EUR',
    cuisineType: 'French Café',
    address: '123 Rue de la Paix, Paris',
    phone: '+33 1 23 45 67 89',
    email: 'hello@cafe-elegance.fr',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'zcoffee': {
    id: 'demo-restaurant-zcoffee',
    slug: 'zcoffee',
    name: 'Z Coffee',
    status: 'ACTIVE',
    currency: 'TND',
    cuisineType: 'Coffee Shop',
    address: 'Tunisia',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Check if Firebase is available
function isFirebaseAvailable(): boolean {
  try {
    return !!db && !!db.app;
  } catch {
    return false;
  }
}

// Convert Firestore document to Restaurant type
function documentToRestaurant(doc: DocumentSnapshot): Restaurant | null {
  if (!doc.exists()) return null;
  
  const data = doc.data() as RestaurantDocument;
  return {
    id: doc.id,
    ...data,
    createdAt: new Date(data.createdAt.seconds * 1000),
    updatedAt: new Date(data.updatedAt.seconds * 1000),
  };
}

// Get restaurant by ID
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  // Check demo data first
  const demoRestaurant = Object.values(DEMO_RESTAURANTS).find(r => r.id === id);
  if (demoRestaurant) return demoRestaurant;
  
  if (!isFirebaseAvailable()) {
    return null;
  }
  
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);
    return documentToRestaurant(snapshot);
  } catch (error) {
    console.warn('Firebase getRestaurantById error:', error);
    return null;
  }
}

// Get restaurant by slug
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  // Check demo data first
  if (DEMO_RESTAURANTS[slug]) {
    return DEMO_RESTAURANTS[slug];
  }
  
  if (!isFirebaseAvailable()) {
    return null;
  }
  
  try {
    const q = query(
      collection(db, COLLECTION),
      where('slug', '==', slug)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    return documentToRestaurant(snapshot.docs[0]);
  } catch (error) {
    console.warn('Firebase getRestaurantBySlug error:', error);
    // Return demo data as fallback
    return DEMO_RESTAURANTS[slug] || null;
  }
}

// Subscribe to restaurant changes
export function subscribeToRestaurant(
  restaurantId: string,
  callback: (restaurant: Restaurant | null) => void
): () => void {
  // Check demo data first
  const demoRestaurant = Object.values(DEMO_RESTAURANTS).find(r => r.id === restaurantId);
  if (demoRestaurant) {
    callback(demoRestaurant);
    return () => {};
  }
  
  if (!isFirebaseAvailable()) {
    callback(null);
    return () => {};
  }
  
  try {
    const docRef = doc(db, COLLECTION, restaurantId);
    
    return onSnapshot(docRef, (snapshot) => {
      callback(documentToRestaurant(snapshot));
    }, (error) => {
      console.warn('Firebase subscribeToRestaurant error:', error);
      callback(null);
    });
  } catch (error) {
    console.warn('Firebase subscribeToRestaurant error:', error);
    callback(null);
    return () => {};
  }
}

export const restaurantService = {
  getById: getRestaurantById,
  getBySlug: getRestaurantBySlug,
  subscribe: subscribeToRestaurant,
  DEMO_RESTAURANTS,
};

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

// Convert Firestore document to Restaurant type
function documentToRestaurant(doc: DocumentSnapshot): Restaurant | null {
  if (!doc.exists()) return null;
  
  const data = doc.data() as RestaurantDocument;
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date(),
    updatedAt: data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000) : new Date(),
  };
}

// Get restaurant by ID
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);
    return documentToRestaurant(snapshot);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw new Error('Failed to fetch restaurant. Please check your connection.');
  }
}

// Get restaurant by slug
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('slug', '==', slug),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return documentToRestaurant(snapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Error fetching restaurant by slug:', error);
    throw new Error('Failed to fetch restaurant. Please check your connection.');
  }
}

// Subscribe to restaurant changes
export function subscribeToRestaurant(
  restaurantId: string,
  callback: (restaurant: Restaurant | null) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const docRef = doc(db, COLLECTION, restaurantId);
    
    return onSnapshot(docRef, (snapshot) => {
      const restaurant = documentToRestaurant(snapshot);
      callback(restaurant);
    }, (error) => {
      console.error('Error subscribing to restaurant:', error);
      if (onError) {
        onError(new Error('Failed to sync restaurant data.'));
      }
    });
  } catch (error) {
    console.error('Error setting up restaurant subscription:', error);
    if (onError) {
      onError(new Error('Failed to subscribe to restaurant.'));
    }
    return () => {};
  }
}

export const restaurantService = {
  getById: getRestaurantById,
  getBySlug: getRestaurantBySlug,
  subscribe: subscribeToRestaurant,
};

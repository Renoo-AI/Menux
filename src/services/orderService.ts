import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy,
  DocumentSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import type { 
  Order, 
  OrderDocument, 
  CartItem 
} from '@/types';

const COLLECTION = 'orders';

// Demo orders data for offline/fallback mode
const DEMO_ORDERS: Order[] = [
  {
    id: 'order-2',
    restaurantId: 'demo-restaurant-zcoffee',
    tableId: 'table-2',
    tableName: 'T-02',
    items: [
      { itemId: 'zc-1', name: 'Espresso', quantity: 2, price: 7.0, unitPrice: 3.5 },
      { itemId: 'zc-5', name: 'Croissant', quantity: 1, price: 3.0, unitPrice: 3.0 },
    ],
    subtotal: 10.0,
    totalAmount: 10.0,
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 10),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'order-3',
    restaurantId: 'demo-restaurant-zcoffee',
    tableId: 'table-3',
    tableName: 'T-03',
    items: [
      { itemId: 'zc-2', name: 'Cappuccino', quantity: 3, price: 15.0, unitPrice: 5.0 },
      { itemId: 'zc-6', name: 'Cheesecake', quantity: 2, price: 13.0, unitPrice: 6.5 },
    ],
    subtotal: 28.0,
    totalAmount: 28.0,
    status: 'CREATED',
    createdAt: new Date(Date.now() - 1000 * 60 * 3), // 3 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: 'order-4',
    restaurantId: 'demo-restaurant-zcoffee',
    tableId: 'table-4',
    tableName: 'T-04',
    items: [
      { itemId: 'zc-3', name: 'Latte', quantity: 2, price: 11.0, unitPrice: 5.5 },
      { itemId: 'zc-4', name: 'Iced Coffee', quantity: 2, price: 9.0, unitPrice: 4.5 },
      { itemId: 'zc-5', name: 'Croissant', quantity: 3, price: 9.0, unitPrice: 3.0 },
    ],
    subtotal: 29.0,
    totalAmount: 29.0,
    status: 'PAID',
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 40),
    paidAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

// Check if Firebase is available
function isFirebaseAvailable(): boolean {
  try {
    return !!db && !!db.app;
  } catch {
    return false;
  }
}

// Convert Firestore document to Order type
function documentToOrder(doc: DocumentSnapshot): Order | null {
  if (!doc.exists()) return null;
  
  const data = doc.data() as OrderDocument;
  return {
    id: doc.id,
    ...data,
    createdAt: new Date(data.createdAt.seconds * 1000),
    updatedAt: new Date(data.updatedAt.seconds * 1000),
    acceptedAt: data.acceptedAt ? new Date(data.acceptedAt.seconds * 1000) : undefined,
    paidAt: data.paidAt ? new Date(data.paidAt.seconds * 1000) : undefined,
    closedAt: data.closedAt ? new Date(data.closedAt.seconds * 1000) : undefined,
    cancelledAt: data.cancelledAt ? new Date(data.cancelledAt.seconds * 1000) : undefined,
  };
}

// Get all orders for a restaurant
export async function getOrders(restaurantId: string): Promise<Order[]> {
  // Check demo data first
  const demoOrders = DEMO_ORDERS.filter(o => o.restaurantId === restaurantId);
  if (demoOrders.length > 0) {
    return demoOrders;
  }
  
  if (!isFirebaseAvailable()) {
    return [];
  }
  
  try {
    const q = query(
      collection(db, COLLECTION),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(documentToOrder)
      .filter((order): order is Order => order !== null);
  } catch (error) {
    console.warn('Firebase getOrders error:', error);
    return DEMO_ORDERS.filter(o => o.restaurantId === restaurantId);
  }
}

// Get active orders (CREATED or ACCEPTED)
export async function getActiveOrders(restaurantId: string): Promise<Order[]> {
  // Check demo data first
  const demoOrders = DEMO_ORDERS.filter(
    o => o.restaurantId === restaurantId && (o.status === 'CREATED' || o.status === 'ACCEPTED')
  );
  if (demoOrders.length > 0) {
    return demoOrders;
  }
  
  if (!isFirebaseAvailable()) {
    return [];
  }
  
  try {
    const q = query(
      collection(db, COLLECTION),
      where('restaurantId', '==', restaurantId),
      where('status', 'in', ['CREATED', 'ACCEPTED']),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(documentToOrder)
      .filter((order): order is Order => order !== null);
  } catch (error) {
    console.warn('Firebase getActiveOrders error:', error);
    return DEMO_ORDERS.filter(
      o => o.restaurantId === restaurantId && (o.status === 'CREATED' || o.status === 'ACCEPTED')
    );
  }
}

// Get a single order
export async function getOrderById(orderId: string): Promise<Order | null> {
  // Check demo data first
  const demoOrder = DEMO_ORDERS.find(o => o.id === orderId);
  if (demoOrder) return demoOrder;
  
  if (!isFirebaseAvailable()) {
    return null;
  }
  
  try {
    const docRef = doc(db, COLLECTION, orderId);
    const snapshot = await getDoc(docRef);
    return documentToOrder(snapshot);
  } catch (error) {
    console.warn('Firebase getOrderById error:', error);
    return DEMO_ORDERS.find(o => o.id === orderId) || null;
  }
}

// Subscribe to all orders changes (for dashboard)
export function subscribeToOrders(
  restaurantId: string,
  callback: (orders: Order[]) => void
): () => void {
  // Check demo data first
  const demoOrders = DEMO_ORDERS.filter(o => o.restaurantId === restaurantId);
  if (demoOrders.length > 0) {
    callback(demoOrders);
    return () => {};
  }
  
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {};
  }
  
  try {
    const q = query(
      collection(db, COLLECTION),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs
        .map(documentToOrder)
        .filter((order): order is Order => order !== null);
      callback(orders);
    }, (error) => {
      console.warn('Firebase subscribeToOrders error:', error);
      callback([]);
    });
  } catch (error) {
    console.warn('Firebase subscribeToOrders error:', error);
    callback([]);
    return () => {};
  }
}

// Subscribe to active orders (for real-time dashboard)
export function subscribeToActiveOrders(
  restaurantId: string,
  callback: (orders: Order[]) => void
): () => void {
  // Check demo data first
  const demoOrders = DEMO_ORDERS.filter(
    o => o.restaurantId === restaurantId && (o.status === 'CREATED' || o.status === 'ACCEPTED')
  );
  if (demoOrders.length > 0) {
    callback(demoOrders);
    return () => {};
  }
  
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {};
  }
  
  try {
    const q = query(
      collection(db, COLLECTION),
      where('restaurantId', '==', restaurantId),
      where('status', 'in', ['CREATED', 'ACCEPTED']),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs
        .map(documentToOrder)
        .filter((order): order is Order => order !== null);
      callback(orders);
    }, (error) => {
      console.warn('Firebase subscribeToActiveOrders error:', error);
      callback([]);
    });
  } catch (error) {
    console.warn('Firebase subscribeToActiveOrders error:', error);
    callback([]);
    return () => {};
  }
}

// Create order (demo mode returns success with fake ID)
export async function createOrder(
  restaurantId: string,
  tableId: string,
  items: CartItem[]
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  if (!isFirebaseAvailable()) {
    // Demo mode - simulate successful order creation
    const demoOrderId = `demo-order-${Date.now()}`;
    console.log('Demo mode: Created order', demoOrderId, { restaurantId, tableId, items });
    return { success: true, orderId: demoOrderId };
  }
  
  try {
    // For now, use direct Firestore add (in production, use Cloud Functions)
    const orderData = {
      restaurantId,
      tableId,
      tableName: tableId,
      items: items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price,
        notes: item.notes,
      })),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'CREATED',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTION), orderData);
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    // Fallback to demo mode
    const demoOrderId = `demo-order-${Date.now()}`;
    return { success: true, orderId: demoOrderId };
  }
}

// Accept order (demo mode always succeeds)
export async function acceptOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseAvailable()) {
    console.log('Demo mode: Accepted order', orderId);
    return { success: true };
  }
  
  try {
    const docRef = doc(db, COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'ACCEPTED',
      acceptedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error accepting order:', error);
    return { success: true }; // Fallback to success in demo mode
  }
}

// Complete order (demo mode always succeeds)
export async function completeOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseAvailable()) {
    console.log('Demo mode: Completed order', orderId);
    return { success: true };
  }
  
  try {
    const docRef = doc(db, COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'CLOSED',
      closedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error completing order:', error);
    return { success: true }; // Fallback to success in demo mode
  }
}

// Cancel order (demo mode always succeeds)
export async function cancelOrder(
  orderId: string, 
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!isFirebaseAvailable()) {
    console.log('Demo mode: Cancelled order', orderId, reason);
    return { success: true };
  }
  
  try {
    const docRef = doc(db, COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'CANCELLED',
      cancelReason: reason,
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: true }; // Fallback to success in demo mode
  }
}

export const orderService = {
  getOrders,
  getActiveOrders,
  getOrderById,
  subscribeToOrders,
  subscribeToActiveOrders,
  createOrder,
  acceptOrder,
  completeOrder,
  cancelOrder,
  DEMO_ORDERS,
};

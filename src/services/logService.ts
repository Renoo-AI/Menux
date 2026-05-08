import { db } from '@/lib/firebase';
import { 
  collection, 
  doc,
  addDoc,
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  DocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import type { ActivityLog, ActivityLogDocument, LogAction, StaffRole } from '@/types';

const COLLECTION = 'logs';

// Convert Firestore document to ActivityLog type
function documentToActivityLog(docSnap: DocumentSnapshot): ActivityLog | null {
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data() as ActivityLogDocument;
  return {
    id: docSnap.id,
    ...data,
    createdAt: new Date(data.createdAt.seconds * 1000),
  };
}

// Create a new activity log
export async function createLog(params: {
  restaurantId: string;
  actorId?: string;
  actorName?: string;
  actorRole?: StaffRole | 'customer' | 'system';
  action: LogAction;
  targetType: 'order' | 'table' | 'menuItem' | 'staff' | 'restaurant';
  targetId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
}): Promise<string> {
  const logData = {
    restaurantId: params.restaurantId,
    actorId: params.actorId || 'system',
    actorName: params.actorName || 'System',
    actorRole: params.actorRole || 'system',
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    before: params.before || null,
    after: params.after || null,
    reason: params.reason || null,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, COLLECTION), logData);
  return docRef.id;
}

// Get recent activity logs for a restaurant
export async function getActivityLogs(
  restaurantId: string, 
  limitCount: number = 50
): Promise<ActivityLog[]> {
  const q = query(
    collection(db, COLLECTION),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(documentToActivityLog)
    .filter((log): log is ActivityLog => log !== null);
}

// Subscribe to activity logs changes
export function subscribeToActivityLogs(
  restaurantId: string,
  callback: (logs: ActivityLog[]) => void,
  limitCount: number = 50
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs
      .map(documentToActivityLog)
      .filter((log): log is ActivityLog => log !== null);
    callback(logs);
  });
}

// Get today's summary statistics
export async function getDailySummary(restaurantId: string): Promise<{
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const q = query(
    collection(db, COLLECTION),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  
  const snapshot = await getDocs(q);
  const logs = snapshot.docs
    .map(documentToActivityLog)
    .filter((log): log is ActivityLog => log !== null)
    .filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= today;
    });
  
  const orderLogs = logs.filter(l => l.action.startsWith('ORDER_'));
  
  return {
    totalOrders: orderLogs.filter(l => l.action === 'ORDER_CREATED').length,
    completedOrders: orderLogs.filter(l => l.action === 'ORDER_CLOSED').length,
    cancelledOrders: orderLogs.filter(l => l.action === 'ORDER_CANCELLED' || l.action === 'ORDER_REJECTED').length,
    revenue: 0, // This would be calculated from actual order data
  };
}

export const logService = {
  createLog,
  getActivityLogs,
  subscribeToActivityLogs,
  getDailySummary,
};

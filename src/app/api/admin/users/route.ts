import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { verifySuperAdmin, getAdminApp, isFallbackSuperadmin } from '@/lib/admin-auth';
import { checkRateLimit, rateLimitResponse, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

function sanitizeText(text: string, maxLength: number = 200): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').slice(0, maxLength);
}

// GET - Fetch users with pagination and rate limiting
export async function GET(request: NextRequest) {
  const user = await verifySuperAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit by admin UID
  const rateLimitResult = checkRateLimit(user.uid, RATE_LIMIT_CONFIGS.adminUsers);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult.retryAfter);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100 per page
    
    const app = getAdminApp();
    const db = getFirestore(app);
    
    // Get total count (approximate - Firestore doesn't have efficient counting)
    const usersSnap = await db.collection('users').get().catch(() => ({ docs: [] as any[] }));
    const bansSnap = await db.collection('banned_users').get().catch(() => ({ docs: [] as any[] }));
    
    const totalUsers = usersSnap.docs.length;
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const users = usersSnap.docs
      .slice(startIndex, endIndex)
      .map((d: any) => ({ id: d.id, ...d.data() }));
    const bannedUsers = bansSnap.docs.map((d: any) => d.id);

    // Log the admin query for audit
    await db.collection('system_logs').add({
      type: 'ADMIN_USERS_QUERY',
      message: `Admin queried users list`,
      details: {
        adminUid: user.uid,
        page,
        limit,
        totalUsers,
        querySize: users.length,
      },
      timestamp: Date.now(),
    });

    return NextResponse.json({ 
      success: true, 
      users, 
      bannedUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasMore: page < totalPages,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Ban/Unban user
export async function POST(request: NextRequest) {
  const user = await verifySuperAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit by admin UID
  const rateLimitResult = checkRateLimit(user.uid, RATE_LIMIT_CONFIGS.adminUsers);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult.retryAfter);
  }

  try {
    const body = await request.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    if (!['ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "ban" or "unban"' }, { status: 400 });
    }
    
    // Prevent banning superadmin (check both fallback UID and custom claim)
    if (isFallbackSuperadmin(userId)) {
      return NextResponse.json({ error: 'Cannot ban superadmin' }, { status: 403 });
    }

    const app = getAdminApp();
    const db = getFirestore(app);

    if (action === 'ban') {
      const sanitizedReason = reason ? sanitizeText(reason, 500) : 'Banned by SuperAdmin';
      
      await db.collection('banned_users').doc(userId).set({
        reason: sanitizedReason,
        bannedAt: Date.now(),
        bannedBy: user.uid,
      });

      // Log the action
      await db.collection('system_logs').add({
        type: 'USER_BANNED',
        message: `User ${userId} has been banned`,
        details: { userId, reason: sanitizedReason },
        timestamp: Date.now(),
        adminUid: user.uid,
      });

      return NextResponse.json({ success: true, action: 'banned' });
    } else {
      await db.collection('banned_users').doc(userId).delete();

      // Log the action
      await db.collection('system_logs').add({
        type: 'USER_UNBANNED',
        message: `User ${userId} has been unbanned`,
        details: { userId },
        timestamp: Date.now(),
        adminUid: user.uid,
      });

      return NextResponse.json({ success: true, action: 'unbanned' });
    }
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

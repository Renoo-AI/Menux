'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { StaffSession, StaffRole } from '@/types';

interface StaffSessionContextType {
  session: StaffSession | null;
  isLoading: boolean;
  isStaffAuthenticated: boolean;
  loginStaff: (restaurantSlug: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logoutStaff: () => void;
  currentStaff: StaffSession | null;
  currentRestaurant: { id: string; slug: string; name: string } | null;
}

const StaffSessionContext = createContext<StaffSessionContextType | undefined>(undefined);

const STORAGE_KEY = 'menux_staff_session';

// Demo staff data for testing without Firebase
const DEMO_STAFF: Record<string, { restaurantId: string; restaurantSlug: string; restaurantName: string; staffId: string; staffName: string; role: StaffRole; pin: string }> = {
  'zcoffee-1234': {
    restaurantId: 'demo-restaurant-zcoffee',
    restaurantSlug: 'zcoffee',
    restaurantName: 'Z Coffee',
    staffId: 'demo-staff-001',
    staffName: 'Cashier Demo',
    role: 'cashier',
    pin: '1234',
  },
  'zcoffee-5678': {
    restaurantId: 'demo-restaurant-zcoffee',
    restaurantSlug: 'zcoffee',
    restaurantName: 'Z Coffee',
    staffId: 'demo-staff-002',
    staffName: 'Owner Demo',
    role: 'owner',
    pin: '5678',
  },
};

export function StaffSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StaffSession;
        setSession(parsed);
      }
    } catch (error) {
      console.error('Failed to load staff session:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login with restaurant slug + PIN
  const loginStaff = useCallback(async (restaurantSlug: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // For MVP, use demo authentication
      // In production, this would call a Firebase Cloud Function
      const key = `${restaurantSlug.toLowerCase()}-${pin}`;
      const demoStaff = DEMO_STAFF[key];
      
      if (demoStaff) {
        const newSession: StaffSession = {
          restaurantId: demoStaff.restaurantId,
          restaurantSlug: demoStaff.restaurantSlug,
          restaurantName: demoStaff.restaurantName,
          staffId: demoStaff.staffId,
          staffName: demoStaff.staffName,
          role: demoStaff.role,
        };
        
        setSession(newSession);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
        
        return { success: true };
      }
      
      // Invalid credentials
      return { success: false, error: 'Invalid restaurant code or PIN' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logoutStaff = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: StaffSessionContextType = {
    session,
    isLoading,
    isStaffAuthenticated: session !== null,
    loginStaff,
    logoutStaff,
    currentStaff: session,
    currentRestaurant: session ? {
      id: session.restaurantId,
      slug: session.restaurantSlug,
      name: session.restaurantName,
    } : null,
  };

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSession() {
  const context = useContext(StaffSessionContext);
  if (context === undefined) {
    throw new Error('useStaffSession must be used within a StaffSessionProvider');
  }
  return context;
}

// Hook for protecting staff routes
export function useRequireStaff(allowedRoles?: StaffRole[]) {
  const { session, isLoading, isStaffAuthenticated } = useStaffSession();
  
  const hasRequiredRole = !allowedRoles || (session && allowedRoles.includes(session.role));
  
  return {
    session,
    isLoading,
    isStaffAuthenticated,
    hasRequiredRole,
    isAuthorized: isStaffAuthenticated && hasRequiredRole,
  };
}

export default StaffSessionContext;

'use client';

import { ReactNode } from 'react';
import { SideNavBar } from './SideNavBar';
import { BottomNavBar } from './BottomNavBar';

import type { StaffRole } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  restaurantName?: string;
  userRole?: StaffRole;
}

export function DashboardLayout({ children, restaurantName, userRole }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNavBar restaurantName={restaurantName} userRole={userRole} />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      <BottomNavBar variant="dashboard" />
    </div>
  );
}

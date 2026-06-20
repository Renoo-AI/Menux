'use client';

import { ReactNode } from 'react';

export function StaffManager({ children }: { children?: ReactNode }) {
  return <div>{children || <p className="text-center py-10 opacity-30 text-xs uppercase tracking-widest">Staff Manager — Coming Soon</p>}</div>;
}

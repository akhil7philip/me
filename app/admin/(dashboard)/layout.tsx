"use client";

import { ProtectedRoute } from '@/components/admin/protected-route';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden">
          <aside className="w-64 hidden md:block">
            <AdminSidebar />
          </aside>
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
        <Toaster />
      </ProtectedRoute>
    </AuthProvider>
  );
}

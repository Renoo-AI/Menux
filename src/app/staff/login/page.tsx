'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffSession } from '@/contexts/StaffSessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const { loginStaff, isStaffAuthenticated, isLoading: sessionLoading } = useStaffSession();
  
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A322D]" />
      </div>
    );
  }

  if (isStaffAuthenticated) {
    router.push('/staff/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginStaff(restaurantSlug, pin);
      
      if (result.success) {
        router.push('/staff/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await loginStaff('zcoffee', '1234');
      
      if (result.success) {
        router.push('/staff/dashboard');
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch {
      setError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9] p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#EFE4D8] rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#C9A07E]/20 rounded-full opacity-50 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-xl bg-white/90 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#3A322D] to-[#5A4A3D] flex items-center justify-center">
            <Coffee className="h-8 w-8 text-[#C9A07E]" />
          </div>
          <CardTitle className="text-2xl font-serif text-[#3A322D]">Staff Login</CardTitle>
          <CardDescription className="text-[#5A4A3D]">
            Enter your restaurant code and PIN to access the dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant" className="text-[#3A322D] font-medium">
                Restaurant Code
              </Label>
              <Input
                id="restaurant"
                type="text"
                placeholder="e.g., zcoffee"
                value={restaurantSlug}
                onChange={(e) => setRestaurantSlug(e.target.value.toLowerCase())}
                className="h-12 border-[#EFE4D8] focus:border-[#C9A07E] focus:ring-[#C9A07E]"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="text-[#3A322D] font-medium">
                Staff PIN
              </Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 pr-12 border-[#EFE4D8] focus:border-[#C9A07E] focus:ring-[#C9A07E]"
                  disabled={isLoading}
                  required
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A4A3D] hover:text-[#3A322D]"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#3A322D] hover:bg-[#5A4A3D] text-white font-medium"
              disabled={isLoading || !restaurantSlug || !pin}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EFE4D8]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#5A4A3D]">Quick Access</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-[#C9A07E] text-[#C9A07E] hover:bg-[#C9A07E]/10"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Coffee className="mr-2 h-4 w-4" />
            )}
            Demo: Z Coffee (PIN: 1234)
          </Button>

          <p className="text-center text-xs text-[#5A4A3D] mt-4">
            Contact your manager if you need access credentials
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

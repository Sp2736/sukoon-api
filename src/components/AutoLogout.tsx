'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/supabase/client';

export default function AutoLogout() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timeoutId: NodeJS.Timeout;

    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.expires_at) {
        // expires_at is in seconds since epoch
        const now = Math.floor(Date.now() / 1000);
        
        // Target logout time: 120 seconds (2 mins) BEFORE the token actually expires
        const logoutTime = session.expires_at - 120;
        const timeUntilLogoutMs = (logoutTime - now) * 1000;

        if (timeUntilLogoutMs > 0) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(async () => {
            console.log("Session nearing expiry. Auto-logging out...");
            await supabase.auth.signOut();
            router.push('/admin/login');
            router.refresh();
          }, timeUntilLogoutMs);
        } else {
          // If we are already past the 58-minute mark, log out immediately
          await supabase.auth.signOut();
          router.push('/admin/login');
          router.refresh();
        }
      }
    };

    // Run immediately on mount
    handleSession();

    // Listen for auth events (e.g., background token refresh or manual login)
    // If the token refreshes automatically, this resets the 58-minute timer.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleSession();
      } else if (event === 'SIGNED_OUT') {
        clearTimeout(timeoutId);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router]);

  return null; // This is a logic-only component
}
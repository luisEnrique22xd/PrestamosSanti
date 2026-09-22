'use client';
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    // Si no hay token y no estás en el login, a volar
    if (!token && pathname !== '/login') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== '/login') {
    return null; // O un spinner de carga
  }

  return <>{children}</>;
}
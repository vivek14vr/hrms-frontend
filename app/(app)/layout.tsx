'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell';
import { LoadingSkeleton } from '@/components/ui';
import { useSession } from '@/lib/queries';
export default function ProtectedLayout({ children }: { children: React.ReactNode }) { const { data, isLoading } = useSession(); const router = useRouter(); const pathname = usePathname(); useEffect(() => { if (!isLoading && !data) router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [data, isLoading, pathname, router]); if (isLoading || !data) return <div className="mx-auto max-w-md p-8"><LoadingSkeleton rows={5} /></div>; return <AppShell>{children}</AppShell>; }

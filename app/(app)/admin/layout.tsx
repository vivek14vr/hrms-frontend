'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { roleCanManage, useSession } from '@/lib/queries';
import { LoadingSkeleton } from '@/components/ui';
export default function AdminLayout({ children }: { children: React.ReactNode }) { const { data, isLoading } = useSession(); const router = useRouter(); useEffect(() => { if (!isLoading && data && !roleCanManage(data.user.role)) router.replace('/dashboard'); }, [data, isLoading, router]); if (isLoading || !data || !roleCanManage(data.user.role)) return <div className="mx-auto max-w-md p-8"><LoadingSkeleton rows={4} /></div>; return children; }

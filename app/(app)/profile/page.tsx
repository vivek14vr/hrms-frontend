'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/queries';
import { LoadingSkeleton } from '@/components/ui';
export default function ProfilePage() { const { data, isLoading } = useSession(); const router = useRouter(); useEffect(() => { if (data?.employee?.id) router.replace(`/employees/${data.employee.id}`); }, [data, router]); if (isLoading) return <LoadingSkeleton rows={6} />; return <LoadingSkeleton rows={4} />; }

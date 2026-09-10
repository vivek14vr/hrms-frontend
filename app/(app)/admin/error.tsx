'use client';
import { ErrorState } from '@/components/ui';
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <ErrorState message="The admin section could not load." retry={reset} />; }

'use client';

import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLogin } from '@/lib/queries';
import { Button, FormField, Input, MiniCheck, Spinner, cn } from './ui';

type Portal = 'shared' | 'admin' | 'employee';

const demoCredentials = {
  admin: { label: 'Admin', email: 'admin@peopleos.demo', password: 'Admin@123' },
  employee: { label: 'Employee', email: 'employee@peopleos.demo', password: 'Employee@123' },
} as const;

export function LoginScreen({ portal = 'shared' }: { portal?: Portal }) {
  const router = useRouter();
  const login = useLogin();
  const fixed = portal !== 'shared';
  const [mode, setMode] = useState<'admin' | 'employee'>(portal === 'employee' ? 'employee' : 'admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({ email: email.trim(), password, portal: mode }, {
      onSuccess: (data) => {
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
        router.replace(data.user.role === 'EMPLOYEE' ? '/dashboard' : '/admin');
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return <main className="grid min-h-dvh bg-[#fffdf9] lg:grid-cols-[1.02fr_0.98fr]">
    <section className="relative hidden overflow-hidden bg-[#1f2229] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
      <div className="absolute -right-32 -top-36 h-[500px] w-[500px] rounded-full border-[70px] border-[#d8f25d]/15" />
      <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#ff725c]/15 blur-3xl" />
      <div className="relative"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff725c] shadow-[0_4px_0_#c84535]"><Sparkles className="h-[18px] w-[18px]" /></span><span className="text-[19px] font-black tracking-tight">PeopleOS</span></div><div className="mt-24 max-w-lg"><p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#d8f25d]">The people operations OS</p><h1 className="font-display text-5xl leading-[1.02] tracking-tight xl:text-7xl">People operations,<br /><em className="text-[#ff725c]">without</em> the busywork.</h1><p className="mt-7 max-w-md text-base leading-7 text-[#b8bac0]">A beautifully clear home for the moments that make work feel like work — from first day to payday.</p></div></div>
      <div className="relative grid max-w-xl grid-cols-3 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-2xl font-bold">98.4%</p><p className="mt-1 text-[11px] text-[#9d9fa6]">attendance clarity</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-2xl font-bold">12k+</p><p className="mt-1 text-[11px] text-[#9d9fa6]">people moments</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-2xl font-bold">1 view</p><p className="mt-1 text-[11px] text-[#9d9fa6]">for the whole team</p></div></div>
    </section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-[440px]">
      <div className="mb-10 lg:hidden"><div className="mb-8 flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff725c] text-white"><Sparkles className="h-[18px] w-[18px]" /></span><span className="text-[19px] font-black">PeopleOS</span></div></div>
      <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ff725c]">Welcome back</p><h2 className="font-display text-4xl leading-tight">{portal === 'employee' ? 'Your workday, in one place.' : portal === 'admin' ? 'Your people, in focus.' : 'People operations, made human.'}</h2><p className="mt-3 text-sm text-[#777982]">{portal === 'employee' ? 'Sign in to see your attendance, pay, and profile.' : 'Sign in to continue to your PeopleOS workspace.'}</p></div>
      {!fixed && <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#f2f1ed] p-1.5"><button type="button" className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition', mode === 'admin' ? 'bg-white text-[#1f2229] shadow-sm' : 'text-[#777982]')} onClick={() => setMode('admin')}><ShieldCheck className="h-4 w-4" />Admin</button><button type="button" className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition', mode === 'employee' ? 'bg-white text-[#1f2229] shadow-sm' : 'text-[#777982]')} onClick={() => setMode('employee')}><UsersRound className="h-4 w-4" />Employee</button></div>}
      <form onSubmit={submit} className="space-y-5"><FormField label="Work email"><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9b9da2]" /><Input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="pl-10" /></div></FormField><FormField label="Password"><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-[#9b9da2]" /><Input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="pl-10 pr-11" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#8f9198] hover:bg-[#f4f2ed]" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormField><Button type="submit" size="lg" className="mt-2 w-full" disabled={login.isPending}>{login.isPending ? <Spinner /> : <ArrowRight className="order-2 h-4 w-4" />}<span>{login.isPending ? 'Signing you in…' : `Continue as ${mode === 'admin' ? 'admin' : 'employee'}`}</span></Button></form>
      <div className="mt-6 rounded-2xl border border-[#e9e4d9] bg-[#fffaf1] p-4"><div className="mb-3 flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#c24b3d]" /><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#777982]">Demo credentials</p></div><button type="button" className="w-full rounded-xl border border-[#eee2d0] bg-white p-3 text-left transition hover:border-[#ffb1a5]" onClick={() => { setEmail(demoCredentials[mode].email); setPassword(demoCredentials[mode].password); }}><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-[#25272c]">{demoCredentials[mode].label} portal</span><span className="text-[11px] font-bold text-[#c24b3d]">Click to fill</span></div><p className="mt-2 break-all font-mono text-xs text-[#777982]">{demoCredentials[mode].email}</p><p className="mt-1 font-mono text-xs text-[#777982]">{demoCredentials[mode].password}</p></button><p className="mt-2 text-[11px] leading-4 text-[#898b91]">For local/demo environments only. Change seeded passwords before deployment.</p></div>
      <p className="mt-4 text-right text-xs text-[#777982]"><Link href="/reset-password" className="font-semibold text-[#c24b3d] underline underline-offset-2">Use a password setup link</Link></p>
      <div className="mt-8 space-y-2.5"><MiniCheck>Secure session with HttpOnly cookies</MiniCheck><MiniCheck>Role-aware access for every team member</MiniCheck></div>
    </div></section>
  </main>;
}

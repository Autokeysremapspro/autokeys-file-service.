'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'
export default function Perfil(){const [email,setEmail]=useState('');useEffect(()=>{supabase.auth.getUser().then(({data})=>setEmail(data.user?.email||''))},[]);return <AppShell><h1 className="text-4xl font-black">Mi perfil</h1><div className="card mt-6 p-6"><p className="text-zinc-500">Email</p><p className="mt-1 text-xl font-black">{email||'—'}</p></div></AppShell>}

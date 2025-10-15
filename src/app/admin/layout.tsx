import AdminShell from "@/components/admin/AdminShell";
import { ReactNode } from "react";
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin');

  return <AdminShell>{children}</AdminShell>;
}


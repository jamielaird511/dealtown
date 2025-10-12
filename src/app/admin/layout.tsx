import AdminShell from "@/components/admin/AdminShell";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}


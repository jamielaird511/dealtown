import { AdminCard } from "@/components/admin/AdminCard";
import { requireAdmin } from "@/lib/auth";
import SignOutButton from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const { user } = await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard title="Venues" description="Manage venues." href="/admin/venues" />
        <AdminCard title="Deals" description="Daily food & drink deals." href="/admin/deals" />
        <AdminCard title="Happy Hour" description="Times & days for drink specials." href="/admin/happy-hours" />
        <AdminCard title="Lunch Menus" description="Add, edit, and archive lunch menu items." href="/admin/lunch" />
      </div>
    </div>
  );
}

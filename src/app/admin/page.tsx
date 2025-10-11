import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage venues, deals, and fuel prices
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Review community submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/submissions">
              <Button className="w-full" variant="default">
                View Submissions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
            <CardDescription>Manage local venues</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Venues
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deals</CardTitle>
            <CardDescription>Manage active deals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Deals
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" variant="secondary">
            Add New Venue
          </Button>
          <Button className="w-full" variant="secondary">
            Create New Deal
          </Button>
          <Button className="w-full" variant="secondary">
            Update Fuel Price
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


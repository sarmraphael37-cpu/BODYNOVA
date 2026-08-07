import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getUsers } from "@/features/admin/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/utils/dates";

export const metadata: Metadata = {
  title: "Users",
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          All registered profiles on BodyNova.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered users</CardTitle>
          <CardDescription>Showing up to 100 most recent.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users yet"
              description="Profiles appear here as people sign up."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-2.5 pr-4 font-medium">
                        {user.full_name || "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={user.role === "admin" ? "success" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge
                          variant={user.onboarding_completed ? "outline" : "warning"}
                        >
                          {user.onboarding_completed ? "Onboarded" : "Incomplete"}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

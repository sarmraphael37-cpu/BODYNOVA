import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getAuditLogs } from "@/features/admin/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/utils/dates";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Administrative actions performed on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Showing up to 50 most recent events.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No audit events"
              description="Administrative actions will appear here."
            />
          ) : (
            <ul className="divide-y">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.entity_type}
                      {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(log.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

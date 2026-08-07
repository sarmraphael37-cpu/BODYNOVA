import type { Metadata } from "next";
import { FileBarChart } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getReports } from "@/features/analytics/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/dates";
import type { ProgressReport } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Progress Reports",
  description: "Your weekly and monthly progress summaries.",
};

function formatReportValue(value: unknown): string {
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "—";
  return JSON.stringify(value);
}

function ReportCard({ report }: { report: ProgressReport }) {
  const periodLabel = report.period === "monthly" ? "Monthly" : "Weekly";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{periodLabel}</CardTitle>
          <Badge variant="secondary">{periodLabel}</Badge>
        </div>
        <CardDescription>
          {formatDate(report.period_start)} → {formatDate(report.period_end)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {Object.entries(report.data).map(([key, value]) => (
            <li
              key={key}
              className="flex items-center justify-between gap-4 py-2"
            >
              <span className="text-sm font-medium capitalize">
                {key.replace("_", " ")}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatReportValue(value)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default async function ReportsPage() {
  await requireProfile();
  const reports = await getReports();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress Reports</h1>
        <p className="text-sm text-muted-foreground">
          Review your weekly and monthly progress summaries.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No progress reports yet"
          description="Weekly and monthly reports appear here once they are generated."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

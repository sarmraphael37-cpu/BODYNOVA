import type { Metadata } from "next";
import { CalendarDays, CalendarRange, FileBarChart } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getReports } from "@/features/analytics/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/dates";
import type { ProgressReport } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Progress Reports",
  description: "Your weekly and monthly progress summaries.",
};

function formatReportKey(key: string): string {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatReportValue(value: unknown): string {
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    return value.length > 0 ? `${formatNumber(value.length)} items` : "None";
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "—";
    return entries
      .map(([key, item]) => `${formatReportKey(key)}: ${formatReportValue(item)}`)
      .join(", ");
  }
  return String(value);
}

function ReportCard({ report }: { report: ProgressReport }) {
  const isMonthly = report.period === "monthly";
  const PeriodIcon = isMonthly ? CalendarRange : CalendarDays;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PeriodIcon className="h-4 w-4 text-primary" aria-hidden />
          {isMonthly ? "Monthly" : "Weekly"} report
        </CardTitle>
        <CardDescription>
          {formatDate(report.period_start)} → {formatDate(report.period_end)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(report.data).length === 0 ? (
          <p className="text-sm text-muted-foreground">No summary data available.</p>
        ) : (
          <ul className="divide-y">
            {Object.entries(report.data).map(([key, value]) => (
              <li
                key={key}
                className="flex items-start justify-between gap-4 py-2"
              >
                <span className="text-sm font-medium">{formatReportKey(key)}</span>
                <span className="text-right text-sm text-muted-foreground">
                  {formatReportValue(value)}
                </span>
              </li>
            ))}
          </ul>
        )}
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

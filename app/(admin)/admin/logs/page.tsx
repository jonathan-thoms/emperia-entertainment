"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAuditLogs, type AuditLogRecord } from "@/actions/logs";
import {
  Search,
  SlidersHorizontal,
  Download,
  ShieldCheck,
  Activity,
  CalendarDays,
  Ticket,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { format } from "date-fns";

// ── Action Config ────────────────────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  MANUAL_STATUS_OVERRIDE: {
    label: "Status Override",
    icon: Ticket,
    className: "bg-error/10 text-error border-error/20",
  },
  ROLE_CHANGED: {
    label: "Role Changed",
    icon: ShieldCheck,
    className: "bg-purple/10 text-purple border-purple/20",
  },
  EVENT_CREATED: {
    label: "Event Created",
    icon: CalendarDays,
    className: "bg-gold/10 text-gold border-gold/20",
  },
  EVENT_UPDATED: {
    label: "Event Updated",
    icon: Activity,
    className: "bg-blue/10 text-blue border-blue/20",
  },
  EVENT_DELETED: {
    label: "Event Deleted",
    icon: Activity,
    className: "bg-error/10 text-error border-error/20",
  },
};

const DEFAULT_ACTION_CONFIG = {
  label: "Unknown",
  icon: Activity,
  className: "bg-outline/10 text-outline border-outline/20",
};

// ── Helpers ──────────────────────────────────────────────────────────────────────
function formatTimestamp(iso: string) {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "MMM d, yyyy · h:mm a");
  } catch {
    return "—";
  }
}

function formatRelativeTime(iso: string): string {
  if (!iso) return "";
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return "";
}

function truncateId(id: string) {
  if (!id || id.length <= 10) return id || "—";
  return `${id.substring(0, 8)}…`;
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────────
function LogsSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      <div>
        <div className="h-4 w-16 rounded shimmer mb-3" />
        <div className="h-8 w-48 rounded shimmer mb-2" />
        <div className="h-4 w-80 rounded shimmer" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl shimmer" />
        ))}
      </div>
      <div className="h-12 rounded-xl shimmer" />
      <div className="h-[500px] rounded-2xl shimmer" />
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────────
export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(() => {
    setLoading(true);
    fetchAuditLogs()
      .then(setLogs)
      .catch((err) => console.error("[Logs] Failed to fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = logs.length;
    const overrides = logs.filter((l) => l.action === "MANUAL_STATUS_OVERRIDE").length;
    const roleChanges = logs.filter((l) => l.action === "ROLE_CHANGED").length;
    const eventActions = logs.filter((l) => l.action.startsWith("EVENT_")).length;
    return { total, overrides, roleChanges, eventActions };
  }, [logs]);

  // Excel export
  const handleExport = async () => {
    const XLSX = await import("xlsx");

    const exportData = filteredLogs.map((log) => ({
      "Timestamp": log.timestamp ? format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss") : "",
      "Action": log.actionLabel,
      "Admin": log.adminEmail || log.adminId,
      "Target ID": log.targetId,
      "Details": log.details,
      "Log ID": log.id,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...exportData.map((r) => String(r[key as keyof typeof r] || "").length)).toString().length + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `emperia-audit-logs-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  if (loading) return <LogsSkeleton />;

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <span className="label-upper text-purple-container tracking-[0.12em] mb-2 block">
            Audit
          </span>
          <h1 className="headline-lg">Audit Logs</h1>
          <p className="text-sm text-on-surface-variant mt-2 tracking-wide">
            Complete audit trail of all admin actions. Export to Excel for compliance reporting.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={loadLogs}
            className="p-2.5 rounded-xl bg-surface-container-low ghost-border text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-300"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold
              bg-gradient-to-br from-gold to-gold-container text-gold-on
              tracking-wider uppercase
              hover:shadow-glow-gold transition-all duration-300
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── Quick Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up-delay-1">
        {[
          { label: "Total Entries", value: stats.total, color: "text-on-surface", icon: Clock },
          { label: "Status Overrides", value: stats.overrides, color: "text-error", icon: Ticket },
          { label: "Role Changes", value: stats.roleChanges, color: "text-purple", icon: ShieldCheck },
          { label: "Event Actions", value: stats.eventActions, color: "text-gold", icon: CalendarDays },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low rounded-xl px-4 py-3 ghost-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                {stat.label}
              </p>
            </div>
            <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up-delay-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search by admin, details, or target ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-11 pr-4 py-3 rounded-xl
              bg-surface-container-low text-on-surface text-sm
              ghost-border placeholder:text-outline
              focus:outline-none focus:border-gold/40
              transition-colors duration-300
            "
          />
        </div>

        <Select
          value={actionFilter}
          onValueChange={setActionFilter}
        >
          <SelectTrigger className="w-full sm:w-52 bg-surface-container-low ghost-border rounded-xl text-sm text-on-surface-variant h-auto py-3">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-outline" />
            <SelectValue placeholder="Filter action" />
          </SelectTrigger>
          <SelectContent className="bg-surface-container-highest border-outline-variant/20 rounded-xl">
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="MANUAL_STATUS_OVERRIDE">Status Overrides</SelectItem>
            <SelectItem value="ROLE_CHANGED">Role Changes</SelectItem>
            <SelectItem value="EVENT_CREATED">Event Created</SelectItem>
            <SelectItem value="EVENT_UPDATED">Event Updated</SelectItem>
            <SelectItem value="EVENT_DELETED">Event Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────── */}
      <Card className="bg-surface-container-low border-outline-variant/10 rounded-2xl overflow-hidden animate-fade-up-delay-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
            Audit Trail ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant/10 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold pl-6">
                    Timestamp
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold">
                    Action
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden md:table-cell">
                    Admin
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden lg:table-cell">
                    Target
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold pr-6">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-16 text-on-surface-variant text-sm"
                    >
                      {logs.length === 0
                        ? "No audit logs yet. Actions will appear here as admins make changes."
                        : "No logs match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const config = ACTION_CONFIG[log.action] || DEFAULT_ACTION_CONFIG;
                    const ActionIcon = config.icon;
                    const relativeTime = formatRelativeTime(log.timestamp);

                    return (
                      <TableRow
                        key={log.id}
                        className="border-outline-variant/8 hover:bg-surface-container/50 transition-colors duration-200"
                      >
                        <TableCell className="pl-6">
                          <div>
                            <p className="text-xs text-on-surface whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </p>
                            {relativeTime && (
                              <p className="text-[10px] text-outline mt-0.5">{relativeTime}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] tracking-widest uppercase font-semibold gap-1.5 ${config.className}`}
                          >
                            <ActionIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant hidden md:table-cell">
                          {log.adminEmail || truncateId(log.adminId)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="font-mono text-xs text-on-surface-variant">
                            {truncateId(log.targetId)}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 max-w-[300px]">
                          <p className="text-xs text-on-surface-variant truncate">
                            {log.details}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

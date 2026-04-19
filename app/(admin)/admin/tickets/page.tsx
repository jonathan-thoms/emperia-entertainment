"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overrideTicketStatus, type TicketStatus } from "@/actions/tickets";
import { fetchAllTickets, type TicketRecord } from "@/actions/admin";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ── Status Badge Config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  scanned: {
    label: "Scanned",
    className: "bg-blue/10 text-blue border-blue/20 hover:bg-blue/15",
  },
  revoked: {
    label: "Revoked",
    className: "bg-error/10 text-error border-error/20 hover:bg-error/15",
  },
  expired: {
    label: "Expired",
    className: "bg-outline/10 text-outline border-outline/20 hover:bg-outline/15",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────────
function truncateUUID(id: string) {
  return `${id.substring(0, 8)}…`;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────────
function TicketsSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      <div>
        <div className="h-4 w-24 rounded shimmer mb-3" />
        <div className="h-8 w-56 rounded shimmer mb-2" />
        <div className="h-4 w-80 rounded shimmer" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl shimmer" />
        ))}
      </div>
      <div className="h-12 rounded-xl shimmer" />
      <div className="h-96 rounded-2xl shimmer" />
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────────
export default function TicketManagerPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch tickets from Firestore
  useEffect(() => {
    fetchAllTickets()
      .then(setTickets)
      .catch((err) => console.error("[Tickets] Failed to fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        searchQuery === "" ||
        ticket.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.eventName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  // Open override dialog
  const openOverrideDialog = (ticket: TicketRecord) => {
    setSelectedTicket(ticket);
    setNewStatus("");
    setActionResult(null);
    setDialogOpen(true);
  };

  // Execute override
  const handleOverride = () => {
    if (!selectedTicket || !newStatus || !profile) return;

    startTransition(async () => {
      const result = await overrideTicketStatus(
        selectedTicket.id,
        newStatus as TicketStatus,
        selectedTicket.status,
        profile.uid
      );

      if (result.success) {
        // Update local state
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id ? { ...t, status: newStatus as TicketStatus } : t
          )
        );
        setActionResult({
          type: "success",
          message: `Ticket status updated to "${newStatus}". Audit log recorded.`,
        });
        // Auto-close after success
        setTimeout(() => {
          setDialogOpen(false);
          setActionResult(null);
        }, 2000);
      } else {
        setActionResult({
          type: "error",
          message: "error" in result ? result.error : "An unknown error occurred.",
        });
      }
    });
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const active = tickets.filter((t) => t.status === "active").length;
    const scanned = tickets.filter((t) => t.status === "scanned").length;
    const revoked = tickets.filter((t) => t.status === "revoked").length;
    return { total, active, scanned, revoked };
  }, [tickets]);

  if (loading) return <TicketsSkeleton />;

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <span className="label-upper text-purple-container tracking-[0.12em] mb-2 block">
          Management
        </span>
        <h1 className="headline-lg">Ticket Manager</h1>
        <p className="text-sm text-on-surface-variant mt-2 tracking-wide">
          View, search, and manage all platform tickets. Override statuses with full audit logging.
        </p>
      </div>

      {/* ── Quick Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up-delay-1">
        {[
          { label: "Total", value: stats.total, color: "text-on-surface" },
          { label: "Active", value: stats.active, color: "text-emerald-400" },
          { label: "Scanned", value: stats.scanned, color: "text-blue" },
          { label: "Revoked", value: stats.revoked, color: "text-error" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low rounded-xl px-4 py-3 ghost-border"
          >
            <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-up-delay-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Search by email, name, ticket ID, or event..."
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

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-48 bg-surface-container-low ghost-border rounded-xl text-sm text-on-surface-variant h-auto py-3">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-outline" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-surface-container-highest border-outline-variant/20 rounded-xl">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scanned">Scanned</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────── */}
      <Card className="bg-surface-container-low border-outline-variant/10 rounded-2xl overflow-hidden animate-fade-up-delay-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
            All Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant/10 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold pl-6">
                    Ticket ID
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold">
                    Buyer
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden md:table-cell">
                    Event
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden lg:table-cell">
                    Tier
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden lg:table-cell">
                    Price
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold pr-6 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-16 text-on-surface-variant text-sm"
                    >
                      {tickets.length === 0
                        ? "No tickets found. Seed the database to populate demo data."
                        : "No tickets match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    const statusCfg = STATUS_CONFIG[ticket.status];
                    return (
                      <TableRow
                        key={ticket.id}
                        className="border-outline-variant/8 hover:bg-surface-container/50 transition-colors duration-200"
                      >
                        <TableCell className="pl-6 font-mono text-xs text-on-surface-variant">
                          {truncateUUID(ticket.id)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-on-surface">
                              {ticket.buyerName}
                            </p>
                            <p className="text-xs text-on-surface-variant">{ticket.buyerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant hidden md:table-cell">
                          {ticket.eventName}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs font-medium text-on-surface bg-surface-container px-2.5 py-1 rounded-lg">
                            {ticket.tier}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-on-surface hidden lg:table-cell">
                          {formatCurrency(ticket.priceCents)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] tracking-widest uppercase font-semibold ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <button
                            onClick={() => openOverrideDialog(ticket)}
                            className="
                              text-xs font-medium text-purple hover:text-purple-container
                              transition-colors duration-200
                              px-3 py-1.5 rounded-lg hover:bg-purple/10
                            "
                          >
                            Override
                          </button>
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

      {/* ── Override Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-surface-container-highest border-outline-variant/20 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-on-surface font-serif text-xl">
              Override Ticket Status
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant text-sm">
              Manually change the status of this ticket. This action will be recorded in the audit
              log.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-5 py-2">
              {/* Ticket info */}
              <div className="bg-surface-container rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-outline">
                    Ticket ID
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {truncateUUID(selectedTicket.id)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-outline">
                    Buyer
                  </span>
                  <span className="text-xs text-on-surface">{selectedTicket.buyerEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-outline">
                    Current Status
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] tracking-widest uppercase font-semibold ${
                      STATUS_CONFIG[selectedTicket.status].className
                    }`}
                  >
                    {STATUS_CONFIG[selectedTicket.status].label}
                  </Badge>
                </div>
              </div>

              {/* New status select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                  New Status
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as TicketStatus)}
                >
                  <SelectTrigger className="bg-surface-container ghost-border rounded-xl text-sm text-on-surface">
                    <SelectValue placeholder="Select new status..." />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-container-highest border-outline-variant/20 rounded-xl">
                    {(["active", "scanned", "revoked", "expired"] as TicketStatus[])
                      .filter((s) => s !== selectedTicket.status)
                      .map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                status === "active"
                                  ? "bg-emerald-400"
                                  : status === "scanned"
                                    ? "bg-blue"
                                    : status === "revoked"
                                      ? "bg-error"
                                      : "bg-outline"
                              }`}
                            />
                            {STATUS_CONFIG[status].label}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Warning */}
              {newStatus === "revoked" && (
                <div className="flex items-start gap-3 bg-error-container/10 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-error/80">
                    Revoking a ticket is a destructive action. The ticket holder will no longer be
                    able to use this ticket for entry.
                  </p>
                </div>
              )}

              {/* Result message */}
              {actionResult && (
                <div
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                    actionResult.type === "success"
                      ? "bg-emerald-500/10"
                      : "bg-error-container/10"
                  }`}
                >
                  {actionResult.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-xs ${
                      actionResult.type === "success" ? "text-emerald-400" : "text-error"
                    }`}
                  >
                    {actionResult.message}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-on-surface-variant hover:bg-surface-container rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOverride}
              disabled={!newStatus || isPending}
              className="
                bg-gradient-to-br from-gold to-gold-container text-gold-on
                font-semibold tracking-wider uppercase text-xs
                rounded-xl hover:shadow-glow-gold
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-300
              "
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Confirm Override"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import {
  fetchAllUsers,
  changeUserRole,
  type UserRecord,
  type UserRole,
} from "@/actions/users";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  User,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ── Role Badge Config ────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-gold/10 text-gold border-gold/20 hover:bg-gold/15",
  },
  scanner: {
    label: "Scanner",
    className: "bg-purple/10 text-purple border-purple/20 hover:bg-purple/15",
  },
  customer: {
    label: "Customer",
    className: "bg-blue/10 text-blue border-blue/20 hover:bg-blue/15",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────────
function UsersSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      <div>
        <div className="h-4 w-24 rounded shimmer mb-3" />
        <div className="h-8 w-56 rounded shimmer mb-2" />
        <div className="h-4 w-80 rounded shimmer" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl shimmer" />
        ))}
      </div>
      <div className="h-12 rounded-xl shimmer" />
      <div className="h-96 rounded-2xl shimmer" />
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────────
export default function UsersPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState<UserRole | "">("");
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch users from Firestore
  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch((err) => console.error("[Users] Failed to fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.uid.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Open role change dialog
  const openRoleDialog = (user: UserRecord) => {
    setSelectedUser(user);
    setNewRole("");
    setActionResult(null);
    setDialogOpen(true);
  };

  // Execute role change
  const handleRoleChange = () => {
    if (!selectedUser || !newRole || !profile) return;

    startTransition(async () => {
      const result = await changeUserRole(
        selectedUser.uid,
        newRole as UserRole,
        selectedUser.role,
        profile.uid
      );

      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.uid === selectedUser.uid ? { ...u, role: newRole as UserRole } : u
          )
        );
        setActionResult({
          type: "success",
          message: `Role updated to "${newRole}". Audit log recorded.`,
        });
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
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const scanners = users.filter((u) => u.role === "scanner").length;
    const customers = users.filter((u) => u.role === "customer").length;
    return { total, admins, scanners, customers };
  }, [users]);

  if (loading) return <UsersSkeleton />;

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <span className="label-upper text-purple-container tracking-[0.12em] mb-2 block">
          Management
        </span>
        <h1 className="headline-lg">User Management</h1>
        <p className="text-sm text-on-surface-variant mt-2 tracking-wide">
          View all registered users and manage RBAC roles. Role changes are fully audit-logged.
        </p>
      </div>

      {/* ── Quick Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up-delay-1">
        {[
          { label: "Total Users", value: stats.total, color: "text-on-surface", icon: User },
          { label: "Admins", value: stats.admins, color: "text-gold", icon: ShieldAlert },
          { label: "Scanners", value: stats.scanners, color: "text-purple", icon: ShieldCheck },
          { label: "Customers", value: stats.customers, color: "text-blue", icon: User },
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
            placeholder="Search by email, name, or user ID..."
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
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as UserRole | "all")}
        >
          <SelectTrigger className="w-full sm:w-44 bg-surface-container-low ghost-border rounded-xl text-sm text-on-surface-variant h-auto py-3">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-outline" />
            <SelectValue placeholder="Filter role" />
          </SelectTrigger>
          <SelectContent className="bg-surface-container-highest border-outline-variant/20 rounded-xl">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="scanner">Scanner</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────── */}
      <Card className="bg-surface-container-low border-outline-variant/10 rounded-2xl overflow-hidden animate-fade-up-delay-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant/10 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold pl-6">
                    User
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden lg:table-cell">
                    User ID
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold hidden lg:table-cell">
                    Joined
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold">
                    Role
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.1em] text-outline font-semibold pr-6 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-on-surface-variant text-sm"
                    >
                      {users.length === 0
                        ? "No users found. Run the seed script to populate demo data."
                        : "No users match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const roleCfg = ROLE_CONFIG[user.role];
                    const isSelf = profile?.uid === user.uid;
                    return (
                      <TableRow
                        key={user.uid}
                        className="border-outline-variant/8 hover:bg-surface-container/50 transition-colors duration-200"
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-on-surface-variant">
                                {getInitials(user.displayName)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-on-surface">
                                {user.displayName}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] text-gold tracking-wider uppercase">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-on-surface-variant md:hidden">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="font-mono text-xs text-on-surface-variant">
                            {user.uid.length > 12 ? `${user.uid.substring(0, 12)}…` : user.uid}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant hidden lg:table-cell">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] tracking-widest uppercase font-semibold ${roleCfg.className}`}
                          >
                            {roleCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <button
                            onClick={() => openRoleDialog(user)}
                            disabled={isSelf}
                            className={`
                              text-xs font-medium transition-colors duration-200
                              px-3 py-1.5 rounded-lg
                              ${
                                isSelf
                                  ? "text-outline/40 cursor-not-allowed"
                                  : "text-purple hover:text-purple-container hover:bg-purple/10"
                              }
                            `}
                          >
                            {isSelf ? "—" : "Change Role"}
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

      {/* ── Role Change Dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-surface-container-highest border-outline-variant/20 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-on-surface font-serif text-xl">
              Change User Role
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant text-sm">
              Assign a new role to this user. This action will be recorded in the audit log.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 py-2">
              {/* User info */}
              <div className="bg-surface-container rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-outline">
                    Name
                  </span>
                  <span className="text-xs text-on-surface font-medium">
                    {selectedUser.displayName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-outline">
                    Email
                  </span>
                  <span className="text-xs text-on-surface">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-outline">
                    Current Role
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] tracking-widest uppercase font-semibold ${
                      ROLE_CONFIG[selectedUser.role].className
                    }`}
                  >
                    {ROLE_CONFIG[selectedUser.role].label}
                  </Badge>
                </div>
              </div>

              {/* New role select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                  New Role
                </label>
                <Select
                  value={newRole}
                  onValueChange={(v) => setNewRole(v as UserRole)}
                >
                  <SelectTrigger className="bg-surface-container ghost-border rounded-xl text-sm text-on-surface">
                    <SelectValue placeholder="Select new role..." />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-container-highest border-outline-variant/20 rounded-xl">
                    {(["admin", "scanner", "customer"] as UserRole[])
                      .filter((r) => r !== selectedUser.role)
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                role === "admin"
                                  ? "bg-gold"
                                  : role === "scanner"
                                    ? "bg-purple"
                                    : "bg-blue"
                              }`}
                            />
                            {ROLE_CONFIG[role].label}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin warning */}
              {newRole === "admin" && (
                <div className="flex items-start gap-3 bg-gold/5 rounded-xl px-4 py-3 border border-gold/10">
                  <ShieldAlert className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gold/80">
                    Granting admin access gives this user full control over events, tickets, users,
                    and audit logs. Only grant this role to trusted team members.
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
              onClick={handleRoleChange}
              disabled={!newRole || isPending}
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
                "Confirm Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

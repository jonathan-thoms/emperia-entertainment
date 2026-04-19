"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Ticket,
  CalendarDays,
  ScanLine,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import {
  fetchDashboardMetrics,
  type DashboardMetrics,
} from "@/actions/admin";

// ── Helpers ──────────────────────────────────────────────────────────────────────
function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

// ── Custom Tooltip for Chart ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/20 rounded-xl px-4 py-3 shadow-luxe">
      <p className="text-xs font-semibold text-on-surface mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs text-on-surface-variant">
          {entry.dataKey === "revenue"
            ? `Revenue: $${entry.value.toLocaleString()}`
            : `Tickets: ${entry.value}`}
        </p>
      ))}
    </div>
  );
}

// ── Metric Card Component ────────────────────────────────────────────────────────
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "gold",
  delay = 0,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "gold" | "purple" | "blue";
  delay?: number;
}) {
  const colorMap = {
    gold: {
      iconBg: "bg-gold/10",
      iconText: "text-gold",
      glow: "shadow-[0_0_30px_rgba(242,202,80,0.06)]",
    },
    purple: {
      iconBg: "bg-purple/10",
      iconText: "text-purple",
      glow: "shadow-[0_0_30px_rgba(208,91,255,0.06)]",
    },
    blue: {
      iconBg: "bg-blue/10",
      iconText: "text-blue",
      glow: "shadow-[0_0_30px_rgba(191,205,255,0.06)]",
    },
  };

  const colors = colorMap[accentColor];

  return (
    <Card
      className={`
        bg-surface-container-low border-outline-variant/10 rounded-2xl
        hover:bg-surface-container-high hover:shadow-luxe
        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-1 ${colors.glow}
        animate-fade-up
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
          {title}
        </CardTitle>
        <div className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
          <Icon className={`w-[18px] h-[18px] ${colors.iconText}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-on-surface tracking-tight font-serif">
          {value}
        </p>
        <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// ── Activity Type Icons ──────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    purchase: { icon: DollarSign, color: "text-gold bg-gold/10" },
    scan: { icon: ScanLine, color: "text-blue bg-blue/10" },
    override: { icon: Activity, color: "text-error bg-error/10" },
    event: { icon: CalendarDays, color: "text-purple bg-purple/10" },
  };

  const { icon: Icon, color } = map[type] ?? map.purchase;

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-10">
      <div>
        <div className="h-4 w-20 rounded shimmer mb-3" />
        <div className="h-8 w-48 rounded shimmer mb-2" />
        <div className="h-4 w-64 rounded shimmer" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="h-80 rounded-2xl shimmer" />
        <div className="h-80 rounded-2xl shimmer xl:col-span-2" />
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.error("[Dashboard] Failed to fetch metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) return <DashboardSkeleton />;

  const occupancyPercent =
    metrics.occupancy.total > 0
      ? Math.round((metrics.occupancy.scanned / metrics.occupancy.total) * 100)
      : 0;

  return (
    <div className="p-6 lg:p-10 max-w-[1440px] mx-auto space-y-10">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <span className="label-upper text-purple-container tracking-[0.12em] mb-2 block">
          Overview
        </span>
        <h1 className="headline-lg">Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-2 tracking-wide">
          Real-time metrics for the Neon Ticketing platform.
        </p>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Lifetime ticket revenue"
          icon={DollarSign}
          accentColor="gold"
          delay={0}
        />
        <MetricCard
          title="Tickets Sold"
          value={formatNumber(metrics.ticketsSold)}
          subtitle="Across all events"
          icon={Ticket}
          accentColor="purple"
          delay={100}
        />
        <MetricCard
          title="Active Events"
          value={String(metrics.activeEvents)}
          subtitle="With upcoming dates"
          icon={CalendarDays}
          accentColor="blue"
          delay={200}
        />
        <MetricCard
          title="Scan Rate"
          value={`${metrics.scanRate}%`}
          subtitle="Of sold tickets scanned"
          icon={ScanLine}
          accentColor="gold"
          delay={300}
        />
      </div>

      {/* ── Live Occupancy + Chart Row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Occupancy Card */}
        <Card className="bg-surface-container-low border-outline-variant/10 rounded-2xl animate-fade-up-delay-4 xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
              </span>
              Live Occupancy
            </CardTitle>
            <CardDescription className="text-on-surface-variant/60 text-xs">
              Scanned vs. total tickets sold
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Large display */}
            <div className="text-center py-4">
              <p className="text-5xl font-bold font-serif text-on-surface tracking-tight">
                {occupancyPercent}
                <span className="text-2xl text-on-surface-variant">%</span>
              </p>
              <p className="text-xs text-on-surface-variant mt-2 tracking-wide">
                {formatNumber(metrics.occupancy.scanned)} / {formatNumber(metrics.occupancy.total)} checked in
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress
                value={occupancyPercent}
                className="h-3 bg-surface-container-high rounded-full [&>div]:rounded-full [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-gold-container [&>div]:shadow-glow-gold"
              />
              <div className="flex justify-between text-[10px] tracking-[0.1em] uppercase text-on-surface-variant">
                <span>0%</span>
                <span>Full Capacity</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container rounded-xl px-4 py-3 text-center">
                <Users className="w-4 h-4 text-gold mx-auto mb-1" />
                <p className="text-lg font-semibold text-on-surface">{formatNumber(metrics.occupancy.scanned)}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Inside</p>
              </div>
              <div className="bg-surface-container rounded-xl px-4 py-3 text-center">
                <TrendingUp className="w-4 h-4 text-purple mx-auto mb-1" />
                <p className="text-lg font-semibold text-on-surface">{formatNumber(metrics.occupancy.total - metrics.occupancy.scanned)}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card className="bg-surface-container-low border-outline-variant/10 rounded-2xl animate-fade-up-delay-5 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
              Ticket Sales — Last 7 Days
            </CardTitle>
            <CardDescription className="text-on-surface-variant/60 text-xs">
              Daily ticket sales and revenue trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F2CA50" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F2CA50" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D05BFF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D05BFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(77, 70, 53, 0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#D0C5AF", fontSize: 11, fontFamily: "Manrope" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#D0C5AF", fontSize: 11, fontFamily: "Manrope" }}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stroke="#F2CA50"
                    strokeWidth={2}
                    fill="url(#goldGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D05BFF"
                    strokeWidth={2}
                    fill="url(#purpleGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gold" />
                <span className="text-xs text-on-surface-variant">Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-container" />
                <span className="text-xs text-on-surface-variant">Revenue ($)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ────────────────────────────────────────────── */}
      <Card className="bg-surface-container-low border-outline-variant/10 rounded-2xl animate-fade-up">
        <CardHeader>
          <CardTitle className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
            Recent Activity
          </CardTitle>
          <CardDescription className="text-on-surface-variant/60 text-xs">
            Latest platform events and admin actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recentActivity.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">
              No recent activity. Actions will appear here as they happen.
            </p>
          ) : (
            <div className="space-y-4">
              {metrics.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-container transition-colors duration-300"
                >
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{item.action}</p>
                    <p className="text-xs text-on-surface-variant truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-outline tracking-wider whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

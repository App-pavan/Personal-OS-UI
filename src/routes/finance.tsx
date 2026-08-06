import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Banknote, PiggyBank, TrendingUp } from "lucide-react";
import {
  AIBar,
  Card,
  ListRow,
  Meter,
  ModuleHeader,
  PageShell,
  Pill,
  Section,
  StatCard,
} from "@/components/os/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { balanceTrend, budgets, spendByCategory, transactions } from "@/lib/os-data";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance — Personal OS" },
      { name: "description", content: "Balance, spending, budgets and investments in one calm view." },
      { property: "og:title", content: "Finance — Personal OS" },
      { property: "og:description", content: "Luxury-grade personal finance inside your Personal OS." },
    ],
  }),
  component: FinancePage,
});

const chartTones = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-2xl px-3 py-2 text-xs">
      {label ? <p className="font-semibold">{label}</p> : null}
      <p className="text-muted-foreground tabular-nums">
        {payload[0].name}: ₹{Number(payload[0].value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function FinancePage() {
  const [tab, setTab] = useState("overview");

  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spend = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <PageShell>
      <ModuleHeader
        eyebrow="Module"
        title="Finance"
        description="A quiet, precise view of your money — balances, flow, budgets and categories."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total balance" value="₹1,28,450" hint="+12.5% vs last month" icon={Banknote} />
        <StatCard label="Income" value={`₹${income.toLocaleString("en-IN")}`} hint="This month" icon={ArrowUpRight} tone="success" delay={60} />
        <StatCard label="Spending" value={`₹${spend.toLocaleString("en-IN")}`} hint="This month" icon={ArrowDownRight} tone="accent" delay={120} />
        <StatCard label="Invested" value="₹86,200" hint="Across 4 funds" icon={TrendingUp} tone="info" delay={180} />
      </div>

      <AIBar
        placeholder="Ask AI about your money…"
        suggestions={["Summarize my expenses this month", "Where can I save ₹5,000?", "Forecast next month"]}
        onAsk={(q) => toast.success("Analyzing your finances…", { description: q })}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="rounded-2xl">
          {["overview", "transactions", "budget", "investments"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-xl capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total balance</p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">₹1,28,450.75</p>
                  <p className="mt-1 text-xs font-semibold text-success">+12.5% vs last month</p>
                </div>
                <Pill tone="primary">6 months</Pill>
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceTrend} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Balance"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      fill="url(#balanceFill)"
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <p className="text-sm font-semibold">Spending by category</p>
              <div className="mt-2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByCategory}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={1100}
                    >
                      {spendByCategory.map((_, i) => (
                        <Cell key={i} fill={chartTones[i % chartTones.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {spendByCategory.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: chartTones[i % chartTones.length] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{c.name}</span>
                    <span className="font-semibold tabular-nums">{c.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card padded={false} className="p-2">
            {transactions.map((t) => (
              <ListRow
                key={t.id}
                leading={
                  <span className="grid size-10 place-items-center rounded-2xl bg-muted text-lg">{t.icon}</span>
                }
                title={t.name}
                subtitle={`${t.category} · ${t.when}`}
                trailing={
                  <span className={`text-sm font-semibold tabular-nums ${t.amount > 0 ? "text-success" : ""}`}>
                    {t.amount > 0 ? "+" : "−"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                  </span>
                }
              />
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <div className="grid gap-4 sm:grid-cols-2">
            {budgets.map((b) => {
              const pct = Math.round((b.spent / b.total) * 100);
              return (
                <Card key={b.name} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{b.name}</p>
                    <Pill tone={pct > 85 ? "danger" : pct > 65 ? "warning" : "success"}>{pct}%</Pill>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">
                    ₹{b.spent.toLocaleString("en-IN")}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      / ₹{b.total.toLocaleString("en-IN")}
                    </span>
                  </p>
                  <Meter value={pct} tone={pct > 85 ? "warning" : "primary"} />
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="investments">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Index fund", value: "₹42,800", change: "+9.4%" },
              { name: "Gold ETF", value: "₹18,200", change: "+3.1%" },
              { name: "Bluechip", value: "₹16,400", change: "-1.2%" },
              { name: "Debt fund", value: "₹8,800", change: "+1.8%" },
            ].map((i, idx) => (
              <Card key={i.name} className="space-y-2">
                <span className="bg-primary-soft grid size-9 place-items-center rounded-2xl text-primary">
                  <PiggyBank className="size-4" />
                </span>
                <p className="text-sm text-muted-foreground">{i.name}</p>
                <p className="text-2xl font-semibold tabular-nums">{i.value}</p>
                <Pill tone={i.change.startsWith("-") ? "danger" : "success"}>{i.change}</Pill>
                <Meter value={40 + idx * 15} />
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

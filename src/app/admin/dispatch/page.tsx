"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, RadioTower, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestRow, waitLabel } from "@/components/admin/request-row";
import { AssignPanel } from "@/components/admin/assign-panel";
import { RequestDetailSheet } from "@/components/admin/request-detail-sheet";
import { CardSkeleton } from "@/components/shared/skeletons";
import { EmptyState } from "@/components/shared/empty-state";
import { useAdminRequests } from "@/lib/hooks";
import type { EmergencyRequest, RequestPriority } from "@/types/api";

const IN_PROGRESS: EmergencyRequest["status"][] = [
  "ASSIGNED",
  "EN_ROUTE_PICKUP",
  "PICKED_UP",
  "EN_ROUTE_HOSPITAL",
];

const CLOSED: EmergencyRequest["status"][] = ["COMPLETED", "CANCELLED"];

const PRIORITIES: ("ALL" | RequestPriority)[] = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "NORMAL",
];

interface Column {
  title: string;
  dot: string;
  rows: EmergencyRequest[];
}

function DispatchBoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priorityFilter = searchParams.get("priority") ?? "ALL";
  const q = searchParams.get("q") ?? "";

  const board = useAdminRequests(
    1,
    100,
    priorityFilter !== "ALL" ? { priority: priorityFilter } : undefined,
    { refetchInterval: 5000 },
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);

  const pulseRow = (id: string) => {
    setPulseId(id);
    setTimeout(() => setPulseId((cur) => (cur === id ? null : cur)), 1000);
  };

  // Parent-owned clock: RequestRow re-renders its wait label on this tick
  // without owning timers itself.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const setPriority = (val: string | null) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (!val || val === "ALL") {
      sp.delete("priority");
    } else {
      sp.set("priority", val);
    }
    router.push(`/admin/dispatch?${sp.toString()}`);
  };

  const setQuery = (val: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      sp.set("q", val);
    } else {
      sp.delete("q");
    }
    router.replace(`/admin/dispatch?${sp.toString()}`);
  };

  const allItems = board.data?.items ?? [];
  const needle = q.trim().toLowerCase();
  const items = needle
    ? allItems.filter(
        (r) =>
          (r.patient?.name ?? "").toLowerCase().includes(needle) ||
          r.pickupAddress.toLowerCase().includes(needle),
      )
    : allItems;
  // Real data only: critical requests that still have no ambulance.
  const unassignedCritical = allItems.filter(
    (r) => r.status === "PENDING" && r.priority === "CRITICAL",
  );
  const oldestCritical = unassignedCritical.reduce<string | null>(
    (oldest, r) =>
      oldest === null || r.requestedAt < oldest ? r.requestedAt : oldest,
    null,
  );
  const columns: Column[] = [
    {
      title: "Pending",
      dot: "bg-amber",
      rows: items.filter((r) => r.status === "PENDING"),
    },
    {
      title: "In progress",
      dot: "bg-oxygen",
      rows: items.filter((r) => IN_PROGRESS.includes(r.status)),
    },
    {
      title: "Done",
      dot: "bg-slate",
      rows: items.filter((r) => CLOSED.includes(r.status)),
    },
  ];
  const selected = selectedId
    ? items.find((r) => r.id === selectedId)
    : undefined;
  const sheetRequest = sheetId
    ? allItems.find((r) => r.id === sheetId)
    : undefined;
  // Pending rows feed the assign panel; any other row opens the detail sheet.
  const selectRow = (r: EmergencyRequest) => {
    if (r.status === "PENDING") setSelectedId(r.id);
    else setSheetId(r.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Dispatch</h1>
          <p className="mt-1 text-sm text-slate">
            Live queue, refreshes every 5 seconds
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient or address"
              aria-label="Search requests"
              className="h-10 w-56 bg-paper pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriority}>
            <SelectTrigger
              className="h-10 w-40 bg-paper border-hairline"
              aria-label="Filter by priority"
            >
              <SelectValue>
                {priorityFilter === "ALL"
                  ? "All priorities"
                  : priorityFilter.toLowerCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p === "ALL" ? "All priorities" : p.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {unassignedCritical.length > 0 && oldestCritical && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl bg-amber px-5 py-3 font-bold text-white"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          {unassignedCritical.length} critical request
          {unassignedCritical.length === 1 ? "" : "s"} unassigned, oldest
          waiting {waitLabel(oldestCritical, now)}
        </div>
      )}

      {board.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : board.isError ? (
        <EmptyState
          icon={<RadioTower className="h-6 w-6 text-slate" />}
          title="Could not load board"
          description="Try refreshing the page."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] items-start">
          <div className="grid gap-4 lg:grid-cols-3 items-start">
            {columns.map((col) => (
              <section
                key={col.title}
                aria-label={`${col.title} requests`}
                className="flex min-w-0 flex-col rounded-3xl border border-hairline bg-paper p-4"
              >
                <div className="flex items-center justify-between pb-2">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
                    <span
                      className={`h-2 w-2 rounded-full ${col.dot}`}
                      aria-hidden
                    />
                    {col.title} · {col.rows.length}
                  </h2>
                </div>
                <div className="mt-1 max-h-[calc(100vh-18rem)] space-y-3 overflow-y-auto pr-1">
                  {col.rows.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-hairline p-4 text-center text-sm text-slate">
                      Empty
                    </p>
                  ) : (
                    col.rows.map((r) => (
                      <RequestRow
                        key={r.id}
                        request={r}
                        now={now}
                        pulsing={r.id === pulseId}
                        selected={r.id === selectedId}
                        onClick={() => selectRow(r)}
                      />
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
          <AssignPanel
            request={selected}
            onAssigned={(id) => {
              pulseRow(id);
              setSelectedId(null);
            }}
            onOpenDetails={setSheetId}
          />
        </div>
      )}

      {sheetRequest && (
        <RequestDetailSheet
          request={sheetRequest}
          onClose={() => setSheetId(null)}
          onAction={pulseRow}
        />
      )}
    </div>
  );
}

export default function DispatchBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      }
    >
      <DispatchBoardContent />
    </Suspense>
  );
}

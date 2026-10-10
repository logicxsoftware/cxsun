import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, Phone } from "lucide-react";
import { Button } from "@cxsun/ui/components/button";
import { Card } from "@cxsun/ui/components/card";
import { listEnquiryPage } from "./enquiry.services";
import { enquiryPhoneKey } from "./enquiry.phone";
import { enquiryTableText } from "./enquiry.table-text";
import type { EnquiryLookup, EnquiryRecord } from "./enquiry.types";

const recentLimit = 8;

export function EnquiryMobileContext({
  mobile,
  contactId,
  users,
  onSelectMobile
}: {
  mobile: string | null;
  contactId: number | null;
  users: EnquiryLookup[];
  onSelectMobile: (mobile: string) => void;
}) {
  const [recent, setRecent] = useState<string[]>(readRecentMobiles);
  const [search, setSearch] = useState("");
  const key = enquiryPhoneKey(mobile);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(key.length >= 7 ? key : ""), 350);
    return () => window.clearTimeout(timer);
  }, [key]);

  useEffect(() => {
    if (key.length < 7 || !mobile?.trim()) return;
    const timer = window.setTimeout(() => {
      setRecent((current) => {
        const next = [
          mobile.trim(),
          ...current.filter((item) => enquiryPhoneKey(item) !== key)
        ].slice(0, recentLimit);
        sessionStorage.setItem(recentStorageKey(), JSON.stringify(next));
        return next;
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [key, mobile]);

  const enquiries = useQuery({
    queryKey: ["crm", "enquiries", "mobile-context", search],
    queryFn: () => listEnquiryPage({ scope: "all", page: 1, pageSize: 100, search, filter: "" }),
    enabled: search.length >= 7
  });
  const matches = (enquiries.data?.items ?? [])
    .filter(
      (item) =>
        enquiryPhoneKey(item.capturedPhone) === search ||
        (contactId !== null && item.contactId === contactId)
    )
    .slice(0, 5);

  return (
    <aside className="min-w-0 space-y-4" aria-label="Mobile enquiry context">
      <Card className="rounded-md shadow-sm">
        <div className="border-b px-4 py-3 text-sm font-semibold">Existing enquiries</div>
        <div className="divide-y px-4">
          {search.length < 7 ? (
            <ContextMessage>Enter a mobile number to see matching enquiries.</ContextMessage>
          ) : enquiries.isPending || search !== key ? (
            <ContextMessage>Searching enquiries...</ContextMessage>
          ) : enquiries.isError ? (
            <ContextMessage>Unable to load matching enquiries.</ContextMessage>
          ) : matches.length === 0 ? (
            <ContextMessage>No existing enquiries for this mobile number.</ContextMessage>
          ) : (
            matches.map((item) => <EnquiryContextRow key={item.id} item={item} users={users} />)
          )}
        </div>
      </Card>
      <Card className="rounded-md shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock3 className="size-4 text-muted-foreground" />
            Recent mobile numbers
          </div>
          {recent.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                sessionStorage.removeItem(recentStorageKey());
                setRecent([]);
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
        <div className="p-2">
          {recent.length === 0 ? (
            <ContextMessage>Numbers entered here will appear in this tab.</ContextMessage>
          ) : (
            recent.map((number) => (
              <button
                key={enquiryPhoneKey(number)}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onSelectMobile(number)}
              >
                <Phone className="size-3.5 text-muted-foreground" />
                <span>{number}</span>
              </button>
            ))
          )}
        </div>
      </Card>
    </aside>
  );
}

function EnquiryContextRow({ item, users }: { item: EnquiryRecord; users: EnquiryLookup[] }) {
  const assignedTo = users.find((user) => user.id === item.assignedUserId)?.name;
  const title = enquiryTableText(item.title || item.description) || "Untitled enquiry";
  return (
    <div className="space-y-1.5 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">#{item.enquiryNo}</span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {item.statusName}
        </span>
      </div>
      <p className="line-clamp-2 break-words font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(item.createdAt).toLocaleDateString()}
        {assignedTo ? ` · Assigned to ${assignedTo}` : ""}
      </p>
    </div>
  );
}

function ContextMessage({ children }: { children: string }) {
  return <p className="py-4 text-xs text-muted-foreground">{children}</p>;
}

function recentStorageKey() {
  const tenant = sessionStorage.getItem("cxsun_tenant_id") ?? "unknown";
  let user = "unknown";
  try {
    const identity = JSON.parse(sessionStorage.getItem("cxsun.auth.identity") ?? "null") as {
      email?: string;
    } | null;
    user = identity?.email ?? user;
  } catch {
    // Keep history scoped to the tenant if session identity is unavailable.
  }
  return `cxsun_crm_recent_mobiles:${tenant}:${user}`;
}

function readRecentMobiles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(recentStorageKey()) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string").slice(0, recentLimit)
      : [];
  } catch {
    return [];
  }
}

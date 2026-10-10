import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { ZetroPatternDraftForm } from "./admin.form";
import { ZetroGrantSection } from "./admin.grants";
import {
  useZetroAdminInteractions,
  useZetroAdminPatterns,
  useZetroAdminTenants,
  zetroAdminPatternsKey
} from "./admin.hooks";
import { ZetroInteractionList, ZetroPatternList } from "./admin.list";
import { zetroPatternDraftSchema } from "./admin.schema";
import { createZetroPatternDraft } from "./admin.services";
import type { ZetroPatternDraft } from "./admin.types";

const emptyDraft: ZetroPatternDraft = {
  serialNo: 7,
  questionPattern: "",
  queryPattern: "",
  limitation: "",
  extra: ""
};

export function ZetroAdminWorkspace() {
  const client = useQueryClient();
  const [tenantId, setTenantId] = useState("");
  const [draft, setDraft] = useState<ZetroPatternDraft>(emptyDraft);
  const tenants = useZetroAdminTenants();
  const availableTenants = tenants.data?.filter((tenant) =>
    tenant.enabledModuleKeys.includes("zetro")
  );

  useEffect(() => {
    if (!tenantId && availableTenants?.[0]) setTenantId(availableTenants[0].uuid);
  }, [availableTenants, tenantId]);

  useEffect(() => {
    setDraft(emptyDraft);
  }, [tenantId]);

  const patterns = useZetroAdminPatterns(tenantId);
  const interactions = useZetroAdminInteractions(tenantId);
  const createDraft = useMutation({
    mutationFn: (value: ZetroPatternDraft) => createZetroPatternDraft(tenantId, value),
    onSuccess: () => {
      setDraft({ ...emptyDraft, serialNo: draft.serialNo + 1 });
      void client.invalidateQueries({ queryKey: zetroAdminPatternsKey(tenantId) });
      toast.success("Draft pattern added for review");
    },
    onError: (error) => toast.error("Could not add pattern", { description: error.message })
  });

  const submitDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId) return;
    const result = zetroPatternDraftSchema.safeParse(draft);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Invalid draft pattern");
      return;
    }
    createDraft.mutate(result.data);
  };

  return (
    <WorkspacePage
      title="Zetro"
      description="Review tenant query patterns and live interactions. Drafts do not enable tools."
      technicalName="page.sa.zetro"
    >
      <div className="space-y-5 p-5">
        <section className="rounded-lg border bg-card p-4">
          <label htmlFor="zetro-review-tenant" className="mb-2 block text-sm font-medium">
            Tenant
          </label>
          <select
            id="zetro-review-tenant"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            className="h-10 w-full max-w-md rounded-md border bg-background px-3 text-sm"
          >
            {!tenantId ? <option value="">Select a tenant</option> : null}
            {availableTenants?.map((tenant) => (
              <option key={tenant.uuid} value={tenant.uuid}>
                {tenant.tenantName} ({tenant.tenantCode})
              </option>
            ))}
          </select>
          {tenants.error ? <p role="alert">{tenants.error.message}</p> : null}
          {availableTenants?.length === 0 ? <p>No tenant has Zetro enabled.</p> : null}
        </section>

        {tenantId ? (
          <>
            <ZetroPatternList
              patterns={patterns.data}
              error={patterns.error}
              onRefresh={() => void patterns.refetch()}
            />
            <ZetroPatternDraftForm
              draft={draft}
              setDraft={setDraft}
              pending={createDraft.isPending}
              onSubmit={submitDraft}
            />
            <ZetroGrantSection key={tenantId} tenantId={tenantId} />
            <ZetroInteractionList
              interactions={interactions.data}
              patterns={patterns.data}
              error={interactions.error}
              onRefresh={() => void interactions.refetch()}
            />
          </>
        ) : null}
      </div>
    </WorkspacePage>
  );
}

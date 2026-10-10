import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@cxsun/ui/components/button";
import { WorkspaceFormBanner } from "@cxsun/ui/workspace/upsert";
import { StorefrontForm } from "./storefront.form";
import { StorefrontList } from "./storefront.list";
import { storefrontKey, useStorefrontConfig, useStorefrontQuotes } from "./storefront.hooks";
import type { StorefrontGateway } from "./storefront.services";
import type { StoreQuote } from "./storefront.types";
export function EcommerceStorefrontWorkspace({
  gateway,
  onOpenStore
}: {
  gateway: StorefrontGateway;
  onOpenStore?: () => void;
}) {
  const client = useQueryClient();
  const config = useStorefrontConfig(gateway);
  const quotes = useStorefrontQuotes(gateway, config.data?.permissions.quotes === true);
  const invalidate = () => client.invalidateQueries({ queryKey: storefrontKey });
  const save = useMutation({ mutationFn: gateway.save, onSuccess: invalidate });
  const status = useMutation({
    mutationFn: ({ uuid, value }: { uuid: string; value: StoreQuote["status"] }) =>
      gateway.status(uuid, value),
    onSuccess: invalidate
  });
  const error = config.error ?? quotes.error ?? save.error ?? status.error;
  return (
    <section className="space-y-6">
      <div className="flex justify-between gap-3">
        <h1 className="text-2xl font-semibold">Storefront & quotes</h1>
        {onOpenStore && (
          <Button onClick={onOpenStore} disabled={!config.data?.config.enabled}>
            Open public store
          </Button>
        )}
      </div>
      {error && (
        <WorkspaceFormBanner title="Storefront action failed">{error.message}</WorkspaceFormBanner>
      )}
      {config.isPending && <p role="status">Loading storefront…</p>}
      {config.data && (
        <StorefrontForm
          key={JSON.stringify(config.data.config)}
          config={config.data.config}
          disabled={!config.data.permissions.manage}
          busy={save.isPending}
          onSave={(input) => save.mutate(input)}
        />
      )}{" "}
      {config.data?.permissions.quotes && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Quote inbox</h2>
            <Button variant="outline" onClick={() => void quotes.refetch()}>
              Refresh quotes
            </Button>
          </div>
          {quotes.isPending ? (
            <p role="status">Loading quotes…</p>
          ) : (
            <StorefrontList
              quotes={quotes.data ?? []}
              busy={status.isPending}
              onStatus={(uuid, value) => status.mutate({ uuid, value })}
            />
          )}
        </div>
      )}
    </section>
  );
}

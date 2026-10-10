import { WorkspaceSelect } from "@cxsun/ui/workspace/select";
import { Card } from "@cxsun/ui/components/card";
import type { StoreQuote } from "./storefront.types";
export function StorefrontList({
  quotes,
  busy,
  onStatus
}: {
  quotes: StoreQuote[];
  busy: boolean;
  onStatus: (uuid: string, status: StoreQuote["status"]) => void;
}) {
  return (
    <div className="space-y-3">
      {!quotes.length && (
        <p className="text-sm text-muted-foreground">No quote requests received yet.</p>
      )}
      {quotes.map((quote) => (
        <Card key={quote.uuid} className="p-4 space-y-3">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                {quote.name} · {quote.uuid}
              </h3>
              <p className="text-sm">
                {quote.email} · {quote.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(quote.createdAt).toLocaleString()}
              </p>
            </div>
            <WorkspaceSelect
              ariaLabel={`Status for ${quote.uuid}`}
              value={quote.status}
              disabled={busy}
              options={[
                { label: "Received", value: "received" },
                { label: "Reviewing", value: "reviewing" },
                { label: "Closed", value: "closed" }
              ]}
              onValueChange={(value) => {
                if (value === "received" || value === "reviewing" || value === "closed")
                  onStatus(quote.uuid, value);
              }}
            />
          </div>
          <ul className="text-sm space-y-1">
            {quote.items.map((item, index) => (
              <li key={index}>
                {item.quantity} × {item.title} ·{" "}
                {item.price === null
                  ? "Price on request"
                  : new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: item.currency
                    }).format(item.price)}
              </li>
            ))}
          </ul>
          {quote.notes && <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

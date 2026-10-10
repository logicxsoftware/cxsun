import { useState } from "react";
import { Button } from "@cxsun/ui/components/button";
import { Input } from "@cxsun/ui/components/input";
import { Textarea } from "@cxsun/ui/components/textarea";
import { Checkbox } from "@cxsun/ui/components/checkbox";
import { quoteSchema } from "./shop.schema";
import type { BasketItem, ShopGateway, QuoteReceipt } from "./shop.types";
export function ShopForm({
  items,
  gateway,
  onSuccess
}: {
  items: BasketItem[];
  gateway: ShopGateway;
  onSuccess: (receipt: QuoteReceipt) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestKey] = useState(() => crypto.randomUUID().replaceAll("-", ""));
  return (
    <form
      className="tm-quote-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const parsed = quoteSchema.safeParse({ ...form, consent, items, requestKey });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || "Check your details");
          return;
        }
        setBusy(true);
        setError("");
        try {
          onSuccess(await gateway.quote(parsed.data));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to submit request");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Your contact details</h3>
      <div className="tm-contact-grid">
        {(["name", "email", "phone"] as const).map((key) => (
          <label key={key}>
            {key === "name" ? "Full name" : key === "email" ? "Email address" : "Phone number"}
            <Input
              required
              autoComplete={key === "name" ? "name" : key === "email" ? "email" : "tel"}
              type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              disabled={busy}
            />
          </label>
        ))}
      </div>
      <label>
        Your requirements (optional)
        <Textarea
          maxLength={2000}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          disabled={busy}
        />
      </label>
      <label className="tm-consent">
        <Checkbox
          checked={consent}
          onCheckedChange={(value) => setConsent(value === true)}
          disabled={busy}
        />
        I agree to share these details with the store to respond to my quote request.
      </label>
      {error && (
        <p role="alert" className="tm-error">
          {error}
        </p>
      )}
      <Button className="tm-primary" type="submit" disabled={busy || !items.length}>
        {busy ? "Sending request…" : "Send quote request"}
      </Button>
      <p className="tm-fine">
        No payment is collected. The seller will confirm price, availability and delivery.
      </p>
    </form>
  );
}

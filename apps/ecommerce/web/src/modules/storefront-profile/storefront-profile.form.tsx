import { Input } from "@cxsun/ui/components/input";
import { Label } from "@cxsun/ui/components/label";
import { Textarea } from "@cxsun/ui/components/textarea";
import { StorefrontPaymentMethodsEditor } from "./storefront-profile.payment-methods";
import type { StorefrontProfile } from "./storefront-profile.types";

export function StorefrontProfileForm({
  value,
  onChange,
  mode = "profile"
}: {
  value: StorefrontProfile;
  onChange: (value: StorefrontProfile) => void;
  mode?: "profile" | "service-banner" | "trusted-strip";
}) {
  const field = (
    key: Exclude<keyof StorefrontProfile, "paymentMethods" | "trustedPanels">
  ) => ({
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: event.target.value }),
    value: value[key]
  });
  const updateTrustedPanel = (
    index: number,
    changes: Partial<StorefrontProfile["trustedPanels"][number]>
  ) =>
    onChange({
      ...value,
      trustedPanels: value.trustedPanels.map((panel, panelIndex) =>
        panelIndex === index ? { ...panel, ...changes } : panel
      )
    });
  if (mode === "trusted-strip") {
    return (
      <div className="grid gap-5">
        <Field label="Eyebrow">
          <Input maxLength={120} {...field("trustedEyebrow")} />
        </Field>
        <Field label="Heading">
          <Input maxLength={240} {...field("trustedTitle")} />
        </Field>
        <Field label="Description">
          <Textarea className="min-h-24" maxLength={500} {...field("trustedDescription")} />
        </Field>
        <Field label="Proof points (one per line)">
          <Textarea className="min-h-28" maxLength={1000} {...field("trustedProofPoints")} />
        </Field>
        <div className="grid gap-4">
          <h3 className="font-semibold">Solution cards</h3>
          {value.trustedPanels.map((panel, index) => (
            <div className="grid gap-4 rounded-lg border p-4" key={`trusted-panel-${index}`}>
              <strong>Card {index + 1}</strong>
              <Field label="Title">
                <Input
                  maxLength={160}
                  onChange={(event) => updateTrustedPanel(index, { title: event.target.value })}
                  value={panel.title}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  className="min-h-20"
                  maxLength={500}
                  onChange={(event) =>
                    updateTrustedPanel(index, { description: event.target.value })
                  }
                  value={panel.description}
                />
              </Field>
              <Field label="Details (one per line)">
                <Textarea
                  className="min-h-24"
                  maxLength={820}
                  onChange={(event) =>
                    updateTrustedPanel(index, {
                      details: event.target.value.split(/\r?\n/u).slice(0, 5)
                    })
                  }
                  value={panel.details.join("\n")}
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Action label">
                  <Input
                    maxLength={120}
                    onChange={(event) => updateTrustedPanel(index, { action: event.target.value })}
                    value={panel.action}
                  />
                </Field>
                <Field label="Action URL">
                  <Input
                    maxLength={500}
                    onChange={(event) => updateTrustedPanel(index, { href: event.target.value })}
                    value={panel.href}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (mode === "service-banner") {
    return (
      <div className="grid gap-5">
        <Field label="Eyebrow">
          <Input maxLength={120} {...field("serviceEyebrow")} />
        </Field>
        <Field label="Heading">
          <Input maxLength={240} {...field("serviceTitle")} />
        </Field>
        <Field label="Description">
          <Textarea className="min-h-24" maxLength={500} {...field("serviceDescription")} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Action label">
            <Input maxLength={120} {...field("serviceActionLabel")} />
          </Field>
          <Field label="Action URL">
            <Input maxLength={500} placeholder="/support" {...field("serviceActionUrl")} />
          </Field>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-5">
      <Field label="Tagline">
        <Input
          maxLength={240}
          placeholder="A short promise shown with your company identity"
          {...field("tagline")}
        />
      </Field>
      <Field label="About us">
        <Textarea
          className="min-h-28"
          maxLength={2000}
          placeholder="Tell customers what your company does and why it matters."
          {...field("aboutUs")}
        />
      </Field>
      <div className="grid gap-5 rounded-lg border p-4">
        <h3 className="font-semibold">Home page closing call to action</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Eyebrow">
            <Input maxLength={120} {...field("homeCtaEyebrow")} />
          </Field>
          <Field label="Heading">
            <Input maxLength={240} {...field("homeCtaTitle")} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea className="min-h-20" maxLength={500} {...field("homeCtaDescription")} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Action label">
            <Input maxLength={120} {...field("homeCtaActionLabel")} />
          </Field>
          <Field label="Action URL">
            <Input maxLength={500} placeholder="/shop" {...field("homeCtaActionUrl")} />
          </Field>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Copyright text">
          <Input maxLength={240} placeholder="All rights reserved." {...field("copyrightText")} />
        </Field>
        <Field label="Powered by text">
          <Input
            maxLength={240}
            placeholder="Optional platform or partner credit"
            {...field("poweredByText")}
          />
        </Field>
      </div>
      <StorefrontPaymentMethodsEditor value={value} onChange={onChange} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Facebook">
          <Input inputMode="url" placeholder="https://facebook.com/..." {...field("facebookUrl")} />
        </Field>
        <Field label="LinkedIn">
          <Input
            inputMode="url"
            placeholder="https://linkedin.com/company/..."
            {...field("linkedinUrl")}
          />
        </Field>
        <Field label="Instagram">
          <Input
            inputMode="url"
            placeholder="https://instagram.com/..."
            {...field("instagramUrl")}
          />
        </Field>
        <Field label="X">
          <Input inputMode="url" placeholder="https://x.com/..." {...field("xUrl")} />
        </Field>
        <Field label="YouTube">
          <Input inputMode="url" placeholder="https://youtube.com/@..." {...field("youtubeUrl")} />
        </Field>
        <Field label="WhatsApp">
          <Input inputMode="url" placeholder="https://wa.me/919..." {...field("whatsappUrl")} />
        </Field>
        <Field label="Threads">
          <Input inputMode="url" placeholder="https://threads.net/@..." {...field("threadsUrl")} />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

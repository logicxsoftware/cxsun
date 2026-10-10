# Ecommerce

Ecommerce is a tenant-owned app with a Platform-composed API and an independently served React frontend.

Run commands from the repository root:

```bash
npm run dev
# Or start only the separate frontend with an already running Platform API:
npm run dev:ecommerce
```

Set `CXSUN_ECOMMERCE_WEB_PORT=7030` in the root development `.env`. Platform API remains on `PLATFORM_API_PORT` (7010); Platform Web remains on `PLATFORM_WEB_PORT` (7020).

Enable the `ecommerce` app for the tenant through Plan Access/entitlements, then run tenant seeding to provision the overview and catalog permissions. The default development tenant seed enables it. Select Ecommerce in the tenant app launcher to open the separate frontend directly. The Platform overview at `/app/ecommerce/overview` also provides **Open ecommerce desk**.

The overview API requires an active tenant session, active app module settings, and the view permission. The launcher handoff passes only a non-secret session slot, not a token; the HttpOnly session cookie stays on the same hostname. Both frontends must use that same hostname. The standalone frontend proxies API calls to Platform rather than starting another backend.

Catalog is available at `/catalog` in the separate frontend and `/app/ecommerce/catalog` in Platform. Both screens use the same tenant-scoped `/ecommerce/catalog` API.

Each catalog entry links one existing Core product. Its category, unit, and tax are resolved live through public Core lookup contracts. Manage those values in Core; changing a Core category is immediately reflected in the catalog. No Core table or existing migration is altered.

New Ecommerce-owned tables:

- `ecommerce_catalog`: unique Core product link, title, unique slug and SKU, description, selling and compare-at prices, currency, image URL/alternative text, SEO title/description, published/featured flags, and active/inactive status. The Core product foreign key restricts deleting a linked product.
- `ecommerce_catalog_activity`: transactionally recorded create, edit, lifecycle, and delete history, retained after permanent entry deletion.

Migration `ecommerce.catalog.database-v1` runs after Core and is recorded through `migration_schema`. It is repeatable. No product entries are fabricated or seeded: choose an existing active Core product in the new-entry popup. The category filter uses existing Core categories. Currency defaults to INR and is editable.

Catalog supports search, category/status/publication filters, pagination, details with activity, create/edit popups, suspend/reactivate, and permanent deletion. Suspension unpublishes an entry; reactivation keeps it as a draft. Permanent deletion requires an unpublished, inactive entry and rejects dependent records. Core product/category records are preserved. Inactive or deleted Core products and inactive categories make published entries unavailable.

Permissions are `ecommerce.catalog.view`, `.create`, `.edit`, `.status`, and `.delete`. Backend checks each action; the UI hides or disables unavailable actions. Run `npm run test:e2e:ecommerce-catalog` against the isolated `cxsun_dev_` fixture to verify API behavior and Core schema/data preservation.

Paid checkout, orders, payments and inventory availability remain separate workflows. Opening stock in Core is not treated as live inventory. Production hosting must serve the ecommerce build and reverse-proxy `/api/platform` to Platform, preserving the browser hostname.

## Techmedia public storefront

`npm run dev` also serves the anonymous customer shop at **7040** (`CXSUN_STOREFRONT_WEB_PORT`). To run it separately: `npm run dev:storefront`. Its build is `dist/apps/ecommerce/storefront`. The API stays in Platform on 7010. The staff desk on 7030 and Platform Ecommerce navigation both include **Storefront** settings and a persisted quote inbox.

The customer shop provides category browsing, search, sorting, product details, seller attribution and a quote basket. Quote requests require contact details and consent, are persisted transactionally with product/price snapshots, and have idempotency keys and a database-backed intake limit. Basket contents are held in memory and reset on reload. There is no payment collection, stock reservation or confirmed order. A zero catalog price appears as **Price on request**. Availability is always confirmed by the seller.

Anonymous requests resolve a tenant through its verified hostname and live Ecommerce entitlement. Tenant headers and staff session selection cannot choose a public store. Localhost is an explicit development-only default-tenant exception. Stores start disabled; an authorised member reviews branding and published products before enabling them. Public responses exclude Core identifiers, customer details, audit history and staff permissions. Customer contact details are available only through the protected quote inbox. Production must reverse-proxy `/api/platform`, preserve the hostname, and bind the tenant's verified domain; this change does not publish to or modify Techmedia.in.

New migration `ecommerce.storefront.database-v1` creates only owner tables: `ecommerce_storefront_config`, `ecommerce_storefront_quotes`, `ecommerce_storefront_quote_items` and `ecommerce_storefront_activity`. Core schema and existing migrations are preserved. Quote snapshots restrict deleting referenced catalog records.

### Marketplace rollout

1. **Computer shop (implemented):** one configured industry and seller, shared Core product/category references, Ecommerce merchandising, real public catalog and quote intake. The public contract exposes industries, vendors and an offers array per product. The development preview mirrors eight actual products read from Techmedia.in on 10 October 2026; this is a bounded import into the isolated development tenant, not an automatic ERP synchronisation.
2. **Multiple industries:** introduce Ecommerce-owned industry, department and category mapping tables. Reuse Core identities; add industry-specific attributes and navigation without changing existing Core tables. Decide whether stores share a tenant or use separately verified tenant domains before provisioning them.
3. **Multiple vendors:** introduce verified seller profiles, onboarding and scoped staff access, seller-product offers with price/currency, availability, fulfilment and warranty terms, plus moderation and audit. The current offers contract supports extension, but seller onboarding and multiple persisted offers are not implemented yet.
4. **Orders and payments:** introduce owner cart/order/line/payment tables, authoritative availability checks, shipping and tax rules, payment-provider webhooks, refunds and vendor settlement. Agree merchant-of-record and fulfilment responsibilities before enabling paid checkout.
5. **Operations:** add catalog synchronisation, consent/retention policy, quote notifications, media ownership, search indexing, monitoring and production domain routing. Integrate each through public contracts and migration-owned tables.

Validation: `npm run test:e2e:storefront`, `npm run test:e2e:ecommerce-catalog`, `npm run test:e2e:composed-runtime`, `npm run check`, and `npm run build`, from the root. Storefront E2E runs only against an isolated `cxsun_dev_` database and cleans its test quote.

The eight reference product WebP images are bundled from the public Techmedia ERP image URLs to make the development preview independent of browser network access. Their original URLs remain in catalog records; other catalog images load normally with an unavailable-image fallback. Replace or refresh these owned reference assets as catalog media changes.

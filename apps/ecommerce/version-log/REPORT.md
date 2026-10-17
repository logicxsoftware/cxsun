# Ecommerce Storefront Version Archive & Evolution Report

> **Location:** `apps/ecommerce/version-log`  
> **Source Target:** `apps/ecommerce/web/src/modules/storefront`  
> **Status:** Cleaned – Only plain baseline and version `1` snapshots retained.

---

## 1. Version Architecture & Retention Policy

1. **Active Live Tree (`apps/ecommerce/web/src/modules/storefront/`)**:
   - Contains the base unnumbered files (`storefront.page.tsx`, `storefront.navigation.tsx`, etc.) and the promoted **`1`** files.
   - `index.ts` imports from the active **`1`** snapshot (`storefront.page1.tsx`).
2. **Version Archive (`apps/ecommerce/version-log/`)**:
   - Intermediate development snapshots (`*2` through `*16`) have been removed.
   - Only the promoted **`1`** reference snapshots are preserved in the archive.

---

## 2. Retained Version `1` Files in `version-log`

All files from `2` to `N` have been purged. The retained archive files are:

| File Name | Description |
| :--- | :--- |
| **`storefront.page1.tsx`** | Promoted storefront home controller |
| **`storefront.navigation1.tsx`** | Promoted header navbar component |
| **`storefront.navigation1.css`** | Header & mobile search styles |
| **`storefront.components1.tsx`** | Promoted shared UI component library |
| **`storefront.home-sections1.tsx`** | Section orchestration and order mapping |
| **`storefront.home-redesign1.css`** | Homepage redesign layout & typography tokens |
| **`storefront.popular-picks1.tsx`** | Category and trending carousel |
| **`storefront.campaigns1.tsx`** | Promotional campaign cards and event banners |
| **`storefront.campaigns1.css`** | Campaign layout styling |
| **`storefront.season-banner1.tsx`** | Seasonal showcase banner component |
| **`storefront.season-banner1.css`** | Seasonal banner styling |
| **`storefront.promotions1.css`** | Promotional badges and discount tags |

---

## 3. Active Source Tree Mapping

In `apps/ecommerce/web/src/modules/storefront/`:

```
apps/ecommerce/web/src/modules/storefront/
├── index.ts                         <-- Main entry (exports StorefrontPage from storefront.page1)
├── storefront.page1.tsx             <-- Active page controller
├── storefront.navigation1.tsx       <-- Active navigation component
├── storefront.navigation1.css       <-- Active navigation styles (with mobile icon search)
├── storefront.components1.tsx       <-- Active shared UI components
├── storefront.home-sections1.tsx    <-- Active home section pipeline
├── storefront.home-redesign1.css    <-- Active homepage layout styling
├── storefront.popular-picks1.tsx    <-- Active category & trending carousel
├── storefront.hero1.tsx             <-- Active hero banner slider
├── storefront.campaigns1.tsx        <-- Active promotional campaigns
└── storefront.season-banner1.tsx    <-- Active seasonal banners
```

---

## 4. Workflow for Future Additions ("Add by Add")

1. **Target Single Component**: Make atomic modifications to one section at a time.
2. **Test Directly**: Verify changes immediately in Vite (`npm run dev:ecommerce`).
3. **Keep It Clean**: Do not accumulate loose `*2` ... `*16` files; keep plain and `1` as standard.

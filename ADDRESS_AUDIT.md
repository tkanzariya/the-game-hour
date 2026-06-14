# Address Audit

Updated: 2026-06-14

## New canonical address

```
4THF-406, Shilp Satved,
Beside Sindhu Bhavan Hall,
Sindhu Bhavan Road,
Bodakdev,
Ahmedabad, Gujarat 380059,
India
```

## Files updated

| File | Change |
|------|--------|
| `src/data/content/company-info.json` | Added full `location` (display) and structured `address` object for schema |
| `src/data/types.ts` | Extended `CompanyInfoData.contact` with `address` fields |
| `src/lib/content/company.ts` | Added `getContactLocationDisplay()` and `getContactPostalAddress()` |
| `src/lib/seo/structured-data.ts` | Organization + LocalBusiness schema now use full `PostalAddress` (street, locality, region, postal code, country) |
| `src/components/Footer/Footer.tsx` | Footer contact column shows full multi-line address |
| `src/pages/ContactPage.tsx` | Location block + SEO description reference Bodakdev office |

## Single source of truth

All live address display flows from **`src/data/content/company-info.json`** via:

- `getContactLocationDisplay()` — footer, contact page
- `getContactPostalAddress()` — JSON-LD structured data

## Not changed (intentionally)

These mention "Ahmedabad" as **city/service area**, not the business street address:

- `src/data/content/testimonials.json` — client attribution cities
- `src/data/content/faqs.json` — service area list
- `src/data/content/home.json` — coverage cities
- `src/data/about.json` — brand story copy
- `src/data/content/event-stories.json`, `gallery-stories.json` — event locations
- Documentation files under `docs/` and `archive/`

## Verification

- Footer: scroll to contact column
- Contact: https://thegamehour.com/contact → Location card
- View page source / Rich Results: Organization + LocalBusiness `address` fields

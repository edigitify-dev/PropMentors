# Project photograph matching

The uploaded `public/Archive 2` photographs were reviewed as contact sheets against the building catalogue and previously uploaded Cloudinary images. Matches use explicit project slugs and sectors; similarly named buildings do not inherit each other's photographs.

`node scripts/prepare-project-images.mjs` generates WebP copies in `public/images/projects` and their dimensions in `src/data/archive-project-images.json`. Listing cards, detail galleries, exterior views, and workspace cards use the same matched collection. Covers show the building exterior.

`node scripts/upload-project-images.mjs` uploads the prepared copies to the existing Cloudinary account and records their URLs in `cloudinary-map.json`. Content hashes and non-overwriting uploads make this repeatable. Hosted URLs take precedence over local copies so database updates also work for the deployed site.

Passing `--archive` also backs up every original photograph, including excluded and duplicate gallery images. The backup manifest in `src/data/archive-cloudinary-backup.json` records each original relative path, full SHA-256 hash, byte count, and Cloudinary URL. Every uploaded original and optimized copy is downloaded and compared with its source hash. Progress is saved atomically, so interrupted migrations can be resumed.

Migration is complete: all 135 original photographs and 125 optimized site photographs are hosted and verified in Cloudinary. The 29 archive-backed project records now use hosted URLs, and `public/Archive 2` has been removed. The preparation script can regenerate optimized photographs directly from the verified Cloudinary originals if the local archive is absent. The optimized local copies remain available as fallbacks.

## Archive matches

| Archive folder | Catalogue project | Sector |
| --- | --- | --- |
| 8 Square | 8 Square | 125 |
| ADD India Tower | ADD India Tower | 125 |
| Ace Studio | Ace Studio | 126 |
| Add India Centre | Add India Centre | 125 |
| Add India Heights | Add India Heights | 125 |
| BPTP Capital City | BPTP Capital City | 94 |
| Boulevard | Tech Boulevard | 127 |
| Club 125 | Club 125 | 125 |
| Delphi tower | Delphi Tower | 132 |
| Elixir business park | Elixir | 127 |
| Express Trade Tower | Express Trade Tower | 132 |
| Fusion Square | Fusion Square | 126 |
| IHDP Business Park | IHDP Business Park | 127 |
| Jask sec 125 | JASK Tower | 125 |
| Louts Business park | Louts Business park | 127 |
| Lucerna Tower | Lucerna Tower | 125 |
| Maple Corporate Park | Maple Corporate Park | 125 |
| Pinnacle Tower 132 | Pinnacle Tower 132 | 132 |
| Pride Tower | Pride Tower | 125 |
| Stellar 127 | Stellar 127 | 127 |
| Supertech Astralis | Supertech Astralis | 94 |
| Tapasya Corp Heights | Tapasya Corp Heights | 126 |
| The Opus 132 | The Opus 132 | 132 |
| Tirupati AKC | Tirupati AKC | 126 |
| Tradex Tower | Tradex Tower | 125 |
| Urbtech One 27 | Urbtech One 27 | 127 |
| Urbtech Trade Centre + matching UTC photographs | Urbtech Trade Centre | 132 |
| VJ Business Tower | VJ Business Tower | 125 |
| Windsor IT Park | Windsor IT Park | 125 |

## Previous uploads

Retained the existing project-specific uploaded collections for Advant Navis, Assotech Business Cresterra, Aykon Tower, Candor TechSpace Sector 135, DLF Tech Park, Embassy Oxygen Business Park, Gulshan One29, Max Square, Max Towers, Skymark One, and Windsor Grand. Reviewed the covers and interior/exterior classification; receptions and meeting rooms previously used as first images now follow an exterior cover.

The archive collections for Boulevard, Express Trade Tower, and JASK include their matching previous photographs as optimized local copies.

## Exclusions

- `UTC /NPX-1.jpg` depicts a separate development. `UTP-project-11.jpg` does not establish a match to Urbtech Trade Centre.
- `Jask sec 125/g6ujyf.webp` is also in the previous Aykon collection and shows that building's distinctive facade; it is excluded from JASK.
- Two exact duplicate interiors were filed under different projects: `Add India Heights/3.webp` and `Jask sec 125/3ee6t2.webp`; `Boulevard/1769768760_12.jpg.webp` and `Jask sec 125/1770367019_12.jpg.webp`. Both copies of each ambiguous image are excluded.
- Watermarked copies are omitted where the archive supplies the same exterior photograph without that watermark (Boulevard, Express Trade Tower, and JASK).
- The placeholder Sector 127 entries for JASK and Lucerna were merged into their complete Sector 125 records during the [duplicate review](project-deduplication.md). ATS Bouquet, Bhutani Cyberthum, and Sovereign Corporate Towers are not assigned to similarly named but different catalogue buildings.

## Existing database records

The live pages read PostgreSQL rather than the seed catalogue. Preview changes with `npx tsx scripts/sync-project-images.ts`; apply with `npx tsx scripts/sync-project-images.ts --apply`. The script validates image paths and project payloads, saves the original affected project records in a private temporary backup, and updates image fields in a transaction. Descriptions, prices, contacts, publication status, floor plans, and other project information are preserved. Running it again without further changes updates nothing.

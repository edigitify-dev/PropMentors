# Reviewed project duplicates

Reviewed on 2026-10-22 at the owner's request. The original spreadsheet catalogue remains intact. `src/data/project-duplicates.json` excludes these extra entries from generated inventory and keeps their slugs as aliases of the retained projects:

| Extra entry | Retained entry | Evidence |
| --- | --- | --- |
| JASK Tower, Sector 127 | JASK Tower, Sector 125 | The source import flags a sector conflict; the complete record and supplied photos belong to Sector 125. [JLL listing](https://property.jll.co.in/listings/plot-no-19-20-plot-no-19-20-sector-125). |
| Lucerna Tower, Sector 127 | Lucerna Tower, Sector 125 | The source import flags a sector conflict; the complete record and supplied photos belong to Sector 125. [EstateLion listing](https://estatelion.com/lucerna-tower-build1064). |
| Discovery Tower, Sector 142 | Discovery Tower, Sector 62 | The source import flags a sector conflict. [EstateLion listing](https://estatelion.com/discovery-tower-build1027). |
| Mejistic Insignia, Sector 62 | Majestic Signia, Sector 62 | Inferred spelling duplicate: the extra entry has no independent address, photos or specifications. The [HSN listing](https://www.hsnrealty.com/listing/awfis-majestic-signia-sector-62-noida) uses both Signia and Insignia for the same A-27 building. |

Both Candor TechSpace entries remain: Sector 62 and Sector 135 have separate matched sources, addresses, photographs and coordinates.

Live pages read PostgreSQL. Preview with `node --import tsx scripts/deduplicate-projects.ts`; apply with `node --import tsx scripts/deduplicate-projects.ts --apply`. The script backs up affected rows before applying changes in one transaction, transfers old URL aliases and enquiry references, and replaces duplicate IDs in related-project lists. It refuses to remove an extra entry that has acquired real photographs. Repeating it without further changes removes nothing.

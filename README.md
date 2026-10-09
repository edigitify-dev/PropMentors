# PropMentor

PropMentor is a Next.js application using the App Router, TypeScript, and Tailwind CSS.

## Getting started

Install dependencies, then start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` checks TypeScript types.

## Project structure

```text
src/
  app/             App Router routes, layouts, and global styles
  components/
    layout/        Shared page and navigation components
    ui/            Reusable interface primitives
  features/        Domain or feature-specific modules
  hooks/           Shared React hooks
  lib/             Shared utilities and integrations
  types/           Shared TypeScript types
public/            Static assets served from the site root
```

Keep route-specific files in `src/app` and group feature logic under `src/features` as the app grows.

## About page

`/about` implements the supplied full-page screenshot through `src/components/about-page.tsx` and its scoped CSS. The hero, city backdrop and main adviser portrait use the three original files in `public/about`. The About hero occupies exactly `100dvh`, with height-aware typography, image cropping and bottom copy so its complete content is visible before scrolling into the next section; it does not pin or expand on scroll. The page includes the “Space Is The Product” hero, two-column commercial-real-estate introduction, alternating Understand/Curate/Guide tiles, business destinations and map preview, and adviser carousel. `WorkspaceOffers` and `AtAGlance` are called directly from the homepage components; their hover interactions, statistics and responsive styles remain shared. `SiteFooter` supplies the final CTA and footer. The decision-grid photos and additional adviser thumbnails reuse the existing homepage imagery where separate About assets were not provided.

About Us in the homepage navbar, project navbar and mobile menus now links to `/about`, as does the shared footer’s About link. The active About navbar link exposes `aria-current="page"`. The centered navbar remains shared with the project pages. Search/Program on About opens `/projects`; Contact and the enquiry icon open a validated enquiry draft with copy/download and email sharing. No enquiry endpoint is configured.

The About destinations section uses a client-side Leaflet map with OpenStreetMap street tiles and visible contributor attribution. `src/data/business-destinations.ts` contains city-centre coordinates for Delhi, Gurugram, Noida and Greater Noida; these indicate regional coverage, not individual property addresses. Each labelled marker pulses gently, with animation disabled for reduced motion. Destination chips and keyboard-accessible markers open the existing sample preview card directly below the selected geographic marker; no card is open initially. The card tracks the marker while dragging/zooming, and the map pans when necessary to keep the marker and card visible. Its close button, Escape, a map-background click or Show all cities dismiss it. The project card opens its detail page; View Our Spaces opens `/projects`. The map supports dragging, pinch/zoom controls and a Show all cities reset; mouse-wheel zoom is disabled so page scrolling continues normally. Leaflet and visible tiles load when the section enters the viewport. The preview card stays anchored below its marker on both desktop and mobile. OpenStreetMap tiles need an internet connection; a loading/error state and retry are provided. No map API key is needed. The sample project records remain placeholders until verified city-specific inventory is supplied.

The adviser rail supports thumbnail selection, looping previous/next controls, keyboard arrows and swipe scrolling. The selected portrait crossfades, with transitions disabled for reduced motion. Only the main adviser backdrop was supplied for About, so additional portraits use the existing expert assets and role labels until the real team names and photos are available. Play icons in the thumbnails are decorative because no video assets were supplied. Desktop preserves the reference proportions and homepage spacing; tablet/mobile stack text, decision cards and shared sections without horizontal page overflow.

## Hero design

The project-page hero is available at `/projects`, implemented in `src/components/project-hero.tsx` with scoped styles in `project-hero.module.css`. It follows the supplied screenshot for the navy navigation, two-line heading, description, and rounded workspace filters, excluding Figma's blue selection guides. The user-supplied map is `public/project /Hero/a.png`; CSS crops the browser chrome out of view and applies grayscale and a fade behind the content. The navbar uses the homepage labels: Home, About Us, Program, and Contact, plus the same search, enquiry, and menu controls. The hero occupies exactly one dynamic viewport (`100dvh`); typography and spacing adapt to both width and height so the hero itself does not add extra scroll distance; the page scrolls naturally into the listings below. Mobile stacks the filters, with a compact layout for short landscape screens. Search preserves the selected criteria in URL parameters and restores them on reload; Find My Space applies the search to the listings section and scrolls it into view, respecting reduced-motion preferences. Header links target existing pages and homepage sections, and the account control opens a local enquiry draft dialog. No account authentication or live property feed is configured.

`src/components/project-listings.tsx` implements the supplied “124 Spaces Available” reference directly below the hero. It uses the homepage’s 90px desktop, 64px tablet, and 48px mobile section spacing and its centered 1440px container. The sidebar, two-column desktop grid, sorting, original photos/crops/badges, and pagination styling match the screenshot; Figma selection outlines are omitted. The six project records are shared through `src/data/projects.ts`, and `PropertyCard` renders a full-card Next.js link on the homepage, project listings and similar-project sections. Clicking or pressing Enter navigates directly to the matching project detail page; the former property-preview popup has been removed. The separate Find My Space enquiry dialog remains available. Location and budget filters use the supplied records; space-format and amenity selections are ready for those optional data fields, which are absent from the current records. The initial 124-space heading and 20-page pagination are design placeholders; subsequent filtering shows the actual local count. Pages beyond the six supplied records remain disabled until more listings are provided. Tablet/mobile layouts adjust the sidebar and cards without horizontal overflow.

`src/components/project-enquiries.tsx` implements the two sections following the project listings. The full-width requirement banner uses the supplied `public/project /Hero/o.png` with the reference crop and dark overlay, left-side CTA, and cream form card. Share My Requirement focuses the first form field. The six required fields use native validation; Continue opens a review with copy/download and email sharing rather than claiming a server submission. The adjacent navy owner CTA opens the listing-draft dialog shared with the homepage through `src/components/property-listing-dialog.tsx`. Desktop matches the 750px banner and centered owner CTA inside the 1440px design container; tablet/mobile stack the content and keep usable form controls. No enquiry submission endpoint or listing publication service is configured.

The project page then reuses the homepage’s `RealGuidance` and `SiteFooter` components, including the existing guidance hover transitions and final CTA. The shared footer accepts an optional `homePath`; `/projects` passes `/` so footer anchors target existing homepage sections, while the homepage preserves its original local anchors.

The complete project detail design is available through each project’s descriptive `/projects/[slug]` URL. Existing `/projects/space-01` through `/projects/space-06` links and `/projects/kr-signature-sector-135` remain supported as aliases for the matching records. `src/components/project-detail.tsx` and its scoped CSS reproduce the supplied full-page screenshot: property gallery, breadcrumb and title, section navigation, overview, workspace options, building information, amenities, location map, space-view tabs, benefits, similar properties, requirement banner and shared footer. The right enquiry card uses native CSS sticky positioning inside the two-column detail region, without a separate scroll container; it remains in place as the left content scrolls, and releases before the full-width benefits. On tablet/mobile it moves into the normal flow above the details. Navigation is shared through `ProjectHeader`, and `RealGuidance` accepts optional copy while preserving its homepage defaults. `ProjectEnquiries showOwners={false}` renders only the requirement banner on the detail page.

`src/data/projects.ts` defines the shared `Project`, `ProjectImage`, `WorkspaceOption` and `ProjectFact` types. A project record owns its ID, unique slug, name, location, category, price, cover photo, features and all detail-page content: description, gallery, workspace options, building facts, amenities, map, directions, floor plan/interior/exterior images, starting rate, highlights, benefits and similar-project IDs. Card labels, page headings, breadcrumb, page metadata and enquiry/email context all read that same record. Images have explicit source paths and dimensions, independent of the project’s ID or URL. Add a `Project` record to `projects` to create another page with the same layout; `generateStaticParams` picks up its slug automatically. The route keys the detail component by project ID so navigating between projects resets the gallery, selected tab and enquiry state. Unknown slugs return 404.

The six current entries use distinct sample names with the existing homepage product photos, pending final property data. Their prices, building facts, amenities and shared map are design placeholders. Replace the sample records with verified project content; the supplied map is a temporary preview and directions are generated from each record’s own query. No exact floor-plan assets were supplied: each Floor Plan tab falls back to its own cover photo with a “Floor plan available on request” label, until `detail.views.floorPlan` is provided. Gallery thumbnails, the photo dialog and Interior/Exterior tabs read the selected project’s own image arrays. Visit, brochure and workspace actions prepare a validated enquiry containing the selected project’s name, location and reference; it can be copied/downloaded or shared through email, without claiming a booking or a backend submission.

The home page implements the hero from Figma node `331:1748` within [PropMentors](https://www.figma.com/design/WCASrbP2LzIR9rWmggAvFt/PropMentors?node-id=327-1502). The desktop reference is 1440 × 940. The original masked office photo and logo are stored in `public/images`; fonts are served locally from `public/fonts`.

Only the navbar is interactive. The hero's workspace labels, descriptions, Find My Space label, and down arrow are static content with no click or hover behavior. The navbar's menu, workspace filter, and enquiry draft dialog work locally. Enquiries can be copied or downloaded; no enquiry submission service or account authentication is configured.

The hero uses the full available width and adapts to the desktop viewport height, including browser zoom changes. Its original photo cutout is preserved while the photograph crops without distortion. Scrolling pins the hero and expands its photo to fill the viewport. The header, title, tagline, introduction, and workspace cards move into the expanded reference layout as the photo grows. The decorative down arrow travels below the viewport, and the page then releases into the next section. The animation reverses when scrolling back and is disabled for reduced-motion preferences.

`src/components/at-a-glance.tsx` implements the next Figma section, “Experience you can measure,” after the hero. It uses the original photos and SVG masks from `public/images/glance`, with the staggered desktop statistics grid and stacked mobile cards. The section is static content with the default cursor.

Right-hand section introductions consistently use Figma's Manrope Medium (500), including both PropertyOwners paragraphs. Their shared CSS disables font synthesis and uses grayscale antialiasing to reduce the heavier browser appearance while preserving the design's weight, font sizes, and line heights.

`src/components/explore-spaces.tsx` implements “Spaces that fit the way you work” with the six original Figma property photos, masks, badges, and listing details from `public/images/spaces`. The filters search the supplied listings locally; View More clears filters and shows all six. Find My Space opens an enquiry draft that can be copied or downloaded. No live property feed is configured.

`src/components/property-owners.tsx` implements “Have a space to lease?” with the navy background, three listing benefits, and List Your Space action from Figma node `470:667`. The action opens a listing draft that can be copied or downloaded; it does not publish a property listing.

`src/components/workspace-offers.tsx` implements “More than finding a property” from Figma node `358:2477` immediately after PropertyOwners. Hovering, focusing, or tapping a workspace card expands its description and crossfades the image panel. Managed Offices uses the original Figma photo and mask in `public/images/offers`. The saved design contains only that default image; Co-Working Spaces and Conventional Leasing reuse the existing team and office photos in `public/images/glance` until their Figma variants can be retrieved. The layout stacks on mobile and respects reduced-motion preferences.

`src/components/real-guidance.tsx` implements the following section, “Real Estate decisions deserve real guidance,” from Figma node `346:1856`. The Experience, Perspective, and Clarity cards use the original photos and SVG masks in `public/images/guidance`, including the M-shaped photo on the navy center card. Hovering a card smoothly switches it to navy and the other cards to light blue, including their text and number badge colors. Leaving a card restores the default navy center card. The cards remain informational with the default cursor, arranged in three columns on desktop and stacked on mobile. Touch devices retain the default composition, and reduced-motion preferences disable the transitions.

`src/components/our-approach.tsx` implements “From requirement to right-fit space” from Figma node `352:2234` after the guidance cards. Its four steps—Understand, Identify, Evaluate, and Close—use the original circle, icon-mask, connector, and dot assets in `public/images/approach`. `src/hooks/use-approach-timeline.ts` pins the section while scrolling fills the horizontal line, moves its indicator, and highlights each step with the first step's navy circle and accent title. The animation reverses on upward scroll and holds Close briefly before releasing into the following content. Desktop shows all four steps; smaller screens slide the current step into view. Reduced-motion preferences restore the unpinned tablet/mobile layout. The cards remain informational with the default cursor and expose the current step through `aria-current`.

`src/components/client-stories.tsx` implements “Trusted by businesses making their next move” from Figma node `362:2705`, immediately after OurApproach. It preserves the five-card rail, original still images, masks, crops, blue side-card overlays, larger center card, and testimonial text from `public/images/stories`. Previous/next controls and left/right arrow keys cycle through the stories, with accessible slide announcements and reduced-motion support. Mobile keeps the selected card centered with neighboring cards partially visible. The design supplies still images rather than video files, so its play symbol remains decorative until playback media is provided; the source's placeholder attribution is preserved.

`src/components/insights.tsx` implements the following Figma section, “Know more. Lease smarter,” from node `352:2412`. It preserves the five-card horizontal strip, wide Know Your Lease feature, original cover artwork, photo crops, masks, gradient, and caption. Exact office-photo matches reuse `public/images/spaces/space-04.png` and `space-06.png`; the remaining assets are stored in `public/images/insights`. Previous/next controls, arrow keys, and native swipe scrolling loop infinitely in either direction. Three identical copies let the rail reposition seamlessly after scrolling settles; duplicate cards are hidden from assistive technology. Reduced-motion preferences disable smooth scrolling. The source's play symbol remains decorative because no video file or article destinations were supplied.

`src/components/site-footer.tsx` implements the final CTA and footer from Figma node `363:1256`. It uses the original expert portraits, avatar mask, divider, large two-part wordmark, footer logo, and four social icons in `public/images/footer`. The gradient spans the full page width, with the overlapping navy panel and desktop alignment preserved inside the 1440px design container. Tablet/mobile layouts stack the CTA and footer columns without page overflow. Talk to a PropMentor opens an email to `hello@propmentors.in`; footer navigation targets the existing page sections and the About page. The supplied phone placeholder, social icons, and Privacy Policy / Terms labels remain informational until real contact details and destinations are supplied.

The Kind Avenue demo font matches Figma and is licensed for personal use. Replace it with a commercially licensed copy before public launch; see `public/fonts/kind-avenue-license.txt`.
# PropMentors

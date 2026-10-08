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

## Hero design

The home page implements the hero from Figma node `331:1748` within [PropMentors](https://www.figma.com/design/WCASrbP2LzIR9rWmggAvFt/PropMentors?node-id=327-1502). The desktop reference is 1440 × 940. The original masked office photo and logo are stored in `public/images`; fonts are served locally from `public/fonts`.

Only the navbar is interactive. The hero's workspace labels, descriptions, Find My Space label, and down arrow are static content with no click or hover behavior. The navbar's menu, workspace filter, and enquiry draft dialog work locally. Enquiries can be copied or downloaded; no enquiry submission service or account authentication is configured.

The hero uses the full available width and adapts to the desktop viewport height, including browser zoom changes. Its original photo cutout is preserved while the photograph crops without distortion. Scrolling pins the hero and expands its photo to fill the viewport. The header, title, tagline, introduction, and workspace cards move into the expanded reference layout as the photo grows. The decorative down arrow travels below the viewport, and the page then releases into the next section. The animation reverses when scrolling back and is disabled for reduced-motion preferences.

`src/components/at-a-glance.tsx` implements the next Figma section, “Experience you can measure,” after the hero. It uses the original photos and SVG masks from `public/images/glance`, with the staggered desktop statistics grid and stacked mobile cards. The section is static content with the default cursor.

`src/components/explore-spaces.tsx` implements “Spaces that fit the way you work” with the six original Figma property photos, masks, badges, and listing details from `public/images/spaces`. The filters search the supplied listings locally; View More clears filters and shows all six. Find My Space opens an enquiry draft that can be copied or downloaded. No live property feed is configured.

`src/components/property-owners.tsx` implements “Have a space to lease?” with the navy background, three listing benefits, and List Your Space action from Figma node `470:667`. The action opens a listing draft that can be copied or downloaded; it does not publish a property listing.

`src/components/workspace-offers.tsx` implements “More than finding a property” from Figma node `358:2477` immediately after PropertyOwners. Hovering, focusing, or tapping a workspace card expands its description and crossfades the image panel. Managed Offices uses the original Figma photo and mask in `public/images/offers`. The saved design contains only that default image; Co-Working Spaces and Conventional Leasing reuse the existing team and office photos in `public/images/glance` until their Figma variants can be retrieved. The layout stacks on mobile and respects reduced-motion preferences.

`src/components/real-guidance.tsx` implements the following section, “Real Estate decisions deserve real guidance,” from Figma node `346:1856`. The Experience, Perspective, and Clarity cards use the original photos and SVG masks in `public/images/guidance`, including the M-shaped photo on the navy center card. Hovering a card smoothly switches it to navy and the other cards to light blue, including their text and number badge colors. Leaving a card restores the default navy center card. The cards remain informational with the default cursor, arranged in three columns on desktop and stacked on mobile. Touch devices retain the default composition, and reduced-motion preferences disable the transitions.

`src/components/our-approach.tsx` implements “From requirement to right-fit space” from Figma node `352:2234` after the guidance cards. Its four steps—Understand, Identify, Evaluate, and Close—use the original circle, icon-mask, connector, and dot assets in `public/images/approach`. `src/hooks/use-approach-timeline.ts` pins the section while scrolling fills the horizontal line, moves its indicator, and highlights each step with the first step's navy circle and accent title. The animation reverses on upward scroll and holds Close briefly before releasing into the following content. Desktop shows all four steps; smaller screens slide the current step into view. Reduced-motion preferences restore the unpinned tablet/mobile layout. The cards remain informational with the default cursor and expose the current step through `aria-current`.

`src/components/client-stories.tsx` implements “Trusted by businesses making their next move” from Figma node `362:2705`, immediately after OurApproach. It preserves the five-card rail, original still images, masks, crops, blue side-card overlays, larger center card, and testimonial text from `public/images/stories`. Previous/next controls and left/right arrow keys cycle through the stories, with accessible slide announcements and reduced-motion support. Mobile keeps the selected card centered with neighboring cards partially visible. The design supplies still images rather than video files, so its play symbol remains decorative until playback media is provided; the source's placeholder attribution is preserved.

`src/components/insights.tsx` implements the following Figma section, “Know more. Lease smarter,” from node `352:2412`. It preserves the five-card horizontal strip, wide Know Your Lease feature, original cover artwork, photo crops, masks, gradient, and caption. Exact office-photo matches reuse `public/images/spaces/space-04.png` and `space-06.png`; the remaining assets are stored in `public/images/insights`. Previous/next controls, arrow keys, and native swipe scrolling browse the strip, with controls disabled at each end and smooth scrolling disabled for reduced-motion preferences. The source's play symbol remains decorative because no video file or article destinations were supplied.

The Kind Avenue demo font matches Figma and is licensed for personal use. Replace it with a commercially licensed copy before public launch; see `public/fonts/kind-avenue-license.txt`.
# PropMentors

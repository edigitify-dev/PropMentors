# PropMentors admin workspace

The management suite lives at `/admin`. It includes a portfolio overview, project editor, enquiry inbox, and editable contact page. Public projects, their detail pages, related projects, homepage listings, and contact details read from PostgreSQL at request time.

## Setup

1. Set `DATABASE_URL` in `.env.local` to your PostgreSQL connection string, including the SSL options required by your provider. Keep the file private.
2. Set `ADMIN_SETUP_TOKEN` to a random secret: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Run `npm run db:setup` to create tables and import the existing catalogue. This is safe to repeat: existing projects and settings are preserved.
4. Run `npm run dev`, open `/admin/setup`, and enter the setup key, your name, email, and a password of at least 12 characters. There is no default administrator or public signup. Setup closes as soon as the first account exists.
5. Configure the existing `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to enable photo uploads. Existing HTTPS image URLs and local public image paths also work.

For production, run `npm run db:setup` against the production database before starting the app, configure `APP_URL` to the public HTTPS origin, and use `npm run build` followed by `npm start`. Use a Node.js host with PostgreSQL connectivity. Only enable `TRUST_PROXY=true` if your host replaces and validates `X-Forwarded-For`.

## Managing content

- Projects have draft, published, and archived states. Only published projects appear publicly. Archive a project to remove it from the site while preserving its information and associated enquiries.
- The editor covers listing information, pricing, facts, amenities, finished types, image uploads and URLs, gallery, map coordinates, nearby landmarks, workspace options, benefits, highlights, and related projects.
- Changing a project's URL preserves its previous slug as an alias. Existing catalogue aliases remain supported. Colliding URLs are rejected. Saving a stale editor version produces a conflict instead of overwriting someone else's changes.
- Contact settings update the contact page heading, introduction, phone, email, and address. Business details also update in the shared footer.
- Contact-page, property-detail, workspace-requirement, and footer forms submit directly to PostgreSQL. The inbox supports search, status filters, private notes, status updates, CSV export, and email/phone links. Email replies open your email app; the application does not send notification or reply emails automatically.
- Sessions last seven days, use HttpOnly cookies, and are revoked on sign-out. Passwords use salted scrypt hashes. Every admin mutation checks authorization and request origin. Login/setup/enquiry limits are stored in PostgreSQL. Keep normal database backups through your database provider.

The original catalogue remains in `src/data/projects.ts` as a one-time seed source. Runtime components use shared types and formatting from `src/lib/project-types.ts`; they do not read the seed catalogue.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build`. Run `npm run test:integration` after a production build. Integration tests create and drop a separate local PostgreSQL database and never use the application's `DATABASE_URL`. Set `TEST_DATABASE_URL` to a PostgreSQL connection with permission to create test databases if your local default is different. Set `TEST_PORT` if port 3117 is unavailable.

The integration suite covers protected routes and mutations, first-run setup, password hashing, origin checks, drafts/publication/archiving, live content reads, aliases, URL conflicts, stale writes, enquiry persistence, contact settings, sessions, and rate limits.

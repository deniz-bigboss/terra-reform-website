# CLAUDE.md — Terra Reform website

Context for Claude Code sessions working on this repo. Read this first.

## What this is

The website for **Terra Reform**, an independent, student-led science and technology
initiative founded in 2022 by Deniz Yılmaz and Mahmut Kartal. It presents the group's
competition entries, research proposals, and projects (TEKNOFEST, TÜBİTAK 2204-A,
CERN Beamline for Schools, NYAS).

It is a **hand-written static site** — plain HTML, one CSS file, one JS file.
No framework, no build step, no package.json, no dependencies. Do not introduce a
build system or a JS framework; edits are made directly to the HTML files.

**Live at:** https://terra-reform.org

## Hosting & deployment

- **GitHub Pages**, serving the repo root (`.nojekyll` disables Jekyll processing).
- `CNAME` holds the custom domain. **Never delete or edit it** — doing so unbinds the domain.
- **Deployment = merging to `main`.** There is no CI, no build, no deploy step.
  Pushing to `main` publishes within a minute or two.
- DNS points the apex at GitHub Pages' four A records and `www` at
  `deniz-bigboss.github.io`. If you ever touch DNS, preserve those.

## Repo layout

```
index.html  about.html  programs.html  news.html  join.html  contact.html
privacy.html  404.html                  ← English pages (8)
projects/*.html                         ← English project pages (7)
tr/                                     ← Turkish mirror, same 8 pages
tr/projects/*.html                      ← Turkish project pages (7)
styles.css        ← ~1080 lines, the entire site's CSS
script.js         ← ~320 lines, all behaviour
sitemap.xml  robots.txt  feed.xml  site.webmanifest  favicon.ico  CNAME  .nojekyll
assets/           ← posters, logos, team photos
assets/thumbs/    ← generated 800px thumbnails (.webp + .jpg)
tools/new-post.py ← news post generator
```

## THE most important rule: the site is bilingual

Every page exists twice — English at the root, Turkish under `/tr/`.
**Any content change must be made in both.** A change landed in only one language is a bug.

Differences between the two trees:
- **Asset paths**: root pages use `assets/…`; `/tr/` pages use `../assets/…`;
  `/tr/projects/` pages use `../../assets/…`.
- **Nav/footer links**: root uses `/about.html`; Turkish uses `/tr/about.html`.
- Turkish pages set `<html lang="tr">` and translate all visible copy, `aria-label`s,
  and the JSON-LD `description`.

`script.js` handles an EN↔TR language toggle and a first-visit browser-language redirect.

## Page conventions

Every page's `<head>` carries, and you must keep in sync when copying a page:

- `<title>`, `<meta name="description">`
- Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:image:alt`
- Twitter: `twitter:card` (`summary_large_image`), `twitter:title/description/image`
- `<link rel="canonical">` — absolute URL, self-referencing
- **Three hreflang tags** on every page: `en`, `tr`, and `x-default` (x-default → English)
- Favicon/manifest/font `<link>`s (copy verbatim from a sibling page)
- Project and homepage pages include a JSON-LD `<script type="application/ld+json">`

`og:url` and `canonical` must point at the page's **own** language URL. The hreflang
trio is identical on both language versions of a page.

### Links are root-absolute

There are ~630 `href="/…"` / `src="/…"` links. They work because the site is served
from a domain root. **Do not convert them to relative paths**, and be aware the site
would break if ever served from a subpath.

## CSS conventions

- Single file, `styles.css`. Design tokens live in `:root` — `--bg`, `--bg-card`,
  `--green` (`#00df6b`, the brand accent), `--text`, `--text-2`, `--border`,
  `--radius`, `--ease`. **Use the tokens, don't hardcode colours.**
- **Dark theme is the default**; a light theme is opt-in via the toggle. When adding
  styles, check both — light-theme contrast bugs have happened before.
- Per-project accent colours are passed inline as `style="--c: #f59e0b;"` on
  `.proj-hero` and `.proj-thumb`, then consumed by the CSS.
- Add new rules near related ones; the file is grouped by component, not alphabetical.

## JavaScript (`script.js`)

One file, no modules, runs on every page. It provides: browser-language redirect,
theme toggle, language toggle, nav scroll shadow, mobile menu, scroll-reveal
(`.reveal` class), AJAX Formspree submission with inline success/error, the
scroll-driven timeline, and the hero canvas globe.

Notable: any `.proj-poster img` anywhere on the site is **automatically** given
click-to-enlarge behaviour. Wrap an image in `.proj-poster` and you get the lightbox free.

## Common tasks

### Adding a project page

1. Copy an existing page from `projects/` as the template (they are structurally identical).
2. Update the whole `<head>` block (see Page conventions) plus the JSON-LD.
3. Pick an accent colour and set `style="--c: …"` on `.proj-hero`.
4. Body structure: `.proj-hero` (back-link, `.proj-meta` tags, `<h1>`, `.proj-sub`,
   `.proj-status`) → `.proj-page-body` with `.proj-main` (article) + `.proj-aside`
   (poster, then `.detail-card` blocks).
5. **Create the Turkish twin** under `tr/projects/` with translated copy and `../../` asset paths.
6. Add a `.project-card` to the Projects grid on `index.html` **and** `tr/index.html`.
7. Add both URLs to `sitemap.xml`.
8. Update the homepage hero stat (`.h-stat-n`) if the project count changed — both languages.

### Adding a news post

Use the generator, don't hand-edit:

```bash
python3 tools/new-post.py --date 2026-07 \
  --title "English headline" --body "English body." \
  --title-tr "Türkçe başlık" --body-tr "Türkçe metin."
```

It updates `news.html`, `tr/news.html`, and `feed.xml` together.

### Adding images

Posters are **1086×1448** (3:4). Generate 800×1067 thumbnails in both formats:

```python
from PIL import Image
im = Image.open(src).convert("RGB")
im.save("assets/poster-NAME.jpg", quality=85, optimize=True, progressive=True)
t = im.resize((800, 1067), Image.LANCZOS)
t.save("assets/thumbs/poster-NAME-800.jpg", quality=85, optimize=True, progressive=True)
t.save("assets/thumbs/poster-NAME-800.webp", quality=80, method=6)
```

Reference them with `<picture>` + a `<source type="image/webp">` and explicit
`width`/`height` to avoid layout shift. Delete the original upload after converting.

## SEO invariants

- `sitemap.xml` must list every page, both languages. Update it when adding pages.
- `404.html` and `tr/404.html` are intentionally `noindex` — **keep it that way**, and
  they must not carry hreflang tags (a noindex page with hreflang is contradictory).
- Every other page is indexable. The privacy pages were deliberately made indexable.
- `robots.txt` allows everything and points at the sitemap.

## Git workflow

The user's standing instruction is: **merge everything you do.** Every change ships.

1. `git fetch origin main && git checkout -B <branch> origin/main`
2. Commit, push with `-u origin <branch>`
3. Open a PR against `main`, then **squash-merge** it.

**Important:** because PRs are squash-merged, the feature branch's history diverges from
`main` after every merge. Always **re-cut the branch from `origin/main`** at the start of
each new task (step 1). Doing this avoids the merge conflicts that occur when reusing a
stale branch. If the remote branch holds only already-merged history, a
`--force-with-lease` push is fine.

## Content & tone

- Copy is deliberately **honest and non-inflated** — the homepage literally says projects
  are "presented honestly." Proposals are described as proposals, concepts as concepts.
  Don't upgrade a "submitted proposal" into an "award" or imply results that didn't happen.
- Prose is plain and specific. Avoid marketing superlatives.
- Turkish copy is full translation, not transliteration — match the register of existing
  Turkish pages.

## Environment limits

- **No browser is available** in the Claude Code sandbox — you cannot visually verify
  rendering, run Lighthouse, or screenshot. Verify by reading the CSS/HTML carefully and
  by computing things (e.g. contrast ratios) in Python.
- **Pillow (PIL) is not guaranteed** — it is present in some containers and absent in
  others, and `pip install Pillow` may time out because outbound network is proxied.
  Check before relying on it. `file <image>` reports dimensions without PIL.
- `dig` is **not** installed; use DNS-over-HTTPS
  (`curl 'https://dns.google/resolve?name=…&type=MX'`) for DNS lookups.
- Image resizing instructions below assume Pillow; if it is unavailable, ask the user to
  supply correctly sized images rather than skipping the thumbnails.

## Third-party services

- **Forms** — Formspree, endpoint `xqevdddp`, used by the contact, join, and newsletter
  forms across both languages. If forms need repointing, the endpoint appears in 8 files.
  The recipient address is configured in the Formspree dashboard, not in this repo.
- **Analytics** — GoatCounter (cookieless, no consent banner required, which is why the
  privacy notice says no cookie banner is needed).
- **Contact address** — the site's public contact email is currently a Gmail address.
  This has changed more than once; **ask the user before changing it**, and if you do,
  update all occurrences including footers, the contact and privacy pages, the JSON-LD
  `"email"` field, and the fallback message in `script.js`.

## Current operational state (September 2026)

Background a new session would otherwise have to rediscover. Treat as a snapshot —
**confirm with the user before acting on any of it**, since it changes.

### Domain

- `terra-reform.org` was bought during Google Workspace signup. The **registrar of
  record is Squarespace** (Google sold its domain business to Squarespace in 2023), but
  **billing runs through Google Workspace** — clicking "payment methods" in Squarespace
  redirects into Google.
- Google support confirmed in writing: **cancelling Workspace stops the domain from
  auto-renewing.** Before cancelling, billing must either be moved directly to
  Squarespace, or the domain transferred to another registrar.
- The transfer auth code lives at **Admin console → Billing → Subscriptions → Domain
  Registration**. Registration lock (`clientTransferProhibited`) was active as of
  August 2026; an ICANN 60-day lock may apply after contact changes.
- Expiry: **2027-06-04**. Renewal through Google was 75 ₺/yr; direct Squarespace pricing
  is expected to be higher. Cloudflare Registrar sells at cost and is the cheapest
  alternative, but requires using Cloudflare nameservers.
- **If DNS ever moves**, the site breaks unless these are recreated first:
  `A @ → 185.199.108.153 / .109.153 / .110.153 / .111.153` and
  `CNAME www → deniz-bigboss.github.io`.

### Email

- Workspace was still active but planned for cancellation. Once it ends, **all
  `@terra-reform.org` mailboxes stop working**, which is why the site currently shows a
  personal Gmail address rather than `info@terra-reform.org`.
- Planned replacement: a free mail host (Zoho's free tier gives real mailboxes on a
  custom domain; Cloudflare Email Routing forwards but cannot send).
- **If branded email is restored**, the site should be switched back from the Gmail to
  `info@terra-reform.org` — all occurrences, both languages, including the JSON-LD
  `"email"` field and the `script.js` fallback message.
- Stale DNS left from Workspace: an `MX → smtp.google.com` record and an SPF
  `TXT v=spf1 include:_spf.google.com ~all`. Both are safe to remove once mail moves.

### Not recorded here

This repo is **public**, so account addresses, logins, and billing identifiers are
deliberately not stored. The registrar/domain account uses a different email from the
one published on the site — **ask the user** if you need it.

## Things to ask about rather than assume

- Changing the public contact email, or any domain/DNS/registrar configuration.
- Anything that affects the `CNAME` file or DNS records.
- Claims about the group's achievements or competition results.

# Terra Reform

The website for **Terra Reform** — an independent, student-led science and technology
initiative developing sustainable solutions through research, engineering, innovation,
and global collaboration.

🌍 **Live at [terra-reform.org](https://terra-reform.org)** · Also available in
[Turkish](https://terra-reform.org/tr/)

---

## About

Terra Reform was founded in 2022 by two students who wanted to move beyond discussing
problems and instead design, build, and test real solutions. The site presents the
group's work honestly — proposals are described as proposals, concepts as concepts.

The team has taken part in TEKNOFEST, the TÜBİTAK 2204-A High School Research Projects
Competition, CERN Beamline for Schools, the New York Academy of Sciences challenge, and
the Büyük Ankara AI & Climate Policy Workshop.

## Projects featured

| Project | Focus |
| --- | --- |
| Solar-Powered School Microgrid | Sustainability · Energy |
| Safe Explorer | Safety · Communication |
| Braille Circuits | Accessibility · Education |
| Virtual Physics Laboratory | Education · Software |
| CERN BL4S Project | Physics · Research |
| Autonomous Infantry Robot (AIR) | Robotics · Engineering |
| Battle of Verdun | Game Development · Multiplayer |

## Tech

A deliberately simple, hand-written static site:

- Plain **HTML**, a single **CSS** file, a single **JS** file
- **No framework, no build step, no dependencies**
- Hosted on **GitHub Pages** with a custom domain
- Fully **bilingual** — English at the root, Turkish under `/tr/`
- Dark theme by default with an optional light theme
- Cookieless analytics ([GoatCounter](https://www.goatcounter.com)), so no cookie banner
- Forms handled by [Formspree](https://formspree.io)

## Structure

```
index.html  about.html  programs.html  news.html
join.html   contact.html  privacy.html  404.html   ← English pages
projects/                                          ← English project pages
tr/                                                ← Turkish mirror of everything
styles.css      ← all styling
script.js       ← all behaviour
assets/         ← images, posters, logos
assets/thumbs/  ← generated 800px thumbnails (WebP + JPEG)
tools/          ← helper scripts
sitemap.xml  robots.txt  feed.xml  CNAME
```

## Running locally

The site uses root-absolute links (`/about.html`), so open it through a web server
rather than double-clicking the HTML files:

```bash
git clone https://github.com/deniz-bigboss/terra-reform-website.git
cd terra-reform-website
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Editing

**Every page exists in both English and Turkish.** Any content change must be made in
both — `about.html` *and* `tr/about.html`. A change made in only one language is a bug.

To add a news post, use the generator rather than editing by hand:

```bash
python3 tools/new-post.py \
  --date 2026-07 \
  --title "English headline" --body "English body text." \
  --title-tr "Türkçe başlık"  --body-tr "Türkçe metin."
```

It updates `news.html`, `tr/news.html`, and `feed.xml` together.

Deployment is automatic: merging to `main` publishes the site.

Further conventions — page metadata requirements, the image pipeline, SEO invariants —
are documented in [`CLAUDE.md`](CLAUDE.md).

## Contact

**[info via the site's contact page](https://terra-reform.org/contact.html)** ·
[Instagram](https://www.instagram.com/terrareform/) ·
[LinkedIn](https://www.linkedin.com/company/reform-terra/)

---

© 2026 Terra Reform. Student-led innovation for real-world challenges.

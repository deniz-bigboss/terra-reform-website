#!/usr/bin/env python3
"""Add a news post to news.html, tr/news.html, and feed.xml in one step.

Usage:
  python3 tools/new-post.py \
    --date 2026-07 \
    --title "English headline" \
    --body "English body text." \
    --title-tr "Türkçe başlık" \
    --body-tr "Türkçe metin." \
    [--link projects/some-project.html] \
    [--link-label "About the project"] [--link-label-tr "Proje hakkında"]

The post is inserted at the top of both news lists and as the first RSS item.
Run from the repository root.
"""
import argparse
import html
import re
import sys
from datetime import datetime, timezone

MONTHS_EN = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]
MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
             "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]


def article(date_label, title, body, link, label):
    a = ['          <article class="news-item reveal">',
         f'            <span class="tl-date">{date_label}</span>',
         f'            <h2>{html.escape(title)}</h2>',
         f'            <p>{html.escape(body)}</p>']
    if link:
        a.append(f'            <a href="{link}" class="text-link">{html.escape(label)} &rarr;</a>')
    a.append('          </article>\n')
    return "\n".join(a)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True, help="YYYY-MM")
    ap.add_argument("--title", required=True)
    ap.add_argument("--body", required=True)
    ap.add_argument("--title-tr", required=True)
    ap.add_argument("--body-tr", required=True)
    ap.add_argument("--link", help="root-relative path, e.g. projects/foo.html")
    ap.add_argument("--link-label", default="About the project")
    ap.add_argument("--link-label-tr", default="Proje hakkında")
    args = ap.parse_args()

    year, month = map(int, args.date.split("-"))
    slug = re.sub(r"[^a-z0-9]+", "-", args.title.lower()).strip("-")[:40]

    en = article(f"{MONTHS_EN[month-1]} {year}", args.title, args.body,
                 args.link, args.link_label)
    tr = article(f"{MONTHS_TR[month-1]} {year}", args.title_tr, args.body_tr,
                 f"../{args.link}" if args.link else None, args.link_label_tr)

    for path, block in (("news.html", en), ("tr/news.html", tr)):
        src = open(path, encoding="utf8").read()
        marker = '<div class="news-list">\n'
        if marker not in src:
            sys.exit(f"news-list marker not found in {path}")
        src = src.replace(marker, marker + "\n" + block, 1)
        open(path, "w", encoding="utf8").write(src)
        print(f"added post to {path}")

    url = f"https://terra-reform.org/{args.link}" if args.link \
        else "https://terra-reform.org/news.html"
    pub = datetime(year, month, 1, 12, tzinfo=timezone.utc)
    item = (f"  <item>\n"
            f"    <title>{html.escape(args.title)}</title>\n"
            f"    <link>{url}</link>\n"
            f'    <guid isPermaLink="false">tr-{year}-{month:02d}-{slug}</guid>\n'
            f"    <pubDate>{pub.strftime('%a, %d %b %Y %H:%M:%S GMT')}</pubDate>\n"
            f"    <description>{html.escape(args.body)}</description>\n"
            f"  </item>\n\n")
    feed = open("feed.xml", encoding="utf8").read()
    feed = feed.replace("  <item>", item + "  <item>", 1)
    open("feed.xml", "w", encoding="utf8").write(feed)
    print("added item to feed.xml")


if __name__ == "__main__":
    main()

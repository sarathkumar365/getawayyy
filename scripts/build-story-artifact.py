"""Converts STORY.md into the story-bible artifact. Handles only the markdown
this document actually uses, which is why it is 90 lines instead of a library."""
import re, sys, html

SCR = sys.argv[1]
src = open("STORY.md", encoding="utf-8").read()

def inline(t):
    t = html.escape(t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", t)
    return t

out, lines, i = [], src.split("\n"), 0
while i < len(lines):
    ln = lines[i]

    if ln.strip() == "---":
        out.append('<hr>'); i += 1; continue

    m = re.match(r"^(#{1,4})\s+(.*)$", ln)
    if m:
        lvl, txt = len(m.group(1)), m.group(2)
        # "8.1 Muskoka — the closest one" becomes a titled story card
        sm = re.match(r"^(\d+\.\d+)\s+(.+?)\s+—\s+\*(.+)\*$", txt)
        if lvl == 3 and sm:
            out.append(f'<h3 class="story"><span class="story__n">{sm.group(1)}</span>'
                       f'<span class="story__name">{inline(sm.group(2))}</span>'
                       f'<span class="story__sub">{inline(sm.group(3))}</span></h3>')
        else:
            out.append(f"<h{lvl}>{inline(txt)}</h{lvl}>")
        i += 1; continue

    # movement heading: **1 · Departure** — 18:00, dusk · 495 km
    m = re.match(r"^\*\*(\d+)\s*·\s*([^*]+)\*\*\s*(?:—\s*(.*))?$", ln)
    if m:
        meta = f'<span class="mv__meta">{inline(m.group(3))}</span>' if m.group(3) else ""
        out.append(f'<p class="mv"><span class="mv__n">{m.group(1)}</span>'
                   f'<span class="mv__t">{inline(m.group(2).strip())}</span>{meta}</p>')
        i += 1; continue

    # character line: **A** — "..."
    m = re.match(r'^\*\*(A|B)\*\*\s*—\s*(.*)$', ln)
    if m:
        who = "sun" if m.group(1) == "A" else "curse"
        body = m.group(2)
        while i + 1 < len(lines) and lines[i+1].strip() and not re.match(r'^(\*\*|>|\*|#|\||-\s|---)', lines[i+1]):
            i += 1; body += " " + lines[i].strip()
        out.append(f'<p class="say say--{who}"><span class="say__who">{m.group(1)}</span>'
                   f'<span class="say__t">{inline(body)}</span></p>')
        i += 1; continue

    if ln.startswith(">"):
        buf = []
        while i < len(lines) and lines[i].startswith(">"):
            buf.append(lines[i][1:].strip()); i += 1
        out.append(f'<p class="narrate">{inline(" ".join(buf))}</p>'); continue

    # whole-paragraph scene direction, wrapped in *...*
    if ln.startswith("*") and not ln.startswith("**"):
        buf = []
        while i < len(lines) and lines[i].strip():
            buf.append(lines[i].strip()); i += 1
        t = " ".join(buf).strip()
        if t.startswith("*") and t.endswith("*"):
            t = t[1:-1]
        out.append(f'<p class="direct">{inline(t)}</p>'); continue

    if ln.startswith("|"):
        rows = []
        while i < len(lines) and lines[i].startswith("|"):
            rows.append(lines[i]); i += 1
        cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
        cells = [c for c in cells if not all(set(x) <= set("-: ") for x in c)]
        head, body = cells[0], cells[1:]
        t = ['<div class="tw"><table><thead><tr>' +
             "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>"]
        for r in body:
            t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
        t.append("</tbody></table></div>")
        out.append("".join(t)); continue

    if re.match(r"^-\s+", ln):
        items = []
        while i < len(lines) and re.match(r"^-\s+", lines[i]):
            it = re.sub(r"^-\s+", "", lines[i]); i += 1
            while i < len(lines) and lines[i].startswith("  ") and lines[i].strip():
                it += " " + lines[i].strip(); i += 1
            items.append(it)
        out.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ul>")
        continue

    if ln.strip():
        buf = [ln.strip()]           # always consume the current line
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(\*\*\d|>|#|\||-\s|---)', lines[i]):
            buf.append(lines[i].strip()); i += 1
        out.append(f"<p>{inline(' '.join(buf))}</p>"); continue

    i += 1

body_html = "\n".join(out)
# drop the duplicated H1 title line
body_html = re.sub(r"<h1>.*?</h1>", "", body_html, count=1)
open(f"{SCR}/story-body.html", "w", encoding="utf-8").write(body_html)
print(f"converted {len(src.split())} words -> {len(body_html)} bytes of html")

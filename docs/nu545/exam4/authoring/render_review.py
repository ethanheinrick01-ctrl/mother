"""Render the complete bank for personal review into an explicitly private directory."""
from pathlib import Path
import argparse, html, json

a = argparse.ArgumentParser()
a.add_argument('private_directory', type=Path)
args = a.parse_args()
root = Path(__file__).resolve().parents[4]
destination = args.private_directory.resolve()
if destination == root or root in destination.parents:
    raise SystemExit('Review output must stay outside the repository.')
destination.mkdir(parents=True, exist_ok=True)
bank = json.loads(Path(__file__).with_name('bank.json').read_text())
E = html.escape
page = '''<!doctype html><html lang="en"><meta charset="utf-8">
<title>Private Exam 4 editorial review</title><style>
body{font:18px/1.5 Arial;background:#f2f4f7;color:#111;max-width:1000px;margin:40px auto}
article{padding:25px;margin:20px 0;border:1px solid #999;background:white}
li{margin:10px}pre{white-space:pre-wrap;font-size:14px}.key{color:#07542a;font-weight:bold}
</style><h1>Exam 4 full personal editorial review</h1>
<p>133 originals. Personal editorial and separate source passes; no independent reviewer.</p>'''
for n, i in enumerate(bank, 1):
    page += f'<article id="{i["id"]}"><h2>{n}. {i["id"]} · {i["pool"]} · {i["c"]}</h2><p class="stem">{E(i["q"])}</p><ol>'
    for o in i['o']:
        page += f'<li><span class="{"key" if o["ok"] else "choice"}">{E(o["t"])}{" [KEY]" if o["ok"] else ""}</span><p>{E(o["w"])}</p></li>'
    page += '</ol><p>' + E('Sources: ' + ', '.join(i['s'])) + '</p><p>' + E('Decision: ' + i['decision']) + '</p><details><summary>Exact source excerpt</summary><pre>' + E(i['evidenceExcerpt']) + '</pre></details></article>'
(destination / 'editorial-review.html').write_text(page + '</html>')
(destination / 'editorial-data.json').write_text(json.dumps(bank, indent=2))
print('Rendered', len(bank), 'originals outside the repository.')

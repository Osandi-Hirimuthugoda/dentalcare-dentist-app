"""
Post-process pytest-html report to inject summary cards.
Run: python generate_report.py reports/report.html [flutter_results.json]
"""
import sys
import re
import json
from pathlib import Path

STYLE = """
<style id="dc-inject-style">
body { background: #f1f5f9 !important; color: #1e293b !important; }
#results-table thead tr { background: #0d9488 !important; }
#results-table thead th { color: #fff !important; }
#results-table tbody tr { background: #fff !important; }
#results-table tbody tr:hover { background: #f0fdfa !important; }
#results-table, #environment { background: #fff !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; }
h1 { background: linear-gradient(135deg,#0d9488,#0f766e) !important; color: #fff !important; }
div.log { background: #f8fafc !important; color: #334155 !important; border: 1px solid #e2e8f0 !important; }
</style>
"""

def build_cards(web_passed, web_total, fl_passed, fl_total):
    fl_pct = round(fl_passed / fl_total * 100) if fl_total else 0
    return f"""
<div id="dc-cards" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;margin:20px 0;font-family:'Segoe UI',system-ui,sans-serif">
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,.05)">
    <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:6px">Total Tests</div>
    <div style="font-size:2rem;font-weight:800;color:#0d9488">{web_total + fl_total}</div>
    <div style="font-size:0.75rem;color:#94a3b8">web + mobile</div>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,.05)">
    <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:6px">🌐 Web (Selenium)</div>
    <div style="font-size:2rem;font-weight:800;color:#16a34a">{web_passed}</div>
    <div style="font-size:0.75rem;color:#94a3b8">UI automation tests</div>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,.05)">
    <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:6px">📱 Mobile (Flutter)</div>
    <div style="font-size:2rem;font-weight:800;color:#7c3aed">{fl_passed}/{fl_total}</div>
    <div style="font-size:0.75rem;color:#94a3b8">{fl_pct}% pass rate</div>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,.05)">
    <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:6px">Pass Rate</div>
    <canvas id="dc-pie" width="60" height="60" style="float:right;margin-top:-8px"></canvas>
    <div style="font-size:2rem;font-weight:800;color:#0d9488" id="dc-pct">-</div>
    <div style="font-size:0.75rem;color:#94a3b8">overall</div>
  </div>
</div>
<script>
(function(){{
  var wt={web_total}, wp={web_passed}, ft={fl_total}, fp={fl_passed};
  var total=wt+ft, passed=wp+fp;
  var pct=total>0?Math.round(passed/total*100):0;
  document.getElementById('dc-pct').textContent=pct+'%';
  var c=document.getElementById('dc-pie'),ctx=c.getContext('2d');
  var r=28,cx=30,cy=30,a=total>0?(passed/total)*2*Math.PI:0;
  ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.fillStyle='#fee2e2';ctx.fill();
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+a);ctx.closePath();ctx.fillStyle='#16a34a';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,16,0,2*Math.PI);ctx.fillStyle='#fff';ctx.fill();
}})();
</script>
"""


def inject(html_path: str, flutter_path: str = None):
    path = Path(html_path)
    content = path.read_text(encoding="utf-8")

    # Remove ALL previous injections
    content = re.sub(r'<style id="dc-inject-style">.*?</style>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div id="dc-cards".*?</script>\s*', '', content, flags=re.DOTALL)

    # Get flutter results
    fl_passed = fl_total = 0
    if flutter_path and Path(flutter_path).exists():
        fl = json.loads(Path(flutter_path).read_text())
        fl_passed = fl.get("passed", 0)
        fl_total  = fl.get("total", 0)

    # Get web test count from run-count paragraph
    m = re.search(r'<p class="run-count">(\d+) tests', content)
    web_total = int(m.group(1)) if m else 0

    # Get web passed from filter spans
    mp = re.search(r'<span class="passed">(\d+) Passed', content)
    web_passed = int(mp.group(1)) if mp else web_total

    cards = build_cards(web_passed, web_total, fl_passed, fl_total)

    # Inject before Summary h2
    marker = "<h2>Summary</h2>"
    if marker in content:
        content = content.replace(marker, STYLE + cards + marker, 1)
    else:
        content = content.replace("<body>", "<body>" + STYLE + cards, 1)

    path.write_text(content, encoding="utf-8")
    print(f"Report enhanced: {html_path} (web:{web_passed}/{web_total} flutter:{fl_passed}/{fl_total})")


if __name__ == "__main__":
    target  = sys.argv[1] if len(sys.argv) > 1 else "reports/report.html"
    flutter = sys.argv[2] if len(sys.argv) > 2 else "reports/flutter_results.json"
    inject(target, flutter)

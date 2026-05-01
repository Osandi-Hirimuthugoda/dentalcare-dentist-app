"""
Build a beautiful standalone HTML dashboard from pytest JSON report.
Usage: python build_dashboard.py .report.json reports/dashboard.html [flutter_results.json]
"""
import json, sys, re
from pathlib import Path
from datetime import datetime

def build(json_path, out_path, flutter_path=None, fe_unit_path=None, be_unit_path=None):
    data = json.loads(Path(json_path).read_text())
    summary = data.get("summary", {})
    tests   = data.get("tests", [])

    total   = summary.get("total", 0)
    passed  = summary.get("passed", 0)
    failed  = summary.get("failed", 0) + summary.get("error", 0)
    skipped = summary.get("skipped", 0)
    duration = round(data.get("duration", 0), 2)
    pass_pct = round(passed / total * 100) if total else 0
    generated = datetime.now().strftime("%d %b %Y, %H:%M")

    # Flutter/Mobile test results
    fl_passed = fl_failed = fl_total = fl_dur = 0
    if flutter_path and Path(flutter_path).exists():
        fl = json.loads(Path(flutter_path).read_text())
        fl_passed = fl.get("passed", 0)
        fl_failed = fl.get("failed", 0)
        fl_total  = fl.get("total", 0)
        fl_dur    = fl.get("duration", 0)

    # Frontend unit test results
    fe_passed = fe_total = 0
    if fe_unit_path and Path(fe_unit_path).exists():
        fe = json.loads(Path(fe_unit_path).read_text())
        fe_passed = fe.get("passed", 0)
        fe_total  = fe.get("total", 0)

    # Backend unit test results
    be_passed = be_total = 0
    if be_unit_path and Path(be_unit_path).exists():
        be = json.loads(Path(be_unit_path).read_text())
        be_passed = be.get("passed", 0)
        be_total  = be.get("total", 0)

    grand_total  = total + fl_total + fe_total + be_total
    grand_passed = passed + fl_passed + fe_passed + be_passed
    grand_failed = failed + fl_failed
    grand_pct    = round(grand_passed / grand_total * 100) if grand_total else 0

    # Group by module
    modules = {}
    for t in tests:
        node = t.get("nodeid", "")
        m = re.search(r"test_cases[/\\](test_[^/:]+)", node)
        mod = m.group(1).replace("test_","").replace("_"," ").title() if m else "Other"
        if mod not in modules:
            modules[mod] = {"passed":0,"failed":0,"tests":[]}
        outcome = t.get("outcome","")
        if outcome == "passed":
            modules[mod]["passed"] += 1
        else:
            modules[mod]["failed"] += 1
        modules[mod]["tests"].append(t)

    # Build test rows
    rows_html = ""
    for t in tests:
        node     = t.get("nodeid","")
        outcome  = t.get("outcome","passed")
        dur      = round(t.get("duration", 0), 3)
        cls_name = node.split("::")[-2] if "::" in node else ""
        fn_name  = node.split("::")[-1] if "::" in node else node
        badge    = f'<span class="badge badge-{outcome}">{outcome.upper()}</span>'
        log_raw  = ""
        if "call" in t and t["call"].get("log"):
            for entry in t["call"]["log"]:
                log_raw += f'<div class="log-line log-{entry.get("levelname","INFO").lower()}">' \
                           f'<span class="log-level">{entry.get("levelname","INFO")}</span> ' \
                           f'{entry.get("message","")}</div>'
        log_section = f'<div class="log-block">{log_raw}</div>' if log_raw else \
                      '<div class="log-block log-empty">No log output captured.</div>'
        
        # Link failure screenshot if present
        screenshot_html = ""
        if t.get("screenshot"):
            ss_path = t["screenshot"].replace("reports/", "") # Rel path for HTML
            screenshot_html = f'<div class="screenshot-link"><a href="{ss_path}" target="_blank">📷 View Failure Screenshot</a></div>'
        
        rows_html += f"""
        <tr class="test-row {outcome}" onclick="toggleLog(this)">
          <td>{badge}</td>
          <td class="test-name"><span class="cls">{cls_name}</span><span class="fn">{fn_name}</span></td>
          <td class="dur">{dur}s</td>
        </tr>
        <tr class="log-row hidden"><td colspan="3">{screenshot_html}{log_section}</td></tr>"""

    # Module bars
    mod_bars = ""
    max_c = max((v["passed"]+v["failed"] for v in modules.values()), default=1)
    for mod, v in sorted(modules.items()):
        tc = v["passed"] + v["failed"]
        pct = round(tc / max_c * 100)
        has_fail = v["failed"] > 0
        bar_cls = "bar-fail" if has_fail else "bar-pass"
        mod_bars += f"""
        <div class="mod-row">
          <span class="mod-name">{mod}</span>
          <div class="mod-bar-wrap"><div class="mod-bar {bar_cls}" style="width:{pct}%"></div></div>
          <span class="mod-count {'fail-text' if has_fail else 'pass-text'}">{v['passed']}/{tc}</span>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DentalCare+ Test Report</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',system-ui,sans-serif;background:#f1f5f9;color:#1e293b;min-height:100vh}}
a{{color:#0891b2}}

/* Sidebar */
.sidebar{{position:fixed;left:0;top:0;bottom:0;width:220px;background:#ffffff;border-right:1px solid #e2e8f0;padding:24px 0;display:flex;flex-direction:column;gap:4px;z-index:10}}
.sidebar-logo{{padding:0 20px 20px;font-size:1.1rem;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:8px;border-bottom:1px solid #f1f5f9;margin-bottom:8px}}
.sidebar-logo span{{color:#0d9488}}
.nav-item{{padding:10px 20px;font-size:0.85rem;color:#64748b;cursor:pointer;border-radius:0 8px 8px 0;margin-right:12px;display:flex;align-items:center;gap:8px;transition:all .15s}}
.nav-item.active,.nav-item:hover{{background:#f0fdfa;color:#0d9488;font-weight:600}}
.nav-item .dot{{width:8px;height:8px;border-radius:50%;background:#0d9488}}
.nav-item .dot.fail{{background:#ef4444}}

/* Main */
.main{{margin-left:220px;padding:32px;min-height:100vh}}
.page-title{{font-size:1.5rem;font-weight:700;color:#0f172a;margin-bottom:4px}}
.page-sub{{font-size:0.85rem;color:#94a3b8;margin-bottom:28px}}

/* Stat cards */
.stats{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}}
.stat-card{{background:#ffffff;border-radius:14px;padding:20px 22px;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.stat-card .s-label{{font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:8px}}
.stat-card .s-value{{font-size:2.2rem;font-weight:800;line-height:1}}
.stat-card .s-sub{{font-size:0.78rem;color:#94a3b8;margin-top:4px}}
.stat-card.pass .s-value{{color:#16a34a}}
.stat-card.fail .s-value{{color:#dc2626}}
.stat-card.total .s-value{{color:#0d9488}}
.stat-card.time .s-value{{color:#7c3aed;font-size:1.6rem}}

/* Charts row */
.charts-row{{display:grid;grid-template-columns:280px 1fr;gap:16px;margin-bottom:28px}}
.chart-card{{background:#ffffff;border-radius:14px;padding:22px;border:1px solid #e2e8f0;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.chart-card h3{{font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:16px}}
.pie-wrap{{display:flex;flex-direction:column;align-items:center;gap:14px}}
.pie-legend{{display:flex;gap:20px;font-size:0.82rem;color:#64748b}}
.pie-legend span{{display:flex;align-items:center;gap:6px}}
.pie-legend .dot{{width:10px;height:10px;border-radius:50%}}

/* Module bars */
.mod-row{{display:flex;align-items:center;gap:12px;margin-bottom:10px}}
.mod-name{{width:160px;font-size:0.83rem;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.mod-bar-wrap{{flex:1;background:#f1f5f9;border-radius:6px;height:10px;overflow:hidden}}
.mod-bar{{height:100%;border-radius:6px;transition:width .4s}}
.mod-bar.bar-pass{{background:linear-gradient(90deg,#0d9488,#16a34a)}}
.mod-bar.bar-fail{{background:linear-gradient(90deg,#dc2626,#f97316)}}
.mod-count{{width:50px;text-align:right;font-size:0.78rem}}
.pass-text{{color:#16a34a}}
.fail-text{{color:#dc2626}}

/* Results table */
.results-card{{background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.results-card h3{{font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;padding:18px 22px;border-bottom:1px solid #f1f5f9}}
table{{width:100%;border-collapse:collapse}}
thead th{{background:#f8fafc;padding:11px 16px;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;text-align:left;border-bottom:1px solid #e2e8f0}}
.test-row td{{padding:11px 16px;border-bottom:1px solid #f8fafc;cursor:pointer;transition:background .1s;color:#374151}}
.test-row:hover td{{background:#f0fdfa}}
.test-row.passed td{{border-left:3px solid #16a34a}}
.test-row.failed td,.test-row.error td{{border-left:3px solid #dc2626}}
.test-name{{display:flex;flex-direction:column;gap:2px}}
.cls{{font-size:0.72rem;color:#94a3b8}}
.fn{{font-size:0.85rem;color:#1e293b;font-weight:500}}
.dur{{font-size:0.8rem;color:#94a3b8;white-space:nowrap}}

/* Badges */
.badge{{padding:3px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;letter-spacing:.5px}}
.badge-passed{{background:#dcfce7;color:#16a34a}}
.badge-failed,.badge-error{{background:#fee2e2;color:#dc2626}}
.badge-skipped{{background:#dbeafe;color:#2563eb}}

/* Log */
.log-row{{display:none}}
.log-row.visible{{display:table-row}}
.log-block{{background:#f8fafc;padding:14px 18px;font-family:'Cascadia Code','Fira Code',monospace;font-size:0.78rem;line-height:1.7;border-top:1px solid #e2e8f0;color:#334155}}
.log-block.log-empty{{color:#94a3b8;font-style:italic}}
.log-line{{margin-bottom:2px}}
.log-level{{font-weight:700;margin-right:8px}}
.log-line.log-info .log-level{{color:#0d9488}}
.log-line.log-warning .log-level{{color:#d97706}}
.log-line.log-error .log-level{{color:#dc2626}}

/* Footer */
.footer{{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:0.78rem;color:#cbd5e1;text-align:center}}
</style>
</head>
<body>

<div class="sidebar">
  <div class="sidebar-logo">🦷 <span>DentalCare+</span></div>
  <div class="nav-item active"><span class="dot"></span> Test Results</div>
  <div class="nav-item"><span class="dot {'fail' if failed > 0 else ''}"></span> Web: {passed}/{total}</div>
  <div class="nav-item"><span class="dot {'fail' if fl_failed > 0 else ''}"></span> Mobile: {fl_passed}/{fl_total}</div>
  <div class="nav-item"><span class="dot" style="background:#a78bfa"></span> {len(modules)} Modules</div>
</div>

<div class="main">
  <div class="page-title">Automation Test Report</div>
  <div class="page-sub">Generated {generated} &nbsp;·&nbsp; Web (Selenium) + Mobile (Flutter) &nbsp;·&nbsp; Docker Environment</div>

  <!-- Grand Total Stats -->
  <div class="stats">
    <div class="stat-card total">
      <div class="s-label">Total Tests</div>
      <div class="s-value">{grand_total}</div>
      <div class="s-sub">web + mobile</div>
    </div>
    <div class="stat-card pass">
      <div class="s-label">Passed</div>
      <div class="s-value">{grand_passed}</div>
      <div class="s-sub">{grand_pct}% pass rate</div>
    </div>
    <div class="stat-card fail">
      <div class="s-label">Failed</div>
      <div class="s-value">{grand_failed}</div>
      <div class="s-sub">{100-grand_pct}% fail rate</div>
    </div>
    <div class="stat-card time">
      <div class="s-label">Duration</div>
      <div class="s-value">{duration}s</div>
      <div class="s-sub">web test time</div>
    </div>
  </div>

  <!-- Web vs Mobile breakdown -->
  <div class="charts-row" style="grid-template-columns:1fr 1fr 1fr 1fr;margin-bottom:16px">
    <div class="chart-card" style="display:flex;align-items:center;gap:16px;padding:14px 18px">
      <div style="font-size:1.8rem">🌐</div>
      <div>
        <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:3px">Web UI (Selenium)</div>
        <div style="font-size:1.5rem;font-weight:800;color:#0d9488">{passed}<span style="font-size:0.9rem;color:#94a3b8">/{total}</span></div>
        <div style="font-size:0.72rem;color:#94a3b8">E2E automation</div>
      </div>
    </div>
    <div class="chart-card" style="display:flex;align-items:center;gap:16px;padding:14px 18px">
      <div style="font-size:1.8rem">⚛️</div>
      <div>
        <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:3px">Frontend Unit (Jest)</div>
        <div style="font-size:1.5rem;font-weight:800;color:#0891b2">{fe_passed}<span style="font-size:0.9rem;color:#94a3b8">/{fe_total}</span></div>
        <div style="font-size:0.72rem;color:#94a3b8">helpers + constants</div>
      </div>
    </div>
    <div class="chart-card" style="display:flex;align-items:center;gap:16px;padding:14px 18px">
      <div style="font-size:1.8rem">🔧</div>
      <div>
        <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:3px">Backend Unit (Jest)</div>
        <div style="font-size:1.5rem;font-weight:800;color:#d97706">{be_passed}<span style="font-size:0.9rem;color:#94a3b8">/{be_total}</span></div>
        <div style="font-size:0.72rem;color:#94a3b8">auth + validation</div>
      </div>
    </div>
    <div class="chart-card" style="display:flex;align-items:center;gap:16px;padding:14px 18px">
      <div style="font-size:1.8rem">📱</div>
      <div>
        <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;margin-bottom:3px">Mobile (Flutter)</div>
        <div style="font-size:1.5rem;font-weight:800;color:#7c3aed">{fl_passed}<span style="font-size:0.9rem;color:#94a3b8">/{fl_total}</span></div>
        <div style="font-size:0.72rem;color:#94a3b8">unit + widget tests</div>
      </div>
    </div>
  </div>

  <div class="charts-row">
    <div class="chart-card">
      <h3>Pass Rate</h3>
      <div class="pie-wrap">
        <canvas id="pie" width="160" height="160"></canvas>
        <div class="pie-legend">
          <span><span class="dot" style="background:#4ade80"></span>Pass ({grand_passed})</span>
          <span><span class="dot" style="background:#f87171"></span>Fail ({grand_failed})</span>
        </div>
      </div>
    </div>
    <div class="chart-card">
      <h3>Coverage by Module</h3>
      {mod_bars}
    </div>
  </div>

  <div class="results-card">
    <h3>Test Results &nbsp;<span style="color:#475569;font-weight:400;text-transform:none;letter-spacing:0">— click a row to expand logs</span></h3>
    <table>
      <thead><tr><th style="width:90px">Status</th><th>Test</th><th style="width:80px">Duration</th></tr></thead>
      <tbody>{rows_html}</tbody>
    </table>
  </div>

  <div class="footer">DentalCare+ &nbsp;·&nbsp; Automated UI Test Suite &nbsp;·&nbsp; pytest {data.get('created','')}</div>
</div>

<script>
function toggleLog(row) {{
  var next = row.nextElementSibling;
  if (next && next.classList.contains('log-row')) {{
    next.classList.toggle('visible');
    next.style.display = next.classList.contains('visible') ? 'table-row' : 'none';
  }}
}}

// Pie chart
(function() {{
  var canvas = document.getElementById('pie');
  var ctx = canvas.getContext('2d');
  var cx=80, cy=80, r=68;
  var passed={grand_passed}, total={grand_total};
  var passAngle = total > 0 ? (passed/total)*2*Math.PI : 0;

  // Fail slice
  ctx.beginPath(); ctx.moveTo(cx,cy);
  ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+2*Math.PI);
  ctx.closePath(); ctx.fillStyle='#f87171'; ctx.fill();

  // Pass slice
  ctx.beginPath(); ctx.moveTo(cx,cy);
  ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+passAngle);
  ctx.closePath(); ctx.fillStyle='#4ade80'; ctx.fill();

  // Center hole
  ctx.beginPath(); ctx.arc(cx,cy,42,0,2*Math.PI);
  ctx.fillStyle='#ffffff'; ctx.fill();

  // Text
  ctx.fillStyle='#0f172a'; ctx.font='bold 22px Segoe UI';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('{grand_pct}%', cx, cy-8);
  ctx.font='12px Segoe UI'; ctx.fillStyle='#64748b';
  ctx.fillText('pass rate', cx, cy+14);
}})();
</script>
</body>
</html>"""

    Path(out_path).write_text(html, encoding="utf-8")
    print(f"Dashboard: {out_path}")

if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv)>1 else ".report.json",
          sys.argv[2] if len(sys.argv)>2 else "reports/dashboard.html",
          sys.argv[3] if len(sys.argv)>3 else "reports/flutter_results.json",
          sys.argv[4] if len(sys.argv)>4 else "reports/frontend_unit_results.json",
          sys.argv[5] if len(sys.argv)>5 else "reports/backend_unit_results.json")

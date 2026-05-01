import re
from pathlib import Path

path = Path("tests/reports/report.html")
content = path.read_text(encoding="utf-8")

# Remove injected style
content = re.sub(r'<style id="dc-inject-style">.*?</style>', '', content, flags=re.DOTALL)

# Remove injected cards
content = re.sub(r'<div id="dc-cards".*?</script>\s*', '', content, flags=re.DOTALL)

path.write_text(content, encoding="utf-8")
print("Cleaned.")

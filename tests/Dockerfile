FROM python:3.11-slim

WORKDIR /tests

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "python -B -m pytest test_cases/ --json-report --json-report-file=.report.json && python build_dashboard.py .report.json reports/dashboard.html reports/flutter_results.json reports/frontend_unit_results.json reports/backend_unit_results.json && python generate_report.py reports/report.html reports/flutter_results.json"]

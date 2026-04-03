FROM python:3.11-slim

WORKDIR /tests

# Install test dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy test files
COPY . .

CMD ["python", "-m", "pytest", "test_cases/", "-v", "--tb=short", "--html=reports/report.html", "--self-contained-html"]

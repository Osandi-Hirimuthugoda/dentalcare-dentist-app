# DentalCare+ AI Model (Flask + PyTorch)
FROM python:3.11-slim

WORKDIR /app

# Install system deps (minimal for PyTorch CPU)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .

# Install CPU-only PyTorch first (smaller image), then rest of requirements
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir Pillow flask flask-cors numpy

# Copy application code
COPY . .

# Create uploads folder (used if saving files)
RUN mkdir -p uploads

# Model weights (model_weights.pth) must be present at build or mounted at run
# Place model_weights.pth in this directory before building, or use a volume

EXPOSE 5000

# Health check (Flask /health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/health')" || exit 1

CMD ["python", "flask_api.py"]

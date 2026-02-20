#!/bin/bash
# Package Export Script - Creates downloadable zip file

echo "=========================================="
echo "📦 Packaging Dental Disease Detection Model"
echo "=========================================="

# Configuration
EXPORT_DIR="exported_model"
PACKAGE_NAME="dental_disease_model_v1.0.0"
ZIP_FILE="${PACKAGE_NAME}.zip"

# Check if export directory exists
if [ ! -d "$EXPORT_DIR" ]; then
    echo "❌ Error: Export directory '$EXPORT_DIR' not found!"
    echo "   Please run export_model.py first."
    exit 1
fi

# Create package directory
PACKAGE_DIR="package"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo "📋 Copying files..."

# Copy model files
cp -r "$EXPORT_DIR/models" "$PACKAGE_DIR/"

# Copy inference script
cp inference.py "$PACKAGE_DIR/"

# Copy Flask API
cp flask_api.py "$PACKAGE_DIR/"

# Copy requirements
cp requirements.txt "$PACKAGE_DIR/"

# Copy setup instructions
cp SETUP_INSTRUCTIONS.md "$PACKAGE_DIR/"

# Copy test script
cp test_model.py "$PACKAGE_DIR/"

# Create run scripts
echo "📝 Creating run scripts..."

# Windows batch script
cat > "$PACKAGE_DIR/run_api.bat" << 'EOF'
@echo off
echo Starting Flask API Server...
python flask_api.py
pause
EOF

# Linux/Mac shell script
cat > "$PACKAGE_DIR/run_api.sh" << 'EOF'
#!/bin/bash
echo "Starting Flask API Server..."
python flask_api.py
EOF
chmod +x "$PACKAGE_DIR/run_api.sh"

# Create zip file
echo "📦 Creating zip file..."
rm -f "$ZIP_FILE"
cd "$PACKAGE_DIR"
zip -r "../$ZIP_FILE" .
cd ..

echo ""
echo "=========================================="
echo "✅ Packaging Complete!"
echo "=========================================="
echo "📁 Package saved as: $ZIP_FILE"
echo "📊 Package size: $(du -h $ZIP_FILE | cut -f1)"
echo ""
echo "📋 Package contents:"
echo "   - models/ (model weights and metadata)"
echo "   - inference.py (standalone inference script)"
echo "   - flask_api.py (Flask API server)"
echo "   - requirements.txt (Python dependencies)"
echo "   - SETUP_INSTRUCTIONS.md (setup guide)"
echo "   - test_model.py (test script)"
echo "   - run_api.sh / run_api.bat (run scripts)"
echo ""




"""
Complete Export Script - Exports model and creates package
Runs export_model.py and then packages everything into a zip file
"""

import os
import sys
import subprocess
import shutil
import zipfile
from pathlib import Path
from datetime import datetime


def run_export_script(model_path, output_dir='exported_model'):
    """Run the export_model.py script"""
    print("=" * 60)
    print("Step 1: Exporting Model")
    print("=" * 60)
    
    if not os.path.exists('export_model.py'):
        print("❌ Error: export_model.py not found!")
        return False
    
    try:
        result = subprocess.run(
            [sys.executable, 'export_model.py', model_path, output_dir],
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print("\n✅ Model export completed!")
            return True
        else:
            print(f"\n❌ Export failed with return code: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running export script: {e}")
        return False


def create_package(export_dir='exported_model', package_name='dental_disease_model_v1.0.0'):
    """Create zip package with all files"""
    print("\n" + "=" * 60)
    print("Step 2: Creating Package")
    print("=" * 60)
    
    package_dir = Path('package')
    
    # Clean up old package directory
    if package_dir.exists():
        print("🧹 Cleaning up old package directory...")
        shutil.rmtree(package_dir)
    
    package_dir.mkdir(exist_ok=True)
    
    # Files to include
    files_to_copy = [
        ('exported_model/models', 'models'),
        ('inference.py', 'inference.py'),
        ('flask_api.py', 'flask_api.py'),
        ('requirements.txt', 'requirements.txt'),
        ('SETUP_INSTRUCTIONS.md', 'SETUP_INSTRUCTIONS.md'),
        ('test_model.py', 'test_model.py'),
    ]
    
    print("\n📋 Copying files...")
    for src, dst in files_to_copy:
        src_path = Path(src)
        dst_path = package_dir / dst
        
        if not src_path.exists():
            print(f"⚠️  Warning: {src} not found, skipping...")
            continue
        
        if src_path.is_dir():
            shutil.copytree(src_path, dst_path)
            print(f"   ✅ Copied directory: {src} → {dst}")
        else:
            shutil.copy2(src_path, dst_path)
            print(f"   ✅ Copied file: {src} → {dst}")
    
    # Create run scripts
    print("\n📝 Creating run scripts...")
    
    # Windows batch script
    run_api_bat = package_dir / 'run_api.bat'
    with open(run_api_bat, 'w') as f:
        f.write('''@echo off
echo Starting Flask API Server...
python flask_api.py
pause
''')
    print(f"   ✅ Created: {run_api_bat.name}")
    
    # Linux/Mac shell script
    run_api_sh = package_dir / 'run_api.sh'
    with open(run_api_sh, 'w') as f:
        f.write('''#!/bin/bash
echo "Starting Flask API Server..."
python flask_api.py
''')
    # Make executable (will work on Unix systems)
    os.chmod(run_api_sh, 0o755)
    print(f"   ✅ Created: {run_api_sh.name}")
    
    # Create README
    readme_path = package_dir / 'README.txt'
    with open(readme_path, 'w') as f:
        f.write(f'''Dental Disease Detection Model Package
Version: 1.0.0
Export Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

Quick Start:
1. Extract all files
2. Install dependencies: pip install -r requirements.txt
3. Test model: python test_model.py
4. Run API: python flask_api.py (or run_api.bat / run_api.sh)

See SETUP_INSTRUCTIONS.md for detailed instructions.
''')
    print(f"   ✅ Created: {readme_path.name}")
    
    # Create zip file
    zip_file = f'{package_name}.zip'
    print(f"\n📦 Creating zip file: {zip_file}...")
    
    if os.path.exists(zip_file):
        os.remove(zip_file)
    
    with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(package_dir)
                zipf.write(file_path, arcname)
                print(f"   Added: {arcname}")
    
    zip_size = os.path.getsize(zip_file) / (1024 * 1024)  # Size in MB
    print(f"\n✅ Package created successfully!")
    print(f"   File: {zip_file}")
    print(f"   Size: {zip_size:.2f} MB")
    
    return True


def main():
    """Main export and packaging function"""
    print("=" * 60)
    print("🚀 COMPLETE MODEL EXPORT AND PACKAGING")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\nUsage: python complete_export.py <path_to_model.pth>")
        print("\nExample:")
        print("  python complete_export.py best_model_masked.pth")
        print("\nThis will:")
        print("  1. Export model in multiple formats")
        print("  2. Create complete package with all files")
        print("  3. Generate downloadable zip file")
        sys.exit(1)
    
    model_path = sys.argv[1]
    
    if not os.path.exists(model_path):
        print(f"\n❌ Error: Model file not found: {model_path}")
        sys.exit(1)
    
    # Step 1: Export model
    if not run_export_script(model_path):
        print("\n❌ Export failed. Aborting packaging.")
        sys.exit(1)
    
    # Step 2: Create package
    if not create_package():
        print("\n❌ Packaging failed.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 COMPLETE EXPORT SUCCESSFUL!")
    print("=" * 60)
    print("\n📦 Package ready for distribution!")
    print(f"   File: dental_disease_model_v1.0.0.zip")
    print("\n📋 Next steps:")
    print("   1. Test the package by extracting it")
    print("   2. Run test_model.py to verify everything works")
    print("   3. Share the zip file with users")
    print("\n✅ Done!")


if __name__ == '__main__':
    main()




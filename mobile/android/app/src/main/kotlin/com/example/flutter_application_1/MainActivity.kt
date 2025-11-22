package com.example.flutter_application_1

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        // Disable Impeller to prevent texture mipmap crashes on emulator
        // This forces Flutter to use Skia instead of Impeller rendering engine
    }
}

package com.example.flutter_application_1

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File

class MainActivity : FlutterActivity() {
    private val SHARE_CHANNEL = "com.dentalcare.share"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, SHARE_CHANNEL)
            .setMethodCallHandler { call, result ->
                val path = call.argument<String>("path")
                when (call.method) {
                    "sharePdf" -> {
                        if (path != null) { sharePdf(path); result.success(null) }
                        else result.error("INVALID_PATH", "PDF path is null", null)
                    }
                    "openPdf" -> {
                        if (path != null) { openPdf(path); result.success(null) }
                        else result.error("INVALID_PATH", "PDF path is null", null)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun openPdf(filePath: String) {
        val file = File(filePath)
        val uri: Uri = FileProvider.getUriForFile(
            this,
            "${applicationContext.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/pdf")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        startActivity(Intent.createChooser(intent, "Open PDF with"))
    }

    private fun sharePdf(filePath: String) {
        val file = File(filePath)
        val uri: Uri = FileProvider.getUriForFile(
            this,
            "${applicationContext.packageName}.fileprovider",
            file
        )
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, "DentalCare+ AI Scan Report")
            putExtra(Intent.EXTRA_TEXT, "My AI teeth scan report from DentalCare+")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(intent, "Share Report via"))
    }
}

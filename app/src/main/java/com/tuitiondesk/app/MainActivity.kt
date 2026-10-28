package com.tuitiondesk.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            webViewClient = WebViewClient()
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                loadWithOverviewMode = true
                useWideViewPort = true
            }
        }

        setContentView(webView)
        // Load the TuitionDesk application
        webView.loadUrl("https://ais-dev-hnmgirzsn4liu7gtohdadl-785644140620.asia-northeast1.run.app")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

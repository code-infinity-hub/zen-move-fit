package com.zen_move_fit.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebSettings webSettings = this.bridge.getWebView().getSettings();
    webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

    this.bridge.getWebView().setBackgroundColor(Color.parseColor("#0E1115"));
  };
};
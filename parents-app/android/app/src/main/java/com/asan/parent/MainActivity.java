package com.asan.parent;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.WebView;
import com.getcapacitor.WebViewListener;
import android.provider.Settings;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.parents.app.SessionVaultPlugin;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 123;
    private boolean splashContentReady = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        final long splashStarted = SystemClock.uptimeMillis();
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        splash.setKeepOnScreenCondition(() -> !splashContentReady && SystemClock.uptimeMillis() - splashStarted < 8000);
        splash.setOnExitAnimationListener(provider -> provider.remove());
        // Register before BridgeActivity creates the JavaScript/native bridge.
        registerPlugin(SessionVaultPlugin.class);
        registerPlugin(InvoiceFilesPlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.enableEdgeToEdge(getWindow());
        SafeWindowInsets.install((android.view.View) getBridge().getWebView().getParent());
        // SafeWindowInsets owns native bar, cutout and keyboard padding.
        // Capacitor SystemBars inset handling is disabled in capacitor.config.json.
        // Keep the normal viewport; do not duplicate native padding in the webpage.
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
                .setAppearanceLightStatusBars(true);
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
                .setAppearanceLightNavigationBars(true);
        getBridge().addWebViewListener(new WebViewListener() {
            @Override public void onPageLoaded(WebView webView) { splashContentReady = true; }
            @Override public void onReceivedError(WebView webView) { splashContentReady = true; }
            @Override public void onReceivedHttpError(WebView webView) { splashContentReady = true; }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        // Strict check: every time the app comes to foreground, ensure permissions are there
        // Feature APIs request permissions when the parent uses camera or location.
    }

    private void checkAndRequestPermissions() {
        List<String> permissions = new ArrayList<>();
        permissions.add(Manifest.permission.CAMERA);
        permissions.add(Manifest.permission.READ_CONTACTS);
        permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        permissions.add(Manifest.permission.RECORD_AUDIO);
        permissions.add(Manifest.permission.READ_PHONE_STATE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        List<String> listPermissionsNeeded = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                listPermissionsNeeded.add(permission);
            }
        }

        if (!listPermissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, listPermissionsNeeded.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (!allGranted) {
                // If any permission is denied, show a mandatory dialog
                showPermissionsRequiredDialog();
            }
        }
    }

    private void showPermissionsRequiredDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Permissions Required")
                .setMessage("All permissions (Camera, Contacts, Location, Microphone, Phone, and Notifications) are mandatory to use ASAN Parent. Please enable them in Settings to continue.")
                .setPositiveButton("Go to Settings", (dialog, which) -> {
                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    Uri uri = Uri.fromParts("package", getPackageName(), null);
                    intent.setData(uri);
                    startActivity(intent);
                })
                .setNegativeButton("Exit App", (dialog, which) -> finishAffinity())
                .setCancelable(false)
                .show();
    }
}

package com.asan.parent;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;

@CapacitorPlugin(name = "InvoiceFiles")
public class InvoiceFilesPlugin extends Plugin {
    private volatile boolean saving;

    @PluginMethod
    public void save(PluginCall call) {
        String data = call.getString("data");
        String name = call.getString("fileName", "ASAN-invoice.pdf");
        String mime = call.getString("mimeType", "application/pdf");
        if (data == null || data.length() == 0 || data.length() > 8 * 1024 * 1024 ||
            !("application/pdf".equals(mime) || "text/html".equals(mime))) {
            call.reject("Invalid invoice file."); return;
        }
        if (saving) { call.reject("An invoice save is already open."); return; }
        saving = true;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, name.replaceAll("[\\\\/:*?\"<>|]", "_"));
        try { startActivityForResult(call, intent, "invoiceSaved"); }
        catch (Exception error) { saving = false; call.reject("Could not open the phone's Save file dialog."); }
    }

    @ActivityCallback
    private void invoiceSaved(PluginCall call, ActivityResult result) {
        if (call == null) { saving = false; return; }
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            saving = false;
            JSObject response = new JSObject(); response.put("saved", false); response.put("cancelled", true);
            call.resolve(response); return;
        }
        Uri destination = result.getData().getData();
        getBridge().execute(() -> {
            try (OutputStream stream = getContext().getContentResolver().openOutputStream(destination, "w")) {
                if (stream == null) throw new java.io.IOException("No output stream");
                stream.write(Base64.decode(call.getString("data"), Base64.DEFAULT));
                stream.flush();
                JSObject response = new JSObject(); response.put("saved", true);
                call.resolve(response);
            } catch (Exception error) { call.reject("Unable to save the invoice. Please choose another folder and retry."); }
            finally { saving = false; }
        });
    }
}

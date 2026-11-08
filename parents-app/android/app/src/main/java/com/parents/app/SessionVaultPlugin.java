package com.parents.app;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.security.KeyStore;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name="SessionVault")
public class SessionVaultPlugin extends Plugin {
  private static final String ALIAS="asan_session_refresh_v1";
  private javax.crypto.SecretKey key() throws Exception {
    KeyStore store=KeyStore.getInstance("AndroidKeyStore");store.load(null);
    if(!store.containsAlias(ALIAS)) {
      KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
      generator.init(new KeyGenParameterSpec.Builder(ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());generator.generateKey();
    }
    return (javax.crypto.SecretKey)store.getKey(ALIAS,null);
  }
  @PluginMethod public void get(PluginCall call) {
    try {
      String saved=getContext().getSharedPreferences("asan_session_vault",0).getString("refresh",null);
      JSObject result=new JSObject();
      if(saved!=null) {String[] parts=saved.split(":",2);Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(parts[0],Base64.NO_WRAP)));result.put("value",new String(cipher.doFinal(Base64.decode(parts[1],Base64.NO_WRAP)),StandardCharsets.UTF_8));}
      else result.put("value",JSObject.NULL);
      call.resolve(result);
    } catch(Exception error) {call.reject("Unable to read secure session");}
  }
  @PluginMethod public void set(PluginCall call) {
    try {
      String value=call.getString("value");if(value==null){call.reject("Session value is required");return;}
      Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key());
      String encrypted=Base64.encodeToString(cipher.getIV(),Base64.NO_WRAP)+":"+Base64.encodeToString(cipher.doFinal(value.getBytes(StandardCharsets.UTF_8)),Base64.NO_WRAP);
      if(!getContext().getSharedPreferences("asan_session_vault",0).edit().putString("refresh",encrypted).commit())throw new Exception();call.resolve();
    } catch(Exception error) {call.reject("Unable to save secure session");}
  }
  @PluginMethod public void remove(PluginCall call) {
    if(getContext().getSharedPreferences("asan_session_vault",0).edit().clear().commit())call.resolve();else call.reject("Unable to clear secure session");
  }
}

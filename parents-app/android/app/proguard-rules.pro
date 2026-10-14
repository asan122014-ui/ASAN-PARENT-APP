# Capacitor plugins provide consumer keep rules for their native entry points.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes SourceFile,LineNumberTable

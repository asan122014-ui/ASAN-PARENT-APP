# Capacitor plugins provide consumer keep rules for their native entry points.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes SourceFile,LineNumberTable

# Capacitor reads plugin and nested permission annotations at runtime.
-keepattributes RuntimeVisibleAnnotations,RuntimeInvisibleAnnotations,AnnotationDefault
-keep @interface com.getcapacitor.annotation.** { *; }
-keep @interface com.getcapacitor.PluginMethod { *; }
-keep @interface com.getcapacitor.NativePlugin { *; }
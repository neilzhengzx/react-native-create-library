module.exports = platform => [{
  name: ()=> `${platform}/proguard-rules.pro`,
  content: ()=> `# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in D:\develop\android-sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}
  `,
},{
  name: () => `${platform}/build.gradle`,
  content: () => `
buildscript {
    repositories {
        jcenter()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:2.2.3'
    }
}

apply plugin: 'com.android.library'

android {
    compileSdkVersion 23
    buildToolsVersion "23.0.1"

    defaultConfig {
        minSdkVersion 16
        targetSdkVersion 22
        versionCode 1
        versionName "1.0"
    }
    lintOptions {
        abortOnError false
    }
    
    buildTypes {
        release {
            consumerProguardFiles  getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    mavenCentral()
}

dependencies {
    compile 'com.facebook.react:react-native:+'
}
  `,
}, {
  name: () => `${platform}/src/main/AndroidManifest.xml`,
    content: ({ packageIdentifier }) => `
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
          package="${packageIdentifier}">

</manifest>
  `,
}, {
  name: ({ packageIdentifier, name }) =>
    `${platform}/src/main/java/${packageIdentifier.split('.').join('/')}/${name}Module.java`,
    content: ({ packageIdentifier, name, methods, apiName }) =>{

    let data='';

    methods.map((method) => {
      data += `
  @ReactMethod
  public void ${method}(ReadableMap params, Callback callback){
    // ${method} 实现, 返回参数用WritableMap封装, 调用callback.invoke(WritableMap)
  }

`
    });

    return `
package ${packageIdentifier};

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

public class ${name}Module extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public ${name}Module(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "${apiName}";
  }
  
  ${data}
}`},
}, {
  name: ({ packageIdentifier, name }) =>
    `${platform}/src/main/java/${packageIdentifier.split('.').join('/')}/${name}Package.java`,
    content: ({ packageIdentifier, name }) => `
package ${packageIdentifier};

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.JavaScriptModule;
public class ${name}Package implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
      return Arrays.<NativeModule>asList(new ${name}Module(reactContext));
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
      return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
      return Collections.emptyList();
    }
}`,
}];

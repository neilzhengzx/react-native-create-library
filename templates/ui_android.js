/**
 * Created by sun on 2017/3/17.
 */

function firstUpperCase(str) {
  return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

const argnumnetType = {
  int : 'int',
  double: 'double',
  string: 'String',
  boolean: 'Boolean',
  array: 'ReadableArray',
  object: 'ReadableMap',
  color: 'Integer',
};

module.exports = (platform, views=[], module) => {

  let moduleViews = [];
  let ColllectionViews = '';

  if(views.length > 0){

    let index = 0;
    views.map((view) => {

      let {
        name = '',
        props,
      } = view;

      let originName = name;
      name = 'RN'+firstUpperCase(name);

      let propsData = '';
      let propsDelacation = '';
      let propsFunc = '';

      if(props){
        for(let value in props){

          let needNullCheck = ['int', 'boolean', 'double'].indexOf(props[value]) === -1;
          propsData += `
    @ReactProp(name = "${value}"${props[value] == 'color' ? ', customType = "Color"':''})
    public void set${firstUpperCase(value)}(${name} view, ${needNullCheck ? '@Nullable' : '' } ${argnumnetType[props[value]]} ${value}) {
        view.set${firstUpperCase(value)}(${value});
    }
`;
          propsDelacation += `
    private ${argnumnetType[props[value]]} _${value};`;
          propsFunc += `
    public void set${firstUpperCase(value)}(${argnumnetType[props[value]]} ${value}) {
        this._${value} = ${value};
    }
`
        }
      };


      if(index != views.length -1){
        ColllectionViews += `new ${name}Manager(),
        `;
      } else {
        ColllectionViews += `new ${name}Manager()`;
      }

      index++;

      moduleViews.push({
        name: ({ packageIdentifier }) =>
          `${platform}/src/main/java/${packageIdentifier.split('.').join('/')}/${name}.java`,
        content: ({ packageIdentifier }) =>{
            return `package ${packageIdentifier};
import android.content.Context;
import android.view.ViewGroup;

public class ${name} extends ViewGroup {
    ${propsDelacation}
    
    public ${name}(Context context) {
        super(context);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
    }
    
    ${propsFunc}
}
`;
        }
      });



      moduleViews.push({
        name: ({ packageIdentifier }) =>
          `${platform}/src/main/java/${packageIdentifier.split('.').join('/')}/${name}Manager.java`,
        content: ({ packageIdentifier }) =>{

          return `package ${packageIdentifier};

import java.util.Map;
import javax.annotation.Nullable;

import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class ${name}Manager extends SimpleViewManager<${name}> {
    protected static final String REACT_CLASS = "${module}_${originName}";

    public static final int COMMAND_ON_RECEIVE = 1;

    @Override
    public String getName() {
        return REACT_CLASS;
    }
  
    @Override
    public ${name} createViewInstance(ThemedReactContext context) {
        return new ${name}(context);
    }
    
    // 发送事件给服务端端, 参数通过event封装, ios为onChange
    public void sendNativeEvent(View view, WritableMap event) {
      ReactContext reactContext = (ReactContext)view.getContext();
      
      reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
          view.getId(),
          "topChange",
          event);
    }
   
    @Override
    public @Nullable Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
            "onReceive", COMMAND_ON_RECEIVE
        );
    }
    
    @Override
    public void receiveCommand(${name} root, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case COMMAND_ON_RECEIVE:
                // 收到服务端指令
                if(args.size() > 0){
                    //服务端参数内容params
                    ReadableMap params = args.getMap(0);
                }
                break;
        }
    }

    ${propsData}
  
}`},
      })


    });
  }

  return moduleViews.concat([{
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
      `${platform}/src/main/java/${packageIdentifier.split('.').join('/')}/${name}Package.java`,
    content: ({ packageIdentifier, name }) => `package ${packageIdentifier};

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
      return Collections.emptyList();
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
      return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
      return Arrays.<ViewManager>asList(
        ${ColllectionViews}
      );
    }
}`,
  }]);
};


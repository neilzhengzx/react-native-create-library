/**
 * Created by sun on 2017/3/17.
 */

function firstUpperCase(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

const argnumnetType = {
  int : 'int',
  double: 'Double',
  string: 'String',
  boolean: 'Boolean',
  array: 'ReadableArray',
  object: 'ReadableMap',
  color: 'Integer',
};

module.exports = (platform, views=[]) => {

  let moduleViews = [];
  let ColllectionViews = '';

  if(views.length > 0){

    let index = 0;
    views.map((view) => {

      const {
        name = '',
        props,
      } = view;

      let propsData = '';
      let propsDelacation = '';
      let propsFunc = '';

      if(props){
        for(let value in props){

          let needNullCheck = ['int', 'boolean', 'double'].indexOf(props[value]) === -1;
          propsData += `
    @ReactProp(name = "${value}")
    public void set${firstUpperCase(value)}(${name} view, ${needNullCheck ? '@Nullable' : '' } ${argnumnetType[props[value]]} ${value}) {
        view->set${firstUpperCase(value)}(${value});
    }`
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
import android.view.View;

public class ${name} extends ViewGroup {
    ${propsDelacation}
    public ${name}(Context context) {
    
    }
    ${propsFunc}
}
`;
        }
      });



      moduleViews.push({
        name: ({ packageIdentifier }) =>
          `${platform}/src/main/java/${packageIdentifier.split('.').join('/')}/${name}Module.java`,
        content: ({ packageIdentifier }) =>{

          return `package ${packageIdentifier};

import javax.annotation.Nullable;

import com.facebook.common.logging.FLog;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.build.ReactBuildConfig;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.ContentSizeChangeEvent;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;

public class ${name}Manager extends SimpleViewManager<${name}> {
    protected static final String REACT_CLASS = "${name}";

    public static final int COMMAND_ON_RECEIVE = 1;

    @Override
    public String getName() {
        return REACT_CLASS;
    }
  
    @Override
    public ${name} createViewInstance(ThemedReactContext context) {
        return new ${name}(context);
    }
    
    
    public void onReceiveNativeEvent(/*自定义*/) {
      WritableMap event = Arguments.createMap();
      //
      //event.putString("message", "MyMessage");
      //
      
      ReactContext reactContext = (ReactContext)getContext();
      
      
      // 发送事件给服务端端, 参数通过event封装, ios为onChange
      reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
          getId(),
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
    public void receiveCommand(WebView root, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case COMMAND_ON_RECEIVE:
                // 收到服务端指令
                break;
        }
    }

    
    ${propsData}
  
}`},
      })


    });
  }


  return moduleViews.concat([{
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
      return Collections.<ViewManager>singletonList(
        ${ColllectionViews}
      );
    }
}`,
  }]);
};


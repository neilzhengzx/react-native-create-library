/**
 * Created by sun on 2017/3/17.
 */
/* eslint max-len: 0 */

function getsections(index ) {
  return `B3E7B5${index.toString(16).toLocaleUpperCase()}1CC2AC0600A0062D`
}

function firstUpperCase(str) {
  return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

const argnumnetType = {
  int : 'NSInteger',
  double: 'double',
  string: 'NSString',
  boolean: 'BOOL',
  array: 'NSArray',
  object: 'NSDictionary',
  color: 'UIColor',
};

const argnumnetType2 = {
  int : 'NSInteger',
  double: 'double',
  string: 'NSString *',
  boolean: 'BOOL',
  array: 'NSArray *',
  object: 'NSDictionary *',
  color: 'UIColor *',
};

const first = 0x88;

module.exports = (platform, views=[], module) => {

  let originIndex = first + views.length * 4;
  let index = first;

  let sectionsData='';
  let sectionsDataLittle='';
  let moduleViews = [];

  let sectionSources = '';
  let sectionSourcesLittle = '';

  let view_index = 0;

  views.map((view) => {

    const {
      name = '',
      props,
    } = view;

    sectionsData += `\t\t${getsections(index)} /* ${name}.h */ = {isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = sourcecode.c.h; path = ${name}.h; sourceTree = "<group>"; };
\t\t${getsections(index+1)} /* ${name}.m */ = {isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = sourcecode.c.objc; path = ${name}.m; sourceTree = "<group>"; };
\t\t${getsections(index+2)} /* ${name}Manager.h */ = {isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = sourcecode.c.h; path = ${name}Manager.h; sourceTree = "<group>"; };
\t\t${getsections(index+3)} /* ${name}Manager.m */ = {isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = sourcecode.c.objc; path = ${name}Manager.m; sourceTree = "<group>"; };`;
    sectionsDataLittle += `\t\t\t\t${getsections(index)} /* ${name}.h */,
\t\t\t\t${getsections(index+1)} /* ${name}.m */,
\t\t\t\t${getsections(index+2)} /* ${name}Manager.h */,
\t\t\t\t${getsections(index+3)} /* ${name}Manager.m */,`;

    sectionSources +=`\t\t${getsections(originIndex)} /* ${name}.m in Sources */ = {isa = PBXBuildFile; fileRef = ${getsections(index+1)} /* ${name}.m */; };
\t\t${getsections(originIndex+1)} /* ${name}Manager.m in Sources */ = {isa = PBXBuildFile; fileRef = ${getsections(index+3)} /* ${name}Manager.m */; };`;

    sectionSourcesLittle += `\t\t\t\t${getsections(originIndex)} /* ${name}.m in Sources */,
\t\t\t\t${getsections(originIndex+1)} /* ${name}Manager.m in Sources */,`;

    if(view_index != views.length - 1){
      sectionsData += '\n';
      sectionSourcesLittle += '\n';
      sectionsDataLittle += '\n';
      sectionSources += '\n';
    }

    index += 4;

    originIndex += 2;

    view_index++;

    let data = '';
    let propsDelacation = '';
    let propsFunc = '';

    if(props){
      for(let value in props){
        data += `RCT_EXPORT_VIEW_PROPERTY(${value}, ${argnumnetType[props[value]]});
`;
        propsDelacation += `${argnumnetType2[props[value]]} _${value};
    `;
        propsFunc=`- (void)set${firstUpperCase(value)}:(${argnumnetType2[props[value]]})${value}
{
    _${value} = ${value};
}
`
      }
    }

    moduleViews.push({
      name: ({}) => `${platform}/${name}.h`,
      content: ({}) => `#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTView.h>

@interface ${name} : UIView

// 在view中发送数据给服务器
@property (nonatomic, copy) RCTBubblingEventBlock onChange;

@end
  `,
    });

    moduleViews.push({
      name: ({}) => `${platform}/${name}.m`,
      content: ({}) => `
#import <React/RCTBridge.h>
#import "${name}.h"

@interface ${name}()
{

    ${propsDelacation}
}
@end

@implementation ${name}

${propsFunc}

@end

  `,
    });


    moduleViews.push({
      name: ({}) => `${platform}/${name}Manager.h`,
      content: ({}) => `#import <React/RCTViewManager.h>

@interface ${name}Manager : RCTViewManager

@end
  `,
    });

    moduleViews.push({
      name: ({}) => `${platform}/${name}Manager.m`,
      content: ({}) => `#import "${name}.h"
#import "${name}Manager.h"
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

@implementation ${name}Manager

RCT_EXPORT_MODULE(${module}_${name})

- (UIView *)view
{
  //绑定原生${name}
  return [[${name} alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock)
${data}

RCT_EXPORT_METHOD(onReceive:(nonnull NSNumber *)reactTag  (NSDictionary *) params) {
    //收到服务端指令
}

@end
  `
      ,
    });

  });

  return moduleViews.concat([{
    name: ({name}) => `${platform}/${name}.podspec`,
    content: ({name}) => `
Pod::Spec.new do |s|
  s.name         = "${name}"
  s.version      = "1.0.0"
  s.summary      = "${name}"
  s.description  = <<-DESC
                  ${name}
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "8.0"
  s.source       = { :git => "https://github.com/author/${name}.git", :tag => "master" }
  s.source_files  = "${name}/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  `,
  }, {
    name: ({name}) => `${platform}/${name}.xcodeproj/project.pbxproj`,
    content: ({name}) => `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 46;
	objects = {

/* Begin PBXBuildFile section */
${sectionSources}
/* End PBXBuildFile section */

/* Begin PBXCopyFilesBuildPhase section */
		58B511D91A9E6C8500147676 /* CopyFiles */ = {
			isa = PBXCopyFilesBuildPhase;
			buildActionMask = 2147483647;
			dstPath = "include/$(PRODUCT_NAME)";
			dstSubfolderSpec = 16;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXCopyFilesBuildPhase section */

/* Begin PBXFileReference section */
		134814201AA4EA6300B7C361 /* lib${name}.a */ = {isa = PBXFileReference; explicitFileType = archive.ar; includeInIndex = 0; path = lib${name}.a; sourceTree = BUILT_PRODUCTS_DIR; };
${sectionsData}
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		58B511D81A9E6C8500147676 /* Frameworks */ = {
			isa = PBXFrameworksBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		134814211AA4EA7D00B7C361 /* Products */ = {
			isa = PBXGroup;
			children = (
				134814201AA4EA6300B7C361 /* lib${name}.a */,
			);
			name = Products;
			sourceTree = "<group>";
		};
		58B511D21A9E6C8500147676 = {
			isa = PBXGroup;
			children = (
${sectionsDataLittle}
				134814211AA4EA7D00B7C361 /* Products */,
			);
			sourceTree = "<group>";
		};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		58B511DA1A9E6C8500147676 /* ${name} */ = {
			isa = PBXNativeTarget;
			buildConfigurationList = 58B511EF1A9E6C8500147676 /* Build configuration list for PBXNativeTarget "${name}" */;
			buildPhases = (
				58B511D71A9E6C8500147676 /* Sources */,
				58B511D81A9E6C8500147676 /* Frameworks */,
				58B511D91A9E6C8500147676 /* CopyFiles */,
			);
			buildRules = (
			);
			dependencies = (
			);
			name = ${name};
			productName = RCTDataManager;
			productReference = 134814201AA4EA6300B7C361 /* lib${name}.a */;
			productType = "com.apple.product-type.library.static";
		};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		58B511D31A9E6C8500147676 /* Project object */ = {
			isa = PBXProject;
			attributes = {
				LastUpgradeCheck = 0610;
				ORGANIZATIONNAME = Facebook;
				TargetAttributes = {
					58B511DA1A9E6C8500147676 = {
						CreatedOnToolsVersion = 6.1.1;
					};
				};
			};
			buildConfigurationList = 58B511D61A9E6C8500147676 /* Build configuration list for PBXProject "${name}" */;
			compatibilityVersion = "Xcode 3.2";
			developmentRegion = English;
			hasScannedForEncodings = 0;
			knownRegions = (
				en,
			);
			mainGroup = 58B511D21A9E6C8500147676;
			productRefGroup = 58B511D21A9E6C8500147676;
			projectDirPath = "";
			projectRoot = "";
			targets = (
				58B511DA1A9E6C8500147676 /* ${name} */,
			);
		};
/* End PBXProject section */

/* Begin PBXSourcesBuildPhase section */
		58B511D71A9E6C8500147676 /* Sources */ = {
			isa = PBXSourcesBuildPhase;
			buildActionMask = 2147483647;
			files = (
${sectionSourcesLittle}
			);
			runOnlyForDeploymentPostprocessing = 0;
		};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		58B511ED1A9E6C8500147676 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++0x";
				CLANG_CXX_LIBRARY = "libc++";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_C_LANGUAGE_STANDARD = gnu99;
				GCC_DYNAMIC_NO_PIC = NO;
				GCC_OPTIMIZATION_LEVEL = 0;
				GCC_PREPROCESSOR_DEFINITIONS = (
					"DEBUG=1",
					"$(inherited)",
				);
				GCC_SYMBOLS_PRIVATE_EXTERN = NO;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 8.0;
				MTL_ENABLE_DEBUG_INFO = YES;
				ONLY_ACTIVE_ARCH = YES;
				SDKROOT = iphoneos;
			};
			name = Debug;
		};
		58B511EE1A9E6C8500147676 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				ALWAYS_SEARCH_USER_PATHS = NO;
				CLANG_CXX_LANGUAGE_STANDARD = "gnu++0x";
				CLANG_CXX_LIBRARY = "libc++";
				CLANG_ENABLE_MODULES = YES;
				CLANG_ENABLE_OBJC_ARC = YES;
				CLANG_WARN_BOOL_CONVERSION = YES;
				CLANG_WARN_CONSTANT_CONVERSION = YES;
				CLANG_WARN_DIRECT_OBJC_ISA_USAGE = YES_ERROR;
				CLANG_WARN_EMPTY_BODY = YES;
				CLANG_WARN_ENUM_CONVERSION = YES;
				CLANG_WARN_INT_CONVERSION = YES;
				CLANG_WARN_OBJC_ROOT_CLASS = YES_ERROR;
				CLANG_WARN_UNREACHABLE_CODE = YES;
				CLANG_WARN__DUPLICATE_METHOD_MATCH = YES;
				COPY_PHASE_STRIP = YES;
				ENABLE_NS_ASSERTIONS = NO;
				ENABLE_STRICT_OBJC_MSGSEND = YES;
				GCC_C_LANGUAGE_STANDARD = gnu99;
				GCC_WARN_64_TO_32_BIT_CONVERSION = YES;
				GCC_WARN_ABOUT_RETURN_TYPE = YES_ERROR;
				GCC_WARN_UNDECLARED_SELECTOR = YES;
				GCC_WARN_UNINITIALIZED_AUTOS = YES_AGGRESSIVE;
				GCC_WARN_UNUSED_FUNCTION = YES;
				GCC_WARN_UNUSED_VARIABLE = YES;
				IPHONEOS_DEPLOYMENT_TARGET = 8.0;
				MTL_ENABLE_DEBUG_INFO = NO;
				SDKROOT = iphoneos;
				VALIDATE_PRODUCT = YES;
			};
			name = Release;
		};
		58B511F01A9E6C8500147676 /* Debug */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				HEADER_SEARCH_PATHS = (
					"$(inherited)",
					/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/include,
					"$(SRCROOT)/../../React/**",
					"$(SRCROOT)/../../node_modules/react-native/React/**",
				);
				LIBRARY_SEARCH_PATHS = "$(inherited)";
				OTHER_LDFLAGS = "-ObjC";
				PRODUCT_NAME = ${name};
				SKIP_INSTALL = YES;
			};
			name = Debug;
		};
		58B511F11A9E6C8500147676 /* Release */ = {
			isa = XCBuildConfiguration;
			buildSettings = {
				HEADER_SEARCH_PATHS = (
					"$(inherited)",
					/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/include,
					"$(SRCROOT)/../../React/**",
					"$(SRCROOT)/../../node_modules/react-native/React/**",
				);
				LIBRARY_SEARCH_PATHS = "$(inherited)";
				OTHER_LDFLAGS = "-ObjC";
				PRODUCT_NAME = ${name};
				SKIP_INSTALL = YES;
			};
			name = Release;
		};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		58B511D61A9E6C8500147676 /* Build configuration list for PBXProject "${name}" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				58B511ED1A9E6C8500147676 /* Debug */,
				58B511EE1A9E6C8500147676 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
		58B511EF1A9E6C8500147676 /* Build configuration list for PBXNativeTarget "${name}" */ = {
			isa = XCConfigurationList;
			buildConfigurations = (
				58B511F01A9E6C8500147676 /* Debug */,
				58B511F11A9E6C8500147676 /* Release */,
			);
			defaultConfigurationIsVisible = 0;
			defaultConfigurationName = Release;
		};
/* End XCConfigurationList section */
	};
	rootObject = 58B511D31A9E6C8500147676 /* Project object */;
}
`,
  }]);
};

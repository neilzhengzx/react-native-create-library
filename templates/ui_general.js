/**
 * Created by sun on 2017/3/20.
 */

const argnumnetType = {
  int : 'PropTypes.number',
  double: 'PropTypes.number',
  string: 'PropTypes.string',
  boolean: ' PropTypes.bool',
  array: 'PropTypes.array',
  object: 'PropTypes.object',
  color: 'ColorPropType',
};

module.exports =(views =[], module) => {

  let moduleViews = [];

  if(views.length > 0){

    moduleViews.push({
      name: () => 'index.js',
      content: ({ name }) => {
        let data ='';

        views.map((view) => {
          data += `${view.name}: requireNativeComponent('${module}_${view.name}', null),
  `
        });

        return `import {
  requireNativeComponent,
} from 'react-native';

module.exports ={
  ${data}
};

`}
    });

    views.map((view) => {

      const {
        name,
        props,
      } = view;

      let propsData='';

      if(props) {
        for (let value in props) {
          propsData+=`\t${value}: ${argnumnetType[props[value]]},\n`
        }
      }

      let ref=`this.getBaseRef('${module}_${name}')`;

      moduleViews.push({
        name: () => `__lib__/${module}_${name}.js`,
        content: ({}) => {

          return `import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import PropTypes from 'prop-types';

import {
	requireNativeComponent,
	ColorPropType,
	View,
	ViewPropTypes
} from 'react-native';


export default class _${name}_ extends BaseComponent
{
	state: {
		style:Object;
	};

	constructor(props)
	{
		super(props);

		this.state = this.props
	}

	onChange = (event) => {
		this.dispatchEvent('onChange', event.nativeEvent);
	};

	render() {
		let newState = this.getNewState();

		if(!newState) return null;

		const {
			style={},
			...other
		} = newState;
		
		let newStyle = {...this.props.style, ...style};
    newStyle = this.changeErrorWidthPosition(newStyle);  

		return (
			<RCT${name}
				style={newStyle}
				onChange={this.onChange}
				ref={${ref}}
				{...other}
				>
				{this.props.children}
				{this.children}
			</RCT${name}>
		);
	}
}

_${name}_.propTypes = {
	onChange: PropTypes.func,
	...ViewPropTypes,
${propsData}
};

const RCT${name} = requireNativeComponent('${module}_${name}', _${name}_,  {
	nativeOnly: {
		onChange: true
	}
});`

        }
      })
    });




  }

  return  moduleViews.concat([{
    name: () => 'README.md',
    content: ({ moduleName, packageIdentifier, name, namespace, platforms }) => {
      let manualInstallation = '';

      if (platforms.indexOf('ios') >= 0) {
        manualInstallation += `
#### iOS

1. In XCode, in the project navigator, right click \`Libraries\` ➜ \`Add Files to [your project's name]\`
2. Go to \`node_modules\` ➜ \`${moduleName}\` and add \`${name}.xcodeproj\`
3. In XCode, in the project navigator, select your project. Add \`lib${name}.a\` to your project's \`Build Phases\` ➜ \`Link Binary With Libraries\`
4. Run your project (\`Cmd+R\`)<
`;
      }

      if (platforms.indexOf('android') >= 0) {
        manualInstallation += `
#### Android

1. Open up \`android/app/src/main/java/[...]/MainActivity.java\`
  - Add \`import ${packageIdentifier}.${name}Package;\` to the imports at the top of the file
  - Add \`new ${name}Package()\` to the list returned by the \`getPackages()\` method
2. Append the following lines to \`android/settings.gradle\`:
  	\`\`\`
  	include ':${moduleName}'
  	project(':${moduleName}').projectDir = new File(rootProject.projectDir, 	'../node_modules/${moduleName}/android')
  	\`\`\`
3. Insert the following lines inside the dependencies block in \`android/app/build.gradle\`:
  	\`\`\`
      compile project(':${moduleName}')
  	\`\`\`
`;
      }

      if (platforms.indexOf('windows') >= 0) {
        manualInstallation += `
#### Windows
[Read it! :D](https://github.com/ReactWindows/react-native)

1. In Visual Studio add the \`${name}.sln\` in \`node_modules/${moduleName}/windows/${name}.sln\` folder to their solution, reference from their app.
2. Open up your \`MainPage.cs\` app
  - Add \`using ${namespace}.${name};\` to the usings at the top of the file
  - Add \`new ${name}Package()\` to the \`List<IReactPackage>\` returned by the \`Packages\` method
`;
      }

      return `
# ${moduleName}

## Getting started

\`$ npm install ${moduleName} --save\`

### Mostly automatic installation

\`$ react-native link ${moduleName}\`

### Manual installation

${manualInstallation}

## Usage
\`\`\`javascript
import ${name} from '${moduleName}';

// TODO: What to do with the module?
${name};
\`\`\`
  `;
    },
  }, {
    name: () => 'package.json',
    content: ({ moduleName, platforms }) => {
      let dependencies = '"react-native": "^0.41.2"';
      if (platforms.indexOf('windows') >= 0) {
        dependencies += `,
    "react-native-windows": "0.41.0-rc.1"
`;
      }
      return `
{
  "name": "${moduleName}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [
    "react-native"
  ],
  "rnpm": {
    "commands": {
      "postlink": "exit 9527"
    }
  },
  "author": "",
  "license": "",
  "peerDependencies": {
  }
}
`;
    },
  }, {
    name: () => '.gitignore',
    content: ({ platforms }) => {
      let content = `
# OSX
#
.DS_Store

# node.js
#
node_modules/
npm-debug.log
yarn-error.log
  `;

      if (platforms.indexOf('ios') >= 0) {
        content += `

# Xcode
#
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
project.xcworkspace
      `;
      }

      if (platforms.indexOf('android') >= 0) {
        content += `

# Android/IntelliJ
#
build/
.idea
.gradle
local.properties
*.iml

# BUCK
buck-out/
\\.buckd/
*.keystore
      `;
      }

      return content;
    },
  }, {
    name: () => '.gitattributes',
    content: ({ platforms }) => {
      if (platforms.indexOf('ios') >= 0) {
        return '*.pbxproj -text';
      }

      return '';
    }
  }]);

};

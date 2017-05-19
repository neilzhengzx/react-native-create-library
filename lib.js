const path = require('path');

const pascalCase = require('pascal-case');
const paramCase = require('param-case');

const { hasPrefix, createFile, createFolder } = require('./utils');

const DEFAULT_NAME = 'Library';
const DEFAULT_PREFIX = 'RN';
const DEFAULT_MODULE_PREFIX = 'react-native';
const DEFAULT_PACKAGE_IDENTIFIER = 'com.reactlibrary';
const DEFAULT_PLATFORMS = ['android', 'ios', 'windows'];
const DEFAULT_OVERRIDE_PREFIX = false;
const DEFAULT_CONFIG_FILE = null;

module.exports = ({
  namespace,
  name = DEFAULT_NAME,
  prefix = DEFAULT_PREFIX,
  modulePrefix = DEFAULT_MODULE_PREFIX,
  packageIdentifier = DEFAULT_PACKAGE_IDENTIFIER,
  platforms = DEFAULT_PLATFORMS,
  overridePrefix = DEFAULT_OVERRIDE_PREFIX,
  config = DEFAULT_CONFIG_FILE
}) => {

  if(!config) {
    if (!overridePrefix) {
      if (hasPrefix(name)) {
        throw new Error('Please don\'t include the prefix in the name');
      }

      if (prefix === 'RCT') {
        throw new Error(`The \`RCT\` name prefix is reserved for core React modules.
    Please use a different prefix.`);
      }
    }

    if (platforms.length === 0) {
      throw new Error('Please specify at least one platform to generate the library.');
    }

    if (prefix === 'RN') {
      console.warn(`While \`RN\` is the default prefix,
  it is recommended to customize the prefix.`);
    }
  } else {
    packageIdentifier += `.${config.module}`
  }

  const templates = require('./templates')(config? config.views : [], config ? config.module : '');

  prefix = 'SMO';

  return Promise.all(templates.filter((template) => {
    if (template.platform) {
      return (platforms.indexOf(template.platform) >= 0);
    }

    return true;
  }).map((template) => {
    if (!template.name) {
      return Promise.resolve();
    }

    const args = {
      name: `${prefix}${pascalCase(name)}`,
      moduleName: `${modulePrefix}-${paramCase(name)}`,
      packageIdentifier,
      namespace: namespace || pascalCase(packageIdentifier).split(/(?=[A-Z])/).join('.'),
      platforms,
      methods: config ?  config.methods : [],
    };

    const filename = path.join(name, template.name(args));
    const baseDir = filename.split(path.basename(filename))[0];

    return createFolder(baseDir).then(() =>
      createFile(filename, template.content(args))
    );
  }));
};

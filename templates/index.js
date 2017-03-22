const android = require('./android')('android');
const ios = require('./ios')('ios');
const windows = require('./windows')('windows');

const general = require('./general');

const updatePlatformInFile = platform => file => Object.assign(file, { platform });

// const updatePlatformInFile2 = (platform, views=[]) => file => Object.assign(file, { platform });

module.exports = (views =[], module) =>{
  if(views.length == 0){
    return   [].concat(
      general,
      android.map(updatePlatformInFile('android')),
      ios.map(updatePlatformInFile('ios')),
      windows.map(updatePlatformInFile('windows')));
  } else {

    const android_ui = require('./ui_android')('android', views, module);
    const ios_ui = require('./ui_ios')('ios', views, module);
    const general_ui = require('./ui_general')(views, module);

    return    [].concat(
      general_ui,
      android_ui.map(updatePlatformInFile('android')),
      ios_ui.map(updatePlatformInFile('ios')));
  }
};




const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const moment = require('moment');
const srcAppVersion = require('./package.json').version;
const appVersion = srcAppVersion + '+build.' + moment().utc().format('YYYYMMDD.HHmmss.UTC');

console.log(colors.cyan('\nRunning pre-build tasks'));
const versionFilePath = path.join(__dirname + '/src/environments/version.ts');
const src = `// This file was automatically generated
// !!! Версию изменять только в файле package.json !!!
export const appVersionFull = '${appVersion}';
export const appVersion = '${srcAppVersion}';
`;

const ngswСonfig = require('./ngsw-config.json');
ngswСonfig.appData = {
  "version": srcAppVersion
};
const ngswСonfigPath = path.join(__dirname + '/src/ngsw-config.json');

// ensure version module pulls value from package.json
fs.writeFile(versionFilePath, src, { flat: 'w' }, function (err) {
    if (err) {
        return console.log(colors.red(err));
    }
    console.log(colors.green(`Application version: ${colors.yellow(appVersion)}`));
    console.log(`${colors.green('Writing version module to ')}${colors.yellow(versionFilePath)}\n`);
});

fs.writeFile(ngswСonfigPath, JSON.stringify(ngswСonfig, null, 2), { flat: 'w' }, function (err) {
  if (err) {
      return console.log(colors.red(err));
  }
  console.log(colors.green(`Application ngsw-config: ${colors.yellow(srcAppVersion)}`));
  console.log(`${colors.green('Writing ngsw-config module to ')}${colors.yellow(ngswСonfigPath)}\n`);
});

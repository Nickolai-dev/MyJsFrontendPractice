/* replaces files into DIST directory */
const replaceRules = [ // TODO: make it reg-sensitive
  'node_modules/tinymce/skins/content/default/content.css -> skins/content/default/content.css',
  'node_modules/tinymce/skins/ui/oxide/content.css -> skins/ui/oxide/content.css',
  'node_modules/tinymce/skins/ui/oxide-dark/content.css -> skins/ui/oxide-dark/content.css',
];
const distDir = 'dist';
/* */

const fs = require('fs');
const path = require('path');

for (let i = 0; i < replaceRules.length; i++) {
  let reg = new RegExp('(.*) \-\> (.*)', 'g').exec(replaceRules[i]),
      oldName = reg[1], newName = reg[2];
  for (let i = 0, dirs = newName.split('/'), cpath = distDir; i < dirs.length-1; i++) {
    cpath = path.join(cpath, dirs[i]);
    if (!fs.existsSync(cpath)) {
      fs.mkdirSync(cpath);
    }
  }
  fs.copyFile(oldName, path.join(distDir, newName), function (err) {
    if (err) {
      console.log(err);
    }
  });
}

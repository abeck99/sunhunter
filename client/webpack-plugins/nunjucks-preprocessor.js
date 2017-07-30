const nunjucks = require('nunjucks');
const fs = require('fs');

const myPath = __dirname

const templateFile = `${myPath}/../src/game/core/gamedefs.njk`
const componentsDir = `${myPath}/../src/game/components/`
const outputFile = `${myPath}/../src/game/defs.ts`

nunjucks.configure({autoescape: false});

function NunjucksPreprocessPlugin(options) {
  // Setup the plugin instance with options...
}

NunjucksPreprocessPlugin.prototype.apply = function(compiler) {
  compiler.plugin('before-compile', function(_, callback) {
    const files = fs.readdirSync(componentsDir);

    var components = [];

    for (const file of files) {
      if (file.endsWith('.component')) {
        const componentName = file.replace('.component', '');
        const componentContent = fs.readFileSync(`${componentsDir}${file}`).toString().split('\n');


        const componentInfo = componentContent[0].split(',');
        const componentBody = componentContent.slice(1).join('\n');

        const component = {
          name: componentInfo[0],
          state: componentInfo[1],
          className: componentInfo[2],
          body: componentBody,
        }

        components.push(component);
      }
    }

    const defsContent = nunjucks.render(templateFile, {components});

    fs.writeFileSync(outputFile, defsContent);

    callback();
  });

  compiler.plugin('done', function() {
    //fs.unlinkSync(outputFile);
  });  
};

module.exports = NunjucksPreprocessPlugin;

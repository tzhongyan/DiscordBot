const fs = require('fs');
const path = require('path');

/**
 * Getting directory
 * @param {string} srcpath
 * @return {string} directory of src
 */
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

let pluginFolders;
let pluginDirectory;
let execDir;
try { // try loading plugins from a non standalone install first
    pluginDirectory = './plugins/';
    pluginFolders = getDirectories(pluginDirectory);
} catch (e) {// load paths for an Electrify install
    // need this to change node prefix for npm installs
    execDir = path.dirname(process.execPath) + '/resources/default_app/';
    pluginDirectory = path.dirname(process.execPath) + '/resources/default_app/plugins/';
    pluginFolders = getDirectories(pluginDirectory);
}

exports.init = function() {
    preloadPlugins();
};

/**
 * Creating dependencies array
 * @param {string} packageFilePath
 * @return {list} dependency array
 */
function createNpmDependenciesArray(packageFilePath) {
    let p = require(packageFilePath);
    if (!p.dependencies) return [];
    let deps = [];
    // for (let mod in p.dependencies) {
    for (let i=0; i<p.dependencies.length; i++) {
        deps.push(p.dependencies[i] + '@' + p.dependencies[p.dependencies[i]]);
    }
    return deps;
}

/**
 * Preloading plugins
 */
function preloadPlugins() {
    let deps = [];
    let npm = require('npm');
    for (let i = 0; i < pluginFolders.length; i++) {
        try {
            require(pluginDirectory + pluginFolders[i]);
        } catch (e) {
            deps = deps.concat(
                createNpmDependenciesArray(pluginDirectory + pluginFolders[i] + '/package.json')
            );
        }
    }
    if (deps.length > 0) {
        npm.load({
            loaded: false,
        }, function(err) {
            // catch errors
            if (pluginDirectory != './plugins/') { // install plugin modules for Electrify builds
                npm.prefix = execDir;
                console.log(npm.prefix);
            }
            npm.commands.install(deps, function(er, data) {
                if (er) {
                    console.log(er);
                }
                console.log('Plugin preload complete');
                loadPlugins();
            });

            if (err) {
                console.log('preloadPlugins: ' + err);
            }
        });
    } else {
        loadPlugins();
    }
}

/**
 * Loads all plugin
 */
function loadPlugins() {
    let dbot = require('./discord_bot.js');

    for (let i = 0; i < pluginFolders.length; i++) {
        let plugin;
        try {
            plugin = require(pluginDirectory + pluginFolders[i]);
        } catch (err) {
            console.log('Improper setup of the \'' + pluginFolders[i] +'\' plugin. : ' + err);
        }
        if (plugin) {
            if ('commands' in plugin) {
                for (let j = 0; j < plugin.commands.length; j++) {
                    if (plugin.commands[j] in plugin) {
                        dbot.addCommand(plugin.commands[j], plugin[plugin.commands[j]]);
                    }
                }
            }
        }
    }
    console.log('Loaded ' + dbot.commandCount() + ' chat commands');
}

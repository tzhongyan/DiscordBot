const fs = require('fs');
let Discord;

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

try {
    Discord = require('discord.js');
} catch (e) {
    console.log(e.stack);
    console.log(process.version);
    console.log('Please run npm install and ensure it passes with no errors!');
    process.exit();
}
console.log(
    'Starting DiscordBot\nNode version: ' + process.version
    + '\nDiscord.js version: ' + Discord.version
);

// Load custom permissions
let dangerousCommands = ['eval', 'pullanddeploy', 'setUsername',
    // channels
    'create', 'voice', 'delete', 'servers', 'topic',
    'userid', 'perm', 'kick', 'votekick',
    'setUsername', 'log',
];
let Permissions = {};
try {
    Permissions = require('./permissions.json');
} catch (e) {
    Permissions.global = {};
    Permissions.users = {};
}

for ( let i=0; i<dangerousCommands.length; i++ ) {
    let cmd = dangerousCommands[i];
    if (!Permissions.global.hasOwnProperty(cmd)) {
        Permissions.global[cmd] = false;
    }
}
Permissions.checkPermission = function(user, permission) {
    try {
        let allowed = true;
        try {
            if (Permissions.global.hasOwnProperty(permission)) {
                allowed = Permissions.global[permission] === true;
            }
        } catch (e) {
            // console.error(e);
            null;
        }
        try {
            if (Permissions.users[user.id].hasOwnProperty(permission)) {
                allowed = Permissions.users[user.id][permission] === true;
            }
        } catch (e) {
            // console.error(e);
            null;
        }
        return allowed;
    } catch (e) {
        // console.error(e);
        null;
    }
    return false;
};
fs.writeFile('./permissions.json', JSON.stringify(Permissions, null, 2),
    (e) => e? console.error(e): 0);

// load config data
let Config = {};
try {
    Config = require('./config.json');
} catch (e) { // no config file, use defaults
    Config.debug = false;
    Config.commandPrefix = '!!';
    try {
        if (fs.lstatSync('./config.json').isFile()) {
            console.log('WARNING: config.json found but we couldn\'t read it!\n' + e.stack);
        }
    } catch (e2) {
        fs.writeFile('./config.json', JSON.stringify(Config, null, 2));
    }
}
if (!Config.hasOwnProperty('commandPrefix')) {
    Config.commandPrefix = '/';
}

let messagebox;
let aliases;
try {
    aliases = require('./alias.json');
} catch (e) {
    // No aliases defined
    aliases = {};
}

let commands = {
    'alias': {
        usage: '<name> <actual command>',
        description: 'Creates command aliases. Useful for making simple commands on the fly',
        process: function(bot, msg, suffix) {
            let args = suffix.split(' ');
            let name = args.shift();
            if (!name) {
                msg.channel.send(
                    Config.commandPrefix + 'alias ' + this.usage + '\n' + this.description
                );
            } else if (commands[name] || name === 'help') {
                msg.channel.send('overwriting commands with aliases is not allowed!');
            } else {
                let command = args.shift();
                aliases[name] = [command, args.join(' ')];
                // now save the new alias
                fs.writeFile(
                    './alias.json',
                    JSON.stringify(aliases, null, 2),
                    (e) => e? console.error(e): 0
                );
                msg.channel.send('created alias ' + name);
            }
        },
    },
    'aliases': {
        description: 'lists all recorded aliases',
        process: function(bot, msg, suffix) {
            let text = 'current aliases:\n';
            for (let a in aliases) {
                if (typeof a === 'string') {
                    text += a + ' ';
                }
            }
            msg.channel.send(text);
        },
    },
    'ping': {
        description: 'responds pong, useful for checking if bot is alive',
        process: function(bot, msg, suffix) {
            msg.channel.send( msg.author+' Pong!')
                .then( (message) => {
                    message.edit(
                        message + ' (' + (message.createdTimestamp - msg.createdTimestamp) +' ms.)'
                    );
                })
            ;
            if (suffix) {
                msg.channel.send( 'note that !ping takes no arguments!');
            }
        },
    },
    'idle': {
        usage: '[status]',
        description: 'sets bot status to idle',
        process: function(bot, msg, suffix) {
            bot.user.setStatus('idle');
            bot.user.setGame(suffix);
        },
    },
    'online': {
        usage: '[status]',
        description: 'sets bot status to online',
        process: function(bot, msg, suffix) {
            bot.user.setStatus('online');
            bot.user.setGame(suffix);
        },
    },
    'say': {
        usage: '<message>',
        description: 'bot says message',
        process: function(bot, msg, suffix) {
            msg.channel.send(suffix);
        },
    },
    'announce': {
        usage: '<message>',
        description: 'bot says message with text to speech',
        process: function(bot, msg, suffix) {
            msg.channel.send(suffix, {tts: true});
        },
    },
    'msg': {
        usage: '<user> <message to leave user>',
        description: 'leaves a message for a user the next time they come online',
        process: function(bot, msg, suffix) {
            let args = suffix.split(' ');
            let user = args.shift();
            let message = args.join(' ');
            if (user.startsWith('<@')) {
                user = user.substr(2, user.length-3);
            }
            let target = msg.channel.guild.members.find('id', user);
            if (!target) {
                target = msg.channel.guild.members.find('username', user);
            }
            messagebox[target.id] = {
                channel: msg.channel.id,
                content: target + ', ' + msg.author + ' said: ' + message,
            };
            updateMessagebox();
            msg.channel.send('message saved.');
        },
    },
    'eval': {
        usage: '<command>',
        description: 'Executes arbitrary javascript in the bot process. '
            + 'User must have "eval" permission',
        process: function(bot, msg, suffix) {
            if (Permissions.checkPermission(msg.author, 'eval')) {
                msg.channel.send( eval(suffix, bot));
            } else {
                msg.channel.send( msg.author + ' doesn\'t have permission to execute eval!');
            }
        },
    },
};


try {
    messagebox = require('./messagebox.json');
} catch (e) {
    // no stored messages
    messagebox = {};
}

/**
 * Updates the message box
 */
function updateMessagebox() {
    fs.writeFile(
        './messagebox.json',
        JSON.stringify(messagebox, null, 2),
        (e) => e? console.error(e): 0
    );
}

let bot = new Discord.Client();

bot.on('ready', function() {
    console.log('Logged in! Serving in ' + bot.guilds.array().length + ' servers');
    require('./plugins.js').init();
    console.log('type '+Config.commandPrefix+'help in Discord for a commands list.');
    bot.user.setGame('ayyy!');
});

bot.on('disconnected', function() {
    console.log('Disconnected!');
    process.exit(1); // exit node.js with an error
});

/**
 * Check if a message is a command
 * @param {string} msg the message itself
 * @param {*} isEdit if it is an edit
 */
function checkMessageForCommand(msg, isEdit) {
    // check if message is a command
    if (msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))) {
        console.log('treating ' + msg.content + ' from ' + msg.author + ' as command');
        let cmdTxt = msg.content.split(' ')[0].substring(Config.commandPrefix.length);
        // add one for the ! and one for the space
        let suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1);

        if (msg.isMentioned(bot.user)) {
            try {
                cmdTxt = msg.content.split(' ')[1];
                suffix = msg.content.substring(
                    bot.user.mention().length+cmdTxt.length+Config.commandPrefix.length+1
                );
            } catch (e) { // no command
                msg.channel.send('Yes?');
                return;
            }
        }
        let alias = aliases[cmdTxt];
        if (alias) {
            console.log(
                cmdTxt + ' is an alias, constructed command is ' + alias.join(' ') + ' ' + suffix
            );
            cmdTxt = alias[0];
            suffix = alias[1] + ' ' + suffix;
        }
        let cmd = commands[cmdTxt];
        if (cmdTxt === 'help') {
            // help is special since it iterates over the other commands
            if (suffix) {
                let cmds = suffix.split(' ').filter(function(cmd) {
                    return commands[cmd];
                });
                let info = '';
                for (let i=0; i<cmds.length; i++) {
                    let cmd = cmds[i];
                    info += '**'+Config.commandPrefix + cmd+'**';
                    let usage = commands[cmd].usage;
                    if (usage) {
                        info += ' ' + usage;
                    }
                    let description = commands[cmd].description;
                    if (description instanceof Function) {
                        description = description();
                    }
                    if (description) {
                        info += '\n\t' + description;
                    }
                    info += '\n';
                }
                msg.channel.send(info);
            } else {
                msg.author.send('**Available Commands:**').then(function() {
                    let batch = '';
                    let sortedCommands = Object.keys(commands).sort();
                    for (let i in sortedCommands) {
                        if (!sortedCommands.hasOwnProperty(i)) {
                            break;
                        }
                        let cmd = sortedCommands[i];
                        let info = '**'+Config.commandPrefix + cmd+'**';
                        let usage = commands[cmd].usage;
                        if (usage) {
                            info += ' ' + usage;
                        }
                        let description = commands[cmd].description;
                        if (description instanceof Function) {
                            description = description();
                        }
                        if (description) {
                            info += '\n\t' + description;
                        }
                        let newBatch = batch + '\n' + info;
                        if (newBatch.length > (1024 - 8)) { // limit message length
                            msg.author.send(batch);
                            batch = info;
                        } else {
                            batch = newBatch;
                        }
                    }
                    if (batch.length > 0) {
                        msg.author.send(batch);
                    }
                });
            }
        } else if (cmd) {
            if (Permissions.checkPermission(msg.author, cmdTxt)) {
                try {
                    cmd.process(bot, msg, suffix, isEdit);
                } catch (e) {
                    let msgTxt = 'command ' + cmdTxt + ' failed :(';
                    if (Config.debug) {
                        msgTxt += '\n' + e.stack;
                    }
                    msg.channel.send(msgTxt);
                }
            } else {
                msg.channel.send('You are not allowed to run ' + cmdTxt + '!');
            }
        } else {
            msg.channel.send(cmdTxt + ' not recognized as a command!')
                .then(((message) => message.delete(5000)));
        }
    } else {
        // message isn't a command or is from us
        // drop our own messages to prevent feedback loops
        if (msg.author == bot.user) {
            return;
        }

        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
            msg.channel.send('yes?'); // using a mention here can lead to looping
        }
    }
}

bot.on('message', (msg) => checkMessageForCommand(msg, false));
bot.on('messageUpdate', (oldMessage, newMessage) => {
    checkMessageForCommand(newMessage, true);
});

// Log user status changes
bot.on('presence', function(user, status, gameId) {
    // if(status === "online"){
    // console.log("presence update");
    console.log(user+' went '+status);
    // }
    try {
        if (status != 'offline') {
            if (messagebox.hasOwnProperty(user.id)) {
                console.log('found message for ' + user.id);
                let message = messagebox[user.id];
                let channel = bot.channels.get('id', message.channel);
                delete messagebox[user.id];
                updateMessagebox();
                bot.send(channel, message.content);
            }
        }
    } catch (e) {
        e ? console.log(e):0;
    }
});


exports.addCommand = function(commandName, commandObject) {
    try {
        commands[commandName] = commandObject;
    } catch (err) {
        console.log(err);
    }
};
exports.commandCount = function() {
    return Object.keys(commands).length;
};
if (process.env.bot_token) {
    console.log('logging in with token: ' + process.env.bot_token);
    bot.login(process.env.bot_token);
} else {
    console.log('Logging in with user credentials is no longer supported!\nYou can use token based log in with a user account, see\nhttps://discord.js.org/#/docs/main/master/general/updating');
}

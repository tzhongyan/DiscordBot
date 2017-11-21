exports.commands = [
    'setUsername',
    'log',
    'uptime',
];

let startTime = Date.now();

exports.setUsername = {
    description: 'sets the username of the bot. Note this can only be done twice an hour!',
    process: function(bot, msg, suffix) {
        bot.user.setUsername(suffix);
    },
};

exports.log = {
    usage: '<log message>',
    description: 'logs message to bot console',
    process: function(bot, msg, suffix) {
        console.log(msg.content);
    },
};

exports.uptime = {
    usage: '',
    description: 'returns the amount of time since the bot started',
    process: function(bot, msg, suffix) {
        let now = Date.now();
        let msec = now - startTime;
        console.log('Uptime is ' + msec + ' milliseconds');
        let days = Math.floor(msec / 1000 / 60 / 60 / 24);
        msec -= days * 1000 * 60 * 60 * 24;
        let hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        let mins = Math.floor(msec / 1000 / 60);
        msec -= mins * 1000 * 60;
        let secs = Math.floor(msec / 1000);
        let timestr = '';
        if (days > 0) {
            timestr += days + ' days ';
        }
        if (hours > 0) {
            timestr += hours + ' hours ';
        }
        if (mins > 0) {
            timestr += mins + ' minutes ';
        }
        if (secs > 0) {
            timestr += secs + ' seconds ';
        }
        msg.channel.send('**Uptime**: ' + timestr);
    },
};

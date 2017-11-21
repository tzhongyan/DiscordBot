exports.commands = [
    'leet',
];

let leet = require('leet');

exports.leet = {
    usage: '<message>',
    description: 'converts boring regular text to 1337',
    process: function(bot, msg, suffix) {
        msg.channel.send(leet.convert(suffix));
    },
};

exports.commands = [
    'roll',
];

let d20 = require('d20');

exports.roll = {
    usage: '[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)',
    description: 'roll a die with x sides, or multiple dice using d20 syntax. Default value is 10',
    process: function(bot, msg, suffix) {
        if (suffix.split('d').length <= 1) {
            msg.channel.send(msg.author + ' rolled a ' + d20.roll(suffix || '10'));
        } else if (suffix.split('d').length > 1) {
            let eachDie = suffix.split('+');
            let passing = 0;
            for (let i = 0; i < eachDie.length; i++) {
                if (eachDie[i].split('d')[0] < 50) {
                    passing += 1;
                }
            }
            if (passing == eachDie.length) {
                msg.channel.send(msg.author + ' rolled a ' + d20.roll(suffix));
            } else {
                msg.channel.send(msg.author + ' tried to roll too many dice at once!');
            }
        }
    },
};

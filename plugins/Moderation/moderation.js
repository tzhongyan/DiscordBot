exports.commands = [
    'myid',
];

exports.myid = {
    description: 'returns the user id of the sender',
    process: function(bot, msg) {
        msg.channel.send(msg.author.id);
    },
};



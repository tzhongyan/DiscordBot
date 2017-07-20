exports.commands = [
    "talk"
]

var cleverbot = require("cleverbot-node");
talkbot = new cleverbot;
talkbot.configure({"botapi":"API_GOES_HERE"});

exports.talk = {
    usage: "<message>",
    description: "Talk directly to the bot",
    process: function(bot, msg, suffix) {
        var conv = suffix.split(" ");
        talkbot.write(suffix, function(response) {
            msg.channel.send(response.output);
        })
    }
}

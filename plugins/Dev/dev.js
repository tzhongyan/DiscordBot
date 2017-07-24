exports.commands = [
	"pullanddeploy",
	"myid",
	"userid"
]

//a collection of commands primarily useful for developers

exports.myid = {
	description: "returns the user id of the sender",
	process: function(bot,msg){
		msg.channel.send(msg.author.id);
	}
}

exports.userid = {
	usage: "[user to get id of]",
	description: "Returns the unique id of a user. This is useful for permissions.",
	process: function(bot,msg,suffix) {
		if(suffix){
			var users = msg.channel.guild.members.filter((member) => member.user.username == suffix).array();
			if(users.length == 1){
				msg.channel.send( "The id of " + users[0].user.username + " is " + users[0].user.id)
			} else if(users.length > 1){
				var response = "multiple users found:";
				for(var i=0;i<users.length;i++){
					var user = users[i];
					response += "\nThe id of <@" + user.id + "> is " + user.id;
				}
				msg.channel.send(response);
			} else {
				msg.channel.send("No user " + suffix + " found!");
			}
		} else {
			msg.channel.send( "The id of " + msg.author + " is " + msg.author.id);
		}
	}
}


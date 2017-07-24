exports.commands = [
	"reddit" //uses the RSS code to read subreddits
]

function rssfeed(bot,msg,url,count,full){
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error){
        msg.channel.send("failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable',function() {
        var stream = this;
        shown += 1
        if(shown > count){
            return;
        }
        var item = stream.read();
        msg.channel.send(item.title + " - " + item.link, function() {
            if(full === true){
                var text = htmlToText.fromString(item.description,{
                    wordwrap:false,
                    ignoreHref:true
                });
                msg.channel.send(text);
            }
        });
        stream.alreadyRead = true;
    });
}

exports.reddit = {
	usage: "[subreddit]",
	description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top spot there instead",
	process: function(bot,msg,suffix) {
		var path = "/.rss"
		if(suffix){
			path = "/r/"+suffix+path;
		}
		rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
	}
}

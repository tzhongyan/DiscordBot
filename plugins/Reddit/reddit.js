const htmlToText = require('html-to-text');
const FeedParser = require('feedparser');
const request = require('request');

exports.commands = [
    'reddit',
];

/**
 * Reading RSS feed
 * @param {*} bot
 * @param {*} msg
 * @param {*} url
 * @param {Number} count
 * @param {*} full
 */
function rssFeed(bot, msg, url, count, full) {
    let feedparser = new FeedParser();
    request(url).pipe(feedparser);

    feedparser.on('error', function(error) {
        msg.channel.send('failed reading feed: ' + error);
    });

    let shown = 0;
    feedparser.on('readable', function() {
        let stream = this;
        shown += 1;
        if (shown > count) {
            return;
        }
        let item = stream.read();
        msg.channel.send(item.title + ' - ' + item.link, function() {
            if (full === true) {
                let text = htmlToText.fromString(item.description, {
                    wordwrap: false,
                    ignoreHref: true,
                });
                msg.channel.send(text);
            }
        });
        stream.alreadyRead = true;
    });
}

exports.reddit = {
    usage: '[subreddit]',
    description: 'Returns the top post on reddit. '
        + 'Can optionally pass a subreddit to get the top spot there instead',
    process: function(bot, msg, suffix) {
        let path = '/.rss';
        if (suffix) {
            path = '/r/'+suffix+path;
        }
        rssFeed(bot, msg, 'https://www.reddit.com'+path, 1, false);
    },
};

exports.commands = [
    'wiki',
    'wikilong',
];

let Wiki = require('wikijs');

exports.wiki = {
    usage: '<search terms>',
    description: 'returns the summary of the first matching'
        + 'search result from Wikipedia',
    process: function(bot, msg, suffix) {
        let query = suffix;
        if (!query) {
            msg.channel.send('No such query.');
            return;
        }

        new Wiki().search(query, 1).then(function(data) {
            new Wiki().page(data.results[0]).then(function(page) {
                page.summary().then(function(summary) {
                    let sumText = summary.toString().split('\n');
                    let continuation = function() {
                        let paragraph = sumText.shift() +
                            '\nRead more: ' + page.fullurl;
                        if (paragraph) {
                            msg.channel.send(paragraph, continuation);
                        }
                    };
                    continuation();
                });
            });
        }, function(err) {
            msg.channel.send(err);
        });
    },
};

exports.wikilong = {
    usage: '<search terms>',
    description: 'returns the text of the '
        + 'first matching search result from Wikipedia',
    process: (bot, msg, query) => {
        if (!query) {
            msg.channel.send('No such query');
            return;
        }

        new Wiki().search(query, 1).then( (data) => {
            new Wiki().page(data.results[0]).then( (page) => {
                page.content()
                    .then(
                        // sending full text because it is cool :3
                        (text) => msg.channel.send(text, {split: true})
                    );
            });
        }, function(err) {
            msg.channel.send(err);
        });
    },
};

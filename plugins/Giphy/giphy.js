const qs = require('querystring');

exports.commands = [
    'giphy',
];

let giphyConfig = {
    'api_key': 'dc6zaTOxFJmzC',
    'rating': 'r',
    'url': 'http://api.giphy.com/v1/gifs/random',
    'permission': ['NORMAL'],
};

/**
 * Get the gif
 * @param {string} tags tag of gif
 * @param {function} func callback function
 */
function getGif(tags, func) {
    // limit=1 will only return 1 gif
    let params = {
        'api_key': giphyConfig.api_key,
        'rating': giphyConfig.rating,
        'format': 'json',
        'limit': 1,
    };
    let query = qs.stringify(params);

    if (tags !== null) {
        query += '&tag=' + tags.join('+');
    }

    // wouldnt see request lib if defined at the top for some reason:\
    let request = require('request');
    // console.log(query)
    request(giphyConfig.url + '?' + query, function(error, response, body) {
        // console.log(arguments)
        if (error || response.statusCode !== 200) {
            console.error('giphy: Got error: ' + body);
            console.log(error);
            // console.log(response)
        } else {
            try {
                let responseObj = JSON.parse(body);
                func(responseObj.data.id);
            } catch (err) {
                func(undefined);
            }
        }
    });
}

exports.giphy = {
    usage: '<image tags>',
    description: 'returns a random gif from giphy matching the tags passed',
    process: function(bot, msg, suffix) {
        let tags = suffix.split(' ');
        getGif(tags, function(id) {
            if (typeof id !== 'undefined') {
                msg.channel.send( 'http://media.giphy.com/media/' + id + '/giphy.gif [Tags: ' + (tags ? tags : 'Random GIF') + ']');
            } else {
                msg.channel.send(
                    'Invalid tags, try something different. [Tags: '
                    + (tags ? tags : 'Random GIF') + ']'
                );
            }
        });
    },
};

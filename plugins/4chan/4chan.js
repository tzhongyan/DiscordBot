const rp = require('request-promise');
const htmlToText = require('html-to-text');

exports.commands = [
    '4chan',
];

exports['4chan'] = {
    usage: '<board> <search terms>',
    description: 'looks up a thread on 4chan',
    process: function(bot, msg, suffix) {
        // variable to hold matches
        let matches = [];
        // get board to search
        let board = suffix.split(' ')[0];
        // get search string
        let searchString = suffix.slice(board.length + 1);
        let searchRegex = new RegExp(searchString, 'i');
        // pull the catalog of the board in question
        let restString = 'https://a.4cdn.org/' + board + '/catalog.json';
        let catalog;
        rp(restString)
            .then(function(response) {
                catalog = JSON.parse(response);
                // concatenate threads into one array
                let threads = [];
                for (let i = 0; i < catalog.length; ++i) {
                    threads = threads.concat(catalog[i]['threads']);
                }
                // search thread subjects first
                for (let i = 0; i < threads.length; ++i) {
                    if ((threads[i]['sub'] != null) && (threads[i]['sub'].match(searchRegex))) {
                        matches.push(threads[i]);
                    }
                }
                // did any of the subjects match the search string?
                if (matches.length > 0) {
                    let filepath = 'https://i.4cdn.org/' + board + '/' + matches[0]['tim'] + matches[0]['ext'];
                    let name = matches[0]['name'];
                    let subject = matches[0]['sub'];
                    let comment = (matches[0]['com'] === null) ? '' : matches[0]['com'];
                    let link = 'https://boards.4chan.org/' + board + '/thread/' + matches[0]['no'];
                    let finalMessage = 'Image: ' + filepath
                        + '\nName: ' + name
                        + '\nSubject: ' + subject
                        + '\nComment:\n' + htmlToText.fromString(comment)
                        + '\nLink: ' + link;
                    msg.channel.send(finalMessage, {split: true});
                } else {
                // search thread bodies now
                    for (let i = 0; i < threads.length; ++i) {
                        if ((threads[i]['com'] != null) && (threads[i]['com'].match(searchRegex))) {
                            matches.push(threads[i]);
                        }
                    }
                    // did any of the comments match the search string?
                    if (matches.length > 0) {
                        let filepath = 'https://i.4cdn.org/' + board + '/' + matches[0]['tim'] + matches[0]['ext'];
                        let name = matches[0]['name'];
                        let subject = (matches[0]['sub'] === null) ? '' : matches[0]['sub'];
                        let comment = matches[0]['com'];
                        let link = 'https://boards.4chan.org/' + board + '/thread/' + matches[0]['no'];
                        let finalMessage = 'Image: ' + filepath
                            + '\nName: ' + name
                            + '\nSubject: ' + subject
                            + '\nComment:\n' + htmlToText.fromString(comment)
                            + '\nLink: ' + link;
                        msg.channel.send(finalMessage, {split: true});
                    } else {
                        msg.channel.send('4chan: No matches found.');
                    }
                }
            })
            .catch(function(error) {
                msg.channel.send('4CHAN ERROR: ' + error);
            });
    },
};

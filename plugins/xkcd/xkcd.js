exports.commands = [
    'xkcd',
    'highnoon',
];


exports.xkcd = {
    usage: '[comic number]',
    description: 'displays a given xkcd comic number'
        + '(or the latest if nothing specified',
    process: function(bot, msg, suffix) {
        let show = (err, res, body) => {
            try {
                let comic = JSON.parse(body);
                msg.channel.send(
                    comic.title +'\n'+
                    comic.img + '\n*' +
                    comic.alt +'*'
                );
            } catch (e) {
                msg.channel.send(
                    'Couldn\'t fetch an XKCD for '+suffix);
            }
        };

        let url = 'http://xkcd.com/';
        if (suffix == 'random') {
            require('request')(url+'info.0.json', (err, res, body) => {
                try {
                    let rand = Math.floor(
                        Math.random() * (JSON.parse(body).num +1)
                    );
                    msg.channel.send('Your random xkcd commic: '+rand);
                    url += rand + '/info.0.json';
                    require('request')(url, show);
                } catch (e) {
                    msg.channel.send('Couldn\'t fetch an XKCD for '+suffix);
                }
            });
        } else if (suffix == '') {
            require('request')(url + 'info.0.json', show);
        } else {
            url += suffix + '/info.0.json';
            require('request')(url, show);
        }
    },
};

exports.highnoon = {
    process: (bot, msg, suffix) => {
        require('request')({
            uri: 'http://imgs.xkcd.com/comics/now.png',
            followAllRedirects: true,
        }, (err, resp, body) => msg.channel.send(resp.request.uri.href));
    },
};

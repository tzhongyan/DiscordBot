const Imgflipper = require('imgflipper');
exports.commands = [
    'meme',
];

let AuthDetails = {
    'imgflip_username': process.env.imgflip_username,
    'imgflip_password': process.env.imgflip_password,
};

// https://api.imgflip.com/popular_meme_ids
let meme = {
    'brace': 61546,
    'mostinteresting': 61532,
    'fry': 61520,
    'onedoesnot': 61579,
    'yuno': 61527,
    'success': 61544,
    'allthethings': 61533,
    'doge': 8072285,
    'drevil': 40945639,
    'skeptical': 101711,
    'notime': 442575,
    'yodawg': 101716,
    'awkwardpenguin': 61584,
};

exports.meme = {
    usage: 'meme "top text" "bottom text"',
    description: function() {
        let str = 'Currently available memes:\n';
        for (let i=0; i<meme.length; i++) {
            str += '\t\t' + meme[i] + '\n';
        }
        return str;
    },
    process: function(bot, msg, suffix) {
        let tags = msg.content.split('"');
        let memetype = tags[0].split(' ')[1];
        // msg.channel.send(tags);
        let imgflipper = new Imgflipper(
            AuthDetails.imgflip_username,
            AuthDetails.imgflip_password
        );
        imgflipper.generateMeme(
            meme[memetype],
            tags[1]?tags[1]:' ',
            tags[3]?tags[3]:' ',
            function(err, image) {
                // console.log(arguments);
                if (err) {
                    let m = 'Unable to generate meme. '
                    + 'Usage: `/meme [meme type] "[upper text]" "[lower text]"'
                    + '`\nFor available meme types, run `/help meme`';
                    msg.channel.send(m);
                } else {
                    msg.channel.send(image);
                }
            }
        );
    },
};

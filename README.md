# DiscordBot
A chat bot for discord app based off [discord.js](https://github.com/hydrabolt/discord.js/)

# Features:
Try !!help to get a full list of available commands

# Installation
Once you have node installed running `yarn install`(recommended) or `npm install` from the bot directory should install all the needed packages. If this command prints errors the bot won't work!

1. Install [nodeJS](https://nodejs.org/en/download/).
2. Install [yarn](https://yarnpkg.com/lang/en/docs/install/) (optional).
3. Install required modules by `yarn install` (recommended) **or** `npm install`.
4. Clone `.env.example` as `.env`.
5. Open up `.env` file and key in your API keys and login authentications.
**DO NOT UPLOAD YOUR .env FILE TO ANYWHERE PUBLIC**

## Special instructions for setting up google search and youtube APIs:

(thanks @SchwererKonigstiger)

1) Create a Custom Search at: https://cse.google.com/cse/create/new

2) Leave the first line blank, and name the search engine anything you wish.

3) Click "Advanced Options" and then type ImageObject.

4) Hit create.

5) On this new page, enable the Image Search in the menu.

6) Then press "Search engine ID" under the Details header.

7) Copy this into the `.env` file under the `google_custom_search` section.

Make sure you also have your google server API key, which goes in the "youtube_api_key" section, or the search will fail.

# Running
## Deploy on Heroku
This repositary has a `Procfile` for running on Heroku, and the offer PAAS for fee each month (･∀･)

1. Create new heroku app `heroku create`
2. Push your environment file: `heroku config:push`
3. Push your git files: `git push heroku master`
4. Give it some time to build, and run your application by `heroku ps:scale bot=1`.

There might be another part of application running on web, it will timeout after some time, or you can stop it by `heroku ps:scale web=0`

## Running on local machine 
To start the bot just run `npm start`.

# Updates
If you update the bot, please run `yarn upgrade` before starting it again. If you have
issues with this, you can try deleting your node_modules folder and then running
`yarn install` again. Please see [Installation](#Installation).

# Known Problems
- Music player is bugged, will likely to cause crashing of the bot.

# Help
Please check github [issues page](https://github.com/chalda/DiscordBot/issues) on this project. We get a lot of the same questions, its very likely yours has already been answered. And yes we need to roll those into an official FAQ.

If you still need help join us on [discord](https://discord.gg/m29GJBN).

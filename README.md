# SpaceBot - TwitchBot Framework
This is a Twitch bot framework written in NodeJS, using the Twitch Messaging Interface. The purpose of this framework is to allow you to easily create commands (with permissions) and subscribe to chat events.

![alt text](https://i.imgur.com/ehHCsCW.png)

## Requirements
The following modules are required for this bot: underscore, tmi, figlet. You can install them like so:

```
npm install tmi
npm install figlet
npm install underscore
```

## Getting Started
This project assumes you have a working and upto-date installation of NodeJS. You will also need a Twitch account to login to, as well as the OAuth token (not password) for the account. You can generate your OAuth token here: https://twitchapps.com/tmi/

You need to update settings.json with your account and channel details.

### Channels
Edit the settings.json file with your channels. There is a filesystem watcher on this file, any changes to the channels array will JOIN or LEAVE whilst the bot is running. Handy if you want to add more channels and wan't no downtime.

### Example Commands
* !spacex - Returns the last mission details from their API. Example of a JSON GET request and parsing the data back into chat.
```
function onSpaceX(channel, userstate, params) {
  https.get("https://api.spacexdata.com/v3/launches/latest", function(res){
    var body = '';
    res.on('data', function(chunk){ body += chunk;});
    res.on('end', function(){
        var data = JSON.parse(body);
         client.say(channel, `Last mission was ${data.mission_name} flight ${data.flight_number} it was a ${data.rocket.rocket_name} and launched from ${data.launch_site.site_name_long} on ${data.launch_date_local}`);
    });
  }).on('error', function(e){
        client.say(channel, "Unable to contact SpaceX API.");
  });
}
```
* !ping - Returns simple chat text reply of "PONG"
* !rand [x] - Returns a random number between the range specified, default range: 1-100. This is an example of using the parameters; default is 100.

## Editing the code
You will need to edit the username, password and channels array for the code to run. You can create a new command by:

* Modifying the settings.json file with your account and channel information.
* Creating the function for the command.

### Starting the bot
```node bot.js```

### Command Array
```
        ping: {
            responder: 'ping',
            calls: 'onPing',
            permission: ['broadcaster', 'moderator', 'subscriber', 'viewer']
            delay: 1000 //Optional: value in ms.
        },
```
### Related Function
```
function onPing(channel, userstate, params) {
    client.say(channel, `@${userstate.username} PONG!`);
}
```

All command functions are passed three parameters, the channel that the command was called in. The TMI userstate object, which contains things such as mod, sub, broadcaster status etc. and the parameters the user passed in, e.g. !ping 1 2 3 would pass in an array of 1,2,3 as the third parameter.

### TMI (Twitch Messaging Interface) Events
Example of how to use an event is included:
```
client.on("raided", (channel, username, viewers) => {
  d_console(`Channel ${channel} is being raided by ${username} with ${viewers} viewers.`, 'c');
});
```
See the TMI documentation on how to use the rest of them.: https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2

## Features
* Quickly add commands with permissions.
* Hook TMI events and perform actions.
* Add delays to commands (non-verified Bot 800ms delay needed)
* Detect chat text/commands and output to console.
* Grab command parameters and pass them into the required command (command parser)
* JOIN and LEAVE channels without restarting the bot.
* Command permissions based on broadcaster, subscriber, moderator, viewer
* Command permissions based on users.
* Organised files.

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

### Example Commands
* !spacex - Returns the last mission details from their API. Example of a JSON GET request.
* !ping - Returns simple chat text "PONG"
* !rand [x] - Returns a random number between the range specified, default range: 1-100

## Editing the code
You will need to edit the username, password and channels array for the code to run. You can create a new command by:

* Modifying the cmds array and adding your command.
* Creating the function for the command.

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

## Features
* Quickly add commands with permissions.
* Hook TMI events and perform actions.
* Add delays to commands (non-verified Bot 800ms delay needed)
* Detect chat text/commands and create macros.
* Grab command parameters and pass them into the required command (command parser)

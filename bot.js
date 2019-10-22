/**
 * Requirements.
 * npm install tmi
 * npm install underscore
 */
const tmi = require('tmi.js');
const _ = require('underscore');

/**
 * Options for connecting to Twitch.
 * Username: Chat username
 * Password: OAuth Generated Token. e.g. oauth:12345678abcdefgh
 */
const opts = {
  identity: {
    username: "FILL ME IN",
    password: "FILL ME IN"
  },
  channels: [
    "stevemac555",
  ]
};

/**
 * Command settings. 
 * responder: Chat command to use to call it.
 * calls: Method to call, e.g. ping(channel, username, params) 
 * permission: Who can use the command in chat. moderator, subscriber, viewer
 */
const cmds = {
    prefix: '!',
    commands: {
        ping: {
            responder: 'ping',
            calls: 'onPing',
            permission: 'viewer'
        }
    }
}

/**
 * Create connection to Twitch.
 */
const client = new tmi.client(opts);

/**
 * Register needed event handlers:
 * TMI docs: https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2
 */
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
client.on('roomstate', onChannelJoinedHandler);
client.connect();

/**
 * Received a message from Twitch.
 * 
 * @param {*} channel 
 * @param {*} userstate 
 * @param {*} msg 
 * @param {*} self 
 */
function onMessageHandler (channel, userstate, msg, self) {
  if (self) { return; }

  if (msg.trim().charAt(0) == cmds.prefix) {
      var params = msg.trim().split(' ');
      _.each(cmds.commands, function (v, k) {
        if ((cmds.prefix + v.responder) == params[0]) {
            switch (v.permission) {
                case 'moderator':
                    if (userstate.mod) {
                        eval(v.calls)(channel, userstate.username, params);
                    }
                break;
                case 'subscriber':
                        if (userstate.subscriber) {
                            eval(v.calls)(channel, userstate.username, params);
                        }
                break;
                default:
                    eval(v.calls)(channel, userstate.username, params);   
                break;
            }
            console.log(`> Processed command: ${cmds.prefix}${v.responder} from ${userstate.username} permission: ${v.permission}.`)
        }
      });
  }
}

/**
 * Client has joined a channel.
 * 
 * @param {*} channel 
 * @param {*} state 
 */
function onChannelJoinedHandler(channel, state) {
    console.log(`> Joined channel: ${channel}`);
}

/**
 * Client has disconnected from the server.
 * 
 * @param {*} reason 
 */
function onDisconnectedHandler(reason) {
    console.log(`> Disconnected from server, reason: ${reason}`);
}

/**
 * Client has connected to the server.
 * 
 * @param {*} addr 
 * @param {*} port 
 */
function onConnectedHandler (addr, port) {
    console.log('\033[2J');
    console.log(`> Connected to: ${addr}:${port}`);
}

/**
 * Test PING command. 
 * @param {*} channel 
 * @param {*} username 
 * @param {*} params 
 */
function onPing(channel, username, params) {
    client.say(channel, `@${username} PONG..`);
}

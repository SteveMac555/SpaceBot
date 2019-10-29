const tmi = require('tmi.js');
const _ = require('underscore');
const https = require('https');
const fs = require('fs');
const tools = require('./tools');

var settings = JSON.parse(fs.readFileSync('settings.json'));
const client = new tmi.client(settings);

const cmds = {
    prefix: '!',
    delay_default: 500,
    commands: {
        ping: {
          responder: 'ping',
          calls: 'onPing',
          permission: ['broadcaster', 'moderator'],
          user_allow: ['stevemac555'],
          delay: 600
        },
        rand: {
          responder: 'rand',
          calls: 'onRand',
          permission: ['broadcaster'],
          delay:1000,
        },
        spacex: {
          responder: 'spacex',
          calls: 'onSpaceX',
          permission: ['broadcaster', 'moderator', 'subscriber', 'viewer'],
          delay: 800,
        }
    }
}

tools.startup();
client.connect();

client.on("connecting", (address, port) => {
  tools.d_console(`Attempting to connect to ${address}:${port}`, 'y');
});

client.on("connected", (address, port) => {
  tools.d_console(`Connected to: ${address}:${port}`, 'y');
});

client.on("logon", () => {
  tools.d_console(`Connection established: Logging In...`, 'y');
});

client.on("mods", (channel, mods) => {
  tools.d_console(`Moderators of ${channel} are ${mods}`, 'g');
});

client.on("raided", (channel, username, viewers) => {
  tools.d_console(`Channel ${channel} is being raided by ${username} with ${viewers} viewers.`, 'c');
});

client.on("message", (channel, userstate, msg, self) => {
  if (self) return;

  switch(userstate["message-type"]) {
    case "chat":
      tools.d_console(`[CHAT] ${userstate.username}: ${msg}`, 'm');
    break;
    case "whisper":
      tools.d_console(`[WHISPER] ${userstate.username}: ${msg}`, 'm');
    break;
}
    
  if (msg.trim().charAt(0) == cmds.prefix) {
    var params = msg.trim().split(' ');
    var userPermission = (userstate.badges.broadcaster ? `broadcaster` : (userstate.mod ? `moderator` : (userstate.subscriber ? `subscriber` : `viewer`)));
    _.each(cmds.commands, function (v, k) {
      if ((cmds.prefix + v.responder) == params[0]) {
        if (v.permission.indexOf(userPermission) > -1 || v.user_allow.indexOf(userstate.username) > -1) {
          setTimeout(function() {
            eval(v.calls)(channel, userstate, params);
          }, (v.delay ? v.delay : cmds.delay_default));
          tools.d_console(`Processed command: ${cmds.prefix}${v.responder} from ${userstate.username}.`, 'c');
        } else {
          tools.d_console(`Denied command: ${cmds.prefix}${v.responder} from ${userstate.username}. User Permission: ${userPermission} Required Permission: ${v.permission}`, 'r')
        }
      }
    });
  }
});

client.on("roomstate", (channel, state) => {
  tools.d_console(`Joined channel: ${channel}`, 'g');
  client.say(channel, "/mods", 'y');
});

client.on("disconnected", (reason) => {
  tools.d_console(`Disconnected from server, reason: ${reason}`, 'r');
});

function onPing(channel, userstate, params) {
    client.say(channel, `@${userstate.username} PONG!`);
}

fs.watchFile('settings.json', (curr, prev) => {
  const newSettings = JSON.parse(fs.readFileSync('settings.json'));
  var newChannels = newSettings.channels;
  var oldChannels = settings.channels;

  _.each(newChannels, function (newChannel) {
    if (oldChannels.indexOf(newChannel) == -1) {
      tools.d_console("Channel Added. Joining: " + newChannel, 'g');
      client.join(newChannel);
    }
  });

  _.each(oldChannels, function (oldChannel) {
    if (newChannels.indexOf(oldChannel) == -1) {
      tools.d_console("Channel Removed. Leaving: " + oldChannel, 'g');
      client.part(oldChannel);
    }
  });

  settings = JSON.parse(fs.readFileSync('settings.json'));
});

function onRand(channel, userstate, params) {
  client.say(channel, `@${userstate.username} You rolled a ${ Math.round(Math.random() * ((isNaN(params[1]) ? 100 : params[1]) - 1) + 1)}`);
}

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

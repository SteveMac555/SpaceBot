const tmi = require('tmi.js');
const _ = require('underscore');
const https = require('https');
const figlet = require("figlet");

const client = new tmi.client({
  identity: {
    username: "USERNAME",
    password: "oauth:12345678902134454545"
  },
  connection: {
    reconnect: true,
  },
  channels: [
    "stevemac555",
  ]
});

const cmds = {
    prefix: '!',
    commands: {
        ping: {
            responder: 'ping',
            calls: 'onPing',
            permission: ['broadcaster', 'moderator', 'subscriber', 'viewer']
        },
        rand: {
            responder: 'rand',
            calls: 'onRand',
            permission: ['broadcaster'],
            delay: 2000
        },
        spacex: {
          responder: 'spacex',
          calls: 'onSpaceX',
          permission: ['broadcaster', 'moderator', 'subscriber', 'viewer'],
          delay: 5000,
        }
    }
}

client.connect();
console.log('\033[2J');
figlet('SPACEBOT', function(err, data) {
  if (err) {
      console.log('Something went wrong...', err);
  }else{
      console.log(data);
  }
}); 

client.on("connecting", (address, port) => {
  d_console(`Attempting to connect to ${address}:${port}`, 'y');
});

client.on("connected", (address, port) => {
  d_console(`Connected to: ${address}:${port}`, 'y');
});

client.on("logon", () => {
  d_console(`Connection established: Logging In...`, 'y');
});

client.on("mods", (channel, mods) => {
  d_console(`Moderators of ${channel} are ${mods}`, 'g');
});

client.on("raided", (channel, username, viewers) => {
  d_console(`Channel ${channel} is being raided by ${username} with ${viewers} viewers.`, 'c');
});

client.on("message", (channel, userstate, msg, self) => {
  if (self) return;
  if (msg.trim().charAt(0) == cmds.prefix) {
    var params = msg.trim().split(' ');
    var userPermission = (userstate.badges.broadcaster ? `broadcaster` : (userstate.mod ? `moderator` : (userstate.subscriber ? `subscriber` : `viewer`)));
    _.each(cmds.commands, function (v, k) {
      if ((cmds.prefix + v.responder) == params[0]) {
        if (v.permission.indexOf(userPermission) > -1) {
          setTimeout(function() {
            eval(v.calls)(channel, userstate, params);
          }, (v.delay ? v.delay : 1000));
          d_console(`Processed command: ${cmds.prefix}${v.responder} from ${userstate.username}. User Permission: ${userPermission}`, 'c');
        } else {
          d_console(`Denied command: ${cmds.prefix}${v.responder} from ${userstate.username}. User Permission: ${userPermission} Required Permission: ${v.permission}`, 'r')
        }
      }
    });
  }
});

client.on("roomstate", (channel, state) => {
  d_console(`Joined channel: ${channel}`, 'g');
  client.say(channel, "/mods", 'y');
});

client.on("disconnected", (reason) => {
  d_console(`Disconnected from server, reason: ${reason}`, 'r');
});

function onPing(channel, userstate, params) {
    client.say(channel, `@${userstate.username} PONG!`);
}

function onRand(channel, userstate, params) {
  var max = params[1];
  if (isNaN(max)) { max = 100; }
  client.say(channel, `@${userstate.username} You rolled a ${ Math.round(Math.random() * (max - 1) + 1)}`);
}

function onSpaceX(channel, userstate, params) {
  https.get("https://api.spacexdata.com/v3/launches/latest", function(res){
    var body = '';
    res.on('data', function(chunk){ body += chunk;});
    res.on('end', function(){
        var data = JSON.parse(body);
         client.say(channel, "Last mission was " + data.mission_name + " flight " + 
                    data.flight_number + " it was a " + data.rocket.rocket_name + 
                    " and launched from " + data.launch_site.site_name_long + " on " 
                    + data.launch_date_local
          );
    });
  }).on('error', function(e){
        client.say(channel, "Unable to contact SpaceX API.");
  });
}

function d_console(msg, c) {
  var prepend = '';
  switch(c) {
    case 'y':
      prepend = '\x1b[33m';
    break;
    case 'c':
      prepend = '\x1b[36m';
    break;
    case 'g':
      prepend = '\x1b[32m';
    break;
    case 'r':
      prepend = '\x1b[31m';
    break;
    default:
      prepend = '\x1b[37m';
    break;
  }
  console.log (prepend, "[" + new Date().toLocaleString() + "] > " + msg);
}

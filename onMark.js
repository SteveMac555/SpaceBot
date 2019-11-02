const sb = require('../core/sb');
const https = require('https');
const webhook = require("webhook-discord");
const hook = new webhook.Webhook("<snip>");

function onMark(channel, userstate, params) {
    const options = {
     hostname: 'api.twitch.tv',
     port: 443,
     path: '/helix/videos?user_id=' + userstate['room-id'] + '&first=1&type=archive', 
     method: 'GET',
     headers: {
        Authorization: `Bearer ${sb.settings.identity.token}`
    },
   }
         
   const req = https.request(options, (response) => {    
     var data = ''
     response.on('data', function (chunk) {
       data += chunk;
     });
   
     response.on('end', function () {
       params.shift();
       var usermsg = params.join(' ');
       var d = JSON.parse(data);
       var url = d.data[0]['url'] + '?t=' + d.data[0].duration;
       var thumb = d.data[0]['thumbnail_url'];
       thumb = thumb.replace('%{width}', '550');
       thumb = thumb.replace('%{height}', '350');

       const msg = new webhook.MessageBuilder()
       .setName("VOD Marker")
       .setColor("#ffff00")
       .setText(" ")
       .addField("Created by: ", userstate.username)
       .addField("Mark Message: ", usermsg)
       .addField("Marker URL: ", url)
       .setImage(thumb)
       .setTime();
        hook.send(msg);
        sb.client.say(channel, `@${userstate.username} a marker has been saved at ${d.data[0].duration}.`);
       console.log("User: " + userstate.username + " URL: " + url + " Msg: " + usermsg);
     });
   })
   req.end()
 }

module.exports = { 
    onMark
};  

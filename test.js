var Discord = require('discord.js');

var email = process.env.DISCORD_EMAIL;
var password = process.env.DISCORD_PASSWORD;
console.log('EMAIL:', email);
console.log('PASSWORD:', password);

var mybot = new Discord.Client();

mybot.on('message', function(message) {
  if (message.content === 'ping') {
    mybot.reply(message, 'pong');
  }
});

mybot.login(email, password);

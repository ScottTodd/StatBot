// Run under node.js.

var Discord = require('discord.js');

// Gets email and password from environment variables.
var email = process.env.DISCORD_EMAIL;
var password = process.env.DISCORD_PASSWORD;
if (!email) {
  console.log('DISCORD_EMAIL environment variable not set. Exiting.');
  process.exit();
}
if (!password) {
  console.log('DISCORD_PASSWORD environment variable not set. Exiting.');
  process.exit();
}

var botClient = new Discord.Client();

botClient.on('message', function(message) {
  if (message.content === 'ping') {
    botClient.reply(message, 'pong');
  }
});

botClient.login(email, password)
    .then(() => { console.log('Login succeeded, running.'); })
    .catch((error) => {
      if (error['response'] && error['response']['error'] &&
          error['response']['error']['text']) {
        console.log('Login failed, error:', error.response.error.text);
      } else {
        console.log('Login failed, error:', error);
      }
    });

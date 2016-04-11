"use strict";

// Run under node.js like ``node statbot.js``. See the README for more info.


var Discord = require('discord.js');
var Xray = require('x-ray');

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
var x = Xray();

function parseStatsCommand(messageContent) {
  // Find an alphanumeric name after ``--stats``.
  // This is probably terrible (injection) and needs more validation
  // since we'll be passing it to a URL. Also error checking would be nice here.
  var matches = messageContent.match(/\-\-stats\s(\w*)/);
  var user = matches[1];
  return user;
}

function scrapePage(url) {
  return new Promise(function(resolve, reject) {
    x(url, '.characterInfo')(function(error, obj) {
      if (error) {
        reject(error);
      } else {
        resolve(obj);
      }
    });
  });
}

function parseScrapedObject(obj, statString) {
  statString = statString.replace(/\s/g, '');
  var regexp = new RegExp(statString + "([0-9]*)");
  var result = regexp.exec(obj);
  if (!result) {
    console.error('Regex failed to find statstring.');
    return null;
  }
  var match = result[1];
  console.log('Match for ' + statString + ': ' + match);
  return match;
}

function buildStatMessage(obj, statString) {
  var statValue = parseScrapedObject(obj, statString);
  if (statValue === null) {
    return '';
  }
  return '\n' + statString + ': ' + statValue;
}

function buildResponseToStatRequest(user) {
  console.log('Got username from stats command:', user);

  // Might need to do something fancier here if they block automated traffic.
  var url = 'http://na-bns.ncsoft.com/ingame/bs/character/profile?c=' + user;

  return new Promise(function(resolve, reject) {
    scrapePage(url)
        .then((obj) =>
              {
                var cleanedObj = obj.replace(/\s/g, '');

                var response = 'Stats for user \"' + user + '\":';

                var stats = [
                  'Attack Power',
                  'Evolved Attack Rate',
                  'Piercing',
                  'Accuracy',
                  'Concentration',
                  'Critical Hit',
                  'Critical Damage',
                  'Mastery Level',
                  'Additional Damage',
                  'Threat',
                  'Flame Damage',
                  'Frost Damage',
                ];

                for (var i = 0; i < stats.length; ++i) {
                  response += buildStatMessage(cleanedObj, stats[i]);
                }

                resolve(response);
              })
        .catch((error) => {
          console.error('Error scraping page:', error);
          reject('Failed to scrape the page.');
        });
  });
}

botClient.on('message', function(message) {
  if (message.content.startsWith('--stats')) {
    botClient.reply(message, 'Searching, gimmie a sec...');

    console.log('Stats command received, parsing...');
    var user = parseStatsCommand(message.content);

    buildResponseToStatRequest(user).then((response) => {
      botClient.reply(message, response);
      console.log('Replied with stats for user \"' + user + '\"');
    }).catch((error) => { console.error('Error building response:', error); });
  }
});

botClient.login(email, password)
    .then(() => { console.log('Login succeeded, running.'); })
    .catch((error) => {
      if (error['response'] && error['response']['error'] &&
          error['response']['error']['text']) {
        console.error('Login failed, error:', error.response.error.text);
      } else {
        console.error('Login failed, error:', error);
      }
    });

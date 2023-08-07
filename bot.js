const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require('discord.js')
const axios = require('axios');
const config = require('./config.json');
const imgurClientId = config.imgurClientId;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  if (!message.author.bot) {
    const args = message.content.toLowerCase().split(' ');

    if (args[0] === '!image' && args.length > 1) {
      const searchTerm = args.slice(1).join(' ');
      const imageUrl = await fetchImageFromWeb(searchTerm);

      if (imageUrl) {
        message.channel.send(`Here's an image related to "${searchTerm}": ${imageUrl}`);
      } else {
        message.channel.send(`No images found for "${searchTerm}".`);
      }
    }
  }
});

async function fetchImageFromWeb(searchTerm) {
  try {
    const googleSearchResults = await searchGoogleImages(searchTerm, config.googleCustomSearchEngineId, config.googleApiKey);
    const imgurSearchResults = await searchImgurImages(searchTerm, imgurClientId);

    const allSearchResults = [...googleSearchResults, ...imgurSearchResults];

    if (allSearchResults.length > 0) {
      const randomIndex = Math.floor(Math.random() * allSearchResults.length);
      return allSearchResults[randomIndex];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching image:', error.message);
    return null;
  }
}

async function searchGoogleImages(searchTerm, customSearchEngineId, apiKey) {
  const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
    params: {
      q: searchTerm,
      cx: customSearchEngineId,
      key: apiKey,
      searchType: 'image',
    },
  });

  return response.data.items.map((item) => item.link);
}

async function searchImgurImages(searchTerm, clientId) {
  const response = await axios.get('https://api.imgur.com/3/gallery/search', {
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    params: {
      q: searchTerm,
    },
  });

  return response.data.data.map((item) => item.link);
}

client.login(config.discordToken);
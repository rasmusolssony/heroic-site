const AWS = require('aws-sdk');
const { default: axios } = require('axios');
const { error, group } = require('console');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  try {
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight' }),
      };
    }

    // Validate event.body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const {
      rsn,
      discordName,
      country,
      timeZone,
      alts,
      reason,
      clanHistory,
      referral,
    } = JSON.parse(event.body);

    // Basic input validation
    if (
      !rsn ||
      !discordName ||
      !country ||
      !timeZone ||
      !alts ||
      !reason ||
      !referral
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // // Validate Discord ID (numeric)
    // if (!/^\d+$/.test(discordName)) {
    //   return {
    //     statusCode: 400,
    //     headers: corsHeaders,
    //     body: JSON.stringify({ message: 'Invalid Discord ID format' })
    //   };
    // }

    let playerData;
    try {
      const playerResponse = await axios.get(
        `https://api.wiseoldman.net/v2/players/${encodeURIComponent(rsn)}`
      );
      playerData = playerResponse.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'RSN not found on Wise Old Man' }),
        };
      }
      throw error;
    }

    let nameChanges;
    try {
      const nameChangesResponse = await axios.get(
        `https://api.wiseoldman.net/v2/names\?username\=${encodeURIComponent(rsn)}`
      );
      nameChanges = nameChangesResponse.data.map(
        (change) => `${change.oldName} -> ${change.newName}`
      );
    } catch (error) {
      nameChanges = ['No name changes found'];
    }

    let clans = [];
    try {
      const competitionsResponse = await axios.get(
        `https://api.wiseoldman.net/v2/players/${encodeURIComponent(rsn)}/competitions`
      );
      clans = [
        ...new Set(
          competitionsResponse.data
            .filter((comp) => !!comp.competition.group)
            .map((comp) => comp.competition.group.name)
        ),
      ];
    } catch (error) {
      console.error('Error fetching groups: ', error);
      // Continue without groups if the API call fails (TODO: Maybe change in future)
    }

    const params = {
      TableName: 'HeroicApplications',
      Item: {
        id: uuidv4(),
        rsn,
        discordName,
        country,
        timeZone,
        alts,
        reason,
        clanHistory,
        referral,
        nameChanges,
        clans,
        combatLevel: playerData.combatLevel,
        totalLevel: playerData.latestSnapshot.data.skills.overall.level,
        build: playerData.build,
        lastActive: playerData.lastChangedAt,
        timestamp: new Date().toISOString(),
      },
    };
    
    await dynamoDB.put(params).promise();
    console.log(discordName)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const embed = {
        title: 'New Clan Application',
        color: 0x00FF00,
        fields: [
          { name: 'OSRS Name', value: rsn, inline: true },
          { name: 'Discord Name', value: discordName, inline: true },
          { name: 'Country', value: country, inline: true },
          { name: 'Time Zone', value: timeZone, inline: true },
          { name: 'Alts', value: alts.substring(0, 1024) || 'None' },
          { name: 'Reason', value: reason.substring(0, 1024) || 'None' },
          { name: 'Clan History (User Input)', value: clanHistory.substring(0, 1024) || 'None' },
          { name: 'Referral', value: referral || 'None', inline: true },
          { name: 'WOM INFO BELOW', value: 'WOM INFO BELOW'},
          { name: 'Name Changes', value: nameChanges.join('\n')},
          { name: 'Clans', value: clans.toString(), inline: true },
          { name: 'Combat Level', value: playerData.combatLevel, inline: true },
          { name: 'Total Level', value: playerData.latestSnapshot.data.skills.overall.level, inline: true },
          { name: 'Account Type', value: playerData.build, inline: true },
          { name: 'Last Active', value: new Date(playerData.lastChangedAt).toISOString().split('T')[0], inline: true },
          { name: 'Submitted', value: new Date().toISOString().split('T')[0], inline: true },
        ],
        footer: { text: `Application ID: ${params.Item.id}` }
      };

      await axios.post(webhookUrl, {
        content: '<1286613273357058118> New application submitted!',
        embeds: [embed]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout:5000
      });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Application submitted successfully' }),
    };
  } catch (error) {
    console.error('Error: ', error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Failed to submit application', error: error.message }),
    };
  };
};

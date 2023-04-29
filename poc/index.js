const superagent = require("superagent");

main();

async function main() {
  try {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_ARTIST_ID } =
      getEnvironmentVariables();

    const accessToken = await getAccessToken(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET
    );
    const artist = await getArtist(accessToken, SPOTIFY_ARTIST_ID);

    console.log(artist);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function getEnvironmentVariables() {
  require("dotenv").config();

  if (!process.env.SPOTIFY_CLIENT_ID) {
    throw new Error("Missing SPOTIFY_CLIENT_ID");
  }

  if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing SPOTIFY_CLIENT_SECRET");
  }

  if (!process.env.SPOTIFY_ARTIST_ID) {
    throw new Error("Missing SPOTIFY_ARTIST_ID");
  }

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_ARTIST_ID } =
    process.env;

  return {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_ARTIST_ID,
  };
}

async function getAccessToken(clientID, clientSecret) {
  const response = await superagent
    .post("https://accounts.spotify.com/api/token")
    .send("grant_type=client_credentials")
    .send(`client_id=${clientID}`)
    .send(`client_secret=${clientSecret}`);

  if (response.status !== 200) {
    throw new Error("Cannot get access token");
  }

  return response.body.access_token;
}

async function getArtist(accessToken, artistID) {
  const response = await superagent
    .get(`https://api.spotify.com/v1/artists/${artistID}`)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get artist");
  }

  return response.body;
}

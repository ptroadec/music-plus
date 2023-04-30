const superagent = require("superagent");

const SPOTIFY_ENDPOINT_MY_PLAYLISTS =
  "https://api.spotify.com/v1/me/playlists?limit=50";
const SPOTIFY_ENDPOINT_MY_TOP_TRACKS =
  "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50";
const SPOTIFY_ENDPOINT_MY_TOP_ARTISTS =
  "https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50";
const SPOTIFY_ENDPOINT_MY_FOLLOWED_ARTISTS =
  "https://api.spotify.com/v1/me/following?type=artist&limit=50";

main();

async function main() {
  try {
    const { SPOTIFY_USER_ACCESS_TOKEN } = getEnvironmentVariables();

    const [playlists, topTracks, topArtists, followedArtists] =
      await Promise.all([
        getUserPlaylists(SPOTIFY_USER_ACCESS_TOKEN),
        getUserTopTracks(SPOTIFY_USER_ACCESS_TOKEN),
        getUserTopArtists(SPOTIFY_USER_ACCESS_TOKEN),
        getUserFollowedArtists(SPOTIFY_USER_ACCESS_TOKEN),
      ]);

    console.log(
      "playlists",
      playlists.items.map((i) => i.name)
    );
    console.log(
      "top tracks",
      topTracks.items.map((i) => i.name)
    );
    console.log(
      "top artists",
      topArtists.items.map((i) => i.name)
    );
    console.log(
      "followed artists",
      followedArtists.artists.items.map((i) => i.name)
    );
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function getEnvironmentVariables() {
  require("dotenv").config();

  if (!process.env.SPOTIFY_USER_ACCESS_TOKEN) {
    throw new Error("Missing SPOTIFY_USER_ACCESS_TOKEN");
  }

  return {
    SPOTIFY_USER_ACCESS_TOKEN: process.env.SPOTIFY_USER_ACCESS_TOKEN,
  };
}

async function getUserPlaylists(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_PLAYLISTS)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user playlists");
  }

  return response.body;
}

async function getUserTopTracks(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_TOP_TRACKS)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user top tracks");
  }

  return response.body;
}

async function getUserTopArtists(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_TOP_ARTISTS)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user top artists");
  }

  return response.body;
}

async function getUserFollowedArtists(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_FOLLOWED_ARTISTS)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user followed artists");
  }

  return response.body;
}

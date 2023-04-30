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

    console.log("PLAYLISTS");
    for (const [index, playlist] of playlists.entries()) {
      console.log(`${index + 1} - ${playlist.name}`);
    }
    console.log();

    console.log("TOP TRACKS");
    for (const [index, track] of topTracks.entries()) {
      console.log(`${index + 1} - ${track.name}`);
    }
    console.log();

    console.log("TOP ARTISTS");
    for (const [index, artist] of topArtists.entries()) {
      console.log(`${index + 1} - ${artist.name}`);
    }
    console.log();

    console.log("FOLLOWED ARTISTS");
    for (const [index, artist] of followedArtists.entries()) {
      console.log(`${index + 1} - ${artist.name}`);
    }
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
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_PLAYLISTS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user playlists");
    }

    items = [...items, ...response.body.items];
    next = response.body.next;
  } while (next);

  return items;
}

async function getUserTopTracks(accessToken) {
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_TOP_TRACKS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user top tracks");
    }

    items = [...items, ...response.body.items];
    next = response.body.next;
  } while (next);

  return items;
}

async function getUserTopArtists(accessToken) {
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_TOP_ARTISTS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user top artists");
    }

    items = [...items, ...response.body.items];
    next = response.body.next;
  } while (next);

  return items;
}

async function getUserFollowedArtists(accessToken) {
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_FOLLOWED_ARTISTS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user followed artists");
    }

    items = [...items, ...response.body.artists.items];
    next = response.body.artists.next;
  } while (next);

  return items;
}

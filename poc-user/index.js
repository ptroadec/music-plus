const superagent = require("superagent");

const SPOTIFY_ENDPOINT_MY_PLAYLISTS =
  "https://api.spotify.com/v1/me/playlists?limit=50";
const SPOTIFY_ENDPOINT_MY_TOP_50_TRACKS_OF_LAST_MONTH =
  "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50";
const SPOTIFY_ENDPOINT_MY_TOP_50_ARTISTS_OF_LAST_MONTH =
  "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50";
const SPOTIFY_ENDPOINT_MY_FOLLOWED_ARTISTS =
  "https://api.spotify.com/v1/me/following?type=artist&limit=50";

main();

async function main() {
  try {
    const { SPOTIFY_USER_ACCESS_TOKEN } = getEnvironmentVariables();

    const playlists = await getUserFirst50Playlists(SPOTIFY_USER_ACCESS_TOKEN);
    const lastMonthTopTracks = await getUserTop50TracksOfLastMonth(
      SPOTIFY_USER_ACCESS_TOKEN
    );
    const lastMonthTopArtists = await getUserTop50ArtistsOfLastMonth(
      SPOTIFY_USER_ACCESS_TOKEN
    );
    const followedArtists = await getUserFollowedArtists(
      SPOTIFY_USER_ACCESS_TOKEN
    );

    console.log(
      "playlists",
      playlists.items.map((i) => i.name)
    );
    console.log(
      "top 50 tracks",
      lastMonthTopTracks.items.map((i) => i.name)
    );
    console.log(
      "top 50 artists",
      lastMonthTopArtists.items.map((i) => i.name)
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

async function getUserFirst50Playlists(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_PLAYLISTS)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user playlists");
  }

  return response.body;
}

async function getUserTop50TracksOfLastMonth(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_TOP_50_TRACKS_OF_LAST_MONTH)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user top tracks of last month");
  }

  return response.body;
}

async function getUserTop50ArtistsOfLastMonth(accessToken) {
  const response = await superagent
    .get(SPOTIFY_ENDPOINT_MY_TOP_50_ARTISTS_OF_LAST_MONTH)
    .set("Authorization", `Bearer ${accessToken}`);

  if (response.status !== 200) {
    throw new Error("Cannot get user top artists of last month");
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

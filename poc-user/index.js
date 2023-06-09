const superagent = require("superagent");

const SPOTIFY_ENDPOINT_MY_PLAYLISTS =
  "https://api.spotify.com/v1/me/playlists?limit=50";
const SPOTIFY_ENDPOINT_MY_LIKED_TRACKS = "https://api.spotify.com/v1/me/tracks";
const SPOTIFY_ENDPOINT_MY_LIKED_ALBUMS = "https://api.spotify.com/v1/me/albums";
const SPOTIFY_ENDPOINT_MY_TOP_TRACKS =
  "https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50";
const SPOTIFY_ENDPOINT_MY_TOP_ARTISTS =
  "https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50";
const SPOTIFY_ENDPOINT_MY_FOLLOWED_ARTISTS =
  "https://api.spotify.com/v1/me/following?type=artist&limit=50";
const SPOTIFY_ENDPOINT_MY_RECENTLY_PLAYED_TRACKS =
  "https://api.spotify.com/v1/me/player/recently-played?limit=50";

main();

async function main() {
  try {
    const { SPOTIFY_USER_ACCESS_TOKEN } = await getEnvironmentVariables();

    const [
      playlists,
      likedTracks,
      likedAlbums,
      topTracks,
      topArtists,
      followedArtists,
      recentlyPlayedTracks,
    ] = await Promise.all([
      getUserPlaylists(SPOTIFY_USER_ACCESS_TOKEN),
      getUserLikedTracks(SPOTIFY_USER_ACCESS_TOKEN),
      getUserLikedAlbums(SPOTIFY_USER_ACCESS_TOKEN),
      getUserTopTracks(SPOTIFY_USER_ACCESS_TOKEN),
      getUserTopArtists(SPOTIFY_USER_ACCESS_TOKEN),
      getUserFollowedArtists(SPOTIFY_USER_ACCESS_TOKEN),
      getUserRecentlyPlayedTracks(SPOTIFY_USER_ACCESS_TOKEN),
    ]);

    console.log("PLAYLISTS");
    for (const [index, playlist] of playlists.entries()) {
      console.log(`${index + 1}. ${playlist.name}`);
    }
    console.log();

    console.log("LAST LIKED TRACKS");
    for (const [index, track] of likedTracks.entries()) {
      console.log(
        `${index + 1}. ${track.track.name} - ${track.track.artists
          .map((a) => a.name)
          .join(", ")} | ${track.added_at}`
      );
    }
    console.log();

    console.log("LAST LIKED ALBUMS");
    for (const [index, album] of likedAlbums.entries()) {
      console.log(
        `${index + 1}. ${album.album.name} - ${album.album.artists
          .map((a) => a.name)
          .join(", ")} | ${album.added_at}`
      );
    }
    console.log();

    console.log("TOP TRACKS");
    for (const [index, track] of topTracks.entries()) {
      console.log(
        `${index + 1}. ${track.name} - ${track.artists
          .map((a) => a.name)
          .join(", ")}`
      );
    }
    console.log();

    console.log("TOP ARTISTS");
    for (const [index, artist] of topArtists.entries()) {
      console.log(
        `${index + 1}. ${artist.name} | popularity ${artist.popularity}`
      );
    }
    console.log();

    console.log("TOP GENRES");
    for (const [index, [genre, data]] of computeTopGenres(
      topArtists
    ).entries()) {
      console.log(`${index + 1}. ${genre} ${data.percentage}%`);
    }
    console.log();

    console.log("FOLLOWED ARTISTS");
    for (const [index, artist] of followedArtists.entries()) {
      console.log(
        `${index + 1}. ${artist.name} | popularity ${artist.popularity}`
      );
    }
    console.log();

    console.log("RECENTLY PLAYED TRACKS");
    for (const [index, track] of recentlyPlayedTracks.entries()) {
      console.log(
        `${index + 1}. ${track.track.name} - ${track.track.artists
          .map((a) => a.name)
          .join(", ")} | ${track.played_at}`
      );
    }
    console.log();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

async function getEnvironmentVariables() {
  const { default: dotenv } = await import("dotenv");
  dotenv.config();

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

async function getUserLikedTracks(accessToken) {
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_LIKED_TRACKS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user liked tracks");
    }

    items = [...items, ...response.body.items];
    next = response.body.next;
  } while (next);

  return items;
}

async function getUserLikedAlbums(accessToken) {
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_LIKED_ALBUMS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user liked albums");
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

async function getUserRecentlyPlayedTracks(accessToken) {
  let items = [];
  let next = SPOTIFY_ENDPOINT_MY_RECENTLY_PLAYED_TRACKS;

  do {
    const response = await superagent
      .get(next)
      .set("Authorization", `Bearer ${accessToken}`);

    if (response.status !== 200) {
      throw new Error("Cannot get user recently played tracks");
    }

    items = [...items, ...response.body.items];
    next = response.body.next;
  } while (next);

  return items;
}

function computeTopGenres(artists) {
  const genresCounter = new Map();

  for (const artist of artists) {
    for (const genre of artist.genres) {
      if (!genresCounter.has(genre)) {
        genresCounter.set(genre, { count: 0 });
      }

      const g = genresCounter.get(genre);
      g.count += 1;
    }
  }

  const totalNumberOfGenres = genresCounter.size;

  for (const [genre, data] of genresCounter) {
    const percentage = Math.floor((data.count / totalNumberOfGenres) * 100);

    const g = genresCounter.get(genre);
    g.percentage = percentage;
  }

  const genresOrderedByFrequency = [...genresCounter].sort(
    ([, aData], [, bData]) => bData.count - aData.count
  );

  return genresOrderedByFrequency;
}

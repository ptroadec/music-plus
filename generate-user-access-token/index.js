/**
 * More infos here: https://developer.spotify.com/documentation/web-api/concepts/authorization
 */

const superagent = require("superagent");
const fastify = require("fastify")({ logger: false });

const SPOTIFY_ENDPOINT_TOKEN = "https://accounts.spotify.com/api/token";
const SPOTIFY_ENDPOINT_AUTHORIZE = "https://accounts.spotify.com/authorize?";
const SPOTIFY_USER_SCOPES =
  "playlist-read-private playlist-read-collaborative user-top-read user-follow-read user-library-read user-read-recently-played";

main();

async function main() {
  try {
    const {
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI,
    } = await getEnvironmentVariables();

    await openSpotifyAuthorizationCodeDialog(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_REDIRECT_URI
    );

    await startCallbackServer(
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REDIRECT_URI
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function getEnvironmentVariables() {
  const { default: dotenv} = await import("dotenv");
  dotenv.config();

  if (!process.env.SPOTIFY_CLIENT_ID) {
    throw new Error("Missing SPOTIFY_CLIENT_ID");
  }

  if (!process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing SPOTIFY_CLIENT_SECRET");
  }

  if (!process.env.SPOTIFY_REDIRECT_URI) {
    throw new Error("Missing SPOTIFY_REDIRECT_URI");
  }

  try {
    const { pathname, port } = getPathnameAndPort(process.env.SPOTIFY_REDIRECT_URI);
    if (!pathname || !port) {
      throw new Error();
    }
  } catch {
    throw new Error('Invalid SPOTIFY_REDIRECT_URI');
  }

  return {
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
  };
}

async function openSpotifyAuthorizationCodeDialog(clientID, redirectURI) {
  const url = buildAuthorizationCodeDialogURL(
    clientID,
    redirectURI,
    SPOTIFY_USER_SCOPES
  );

  const { default: open } = await import("open");
  await open(url);
}

function buildAuthorizationCodeDialogURL(clientID, redirectURI, scopes) {
  let url = "";
  url += SPOTIFY_ENDPOINT_AUTHORIZE;
  url += `response_type=code`;
  url += `&client_id=${encodeURIComponent(clientID)}`;
  url += `&scope=${encodeURIComponent(scopes)}`;
  url += `&redirect_uri=${encodeURIComponent(redirectURI)}`;

  return url;
}

async function startCallbackServer(clientID, clientSecret, redirectURI) {
  const { pathname, port } = getPathnameAndPort(redirectURI);

  fastify.get(pathname, async (request, reply) => {
    const code = request?.query?.code;
    if (!code) {
      throw new Error("Cannot get code");
    }

    const responseBody = await getAccessToken(
      clientID,
      clientSecret,
      code,
      redirectURI
    );

    
    console.log(responseBody);
    reply.send(responseBody);
    await reply;

    await fastify.close();
  });

  await fastify.listen({ port });
}

function getPathnameAndPort(redirectURI) {
  const { pathname, port } = new URL(redirectURI);
  return { pathname, port };
}

async function getAccessToken(clientID, clientSecret, code, redirectURI) {
  const basic = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");

  const response = await superagent
    .post(SPOTIFY_ENDPOINT_TOKEN)
    .send({
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": redirectURI,
    })
    .set({
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    });
    
  if (response.status !== 200) {
    throw new Error("Cannot get accessToken");
  }

  return response.body;
}

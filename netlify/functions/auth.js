const https = require("https");
const querystring = require("querystring");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = (process.env.URL || "https://incandescent-lamington-00b18b.netlify.app") + "/.netlify/functions/auth";
const APP_URL = process.env.URL || "https://incandescent-lamington-00b18b.netlify.app";

function httpsPost(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};

  if (params.action === "refresh") {
    const refreshToken = params.refresh_token;
    if (!refreshToken) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing refresh_token" }) };
    }
    const postBody = querystring.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    const options = {
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postBody),
      },
    };
    try {
      const result = await httpsPost(options, postBody);
      const tokenData = JSON.parse(result.body);
      if (tokenData.error) {
        return { statusCode: 400, body: JSON.stringify({ error: tokenData.error }) };
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: tokenData.access_token }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  const code = params.code;
  if (!code) {
    return { statusCode: 400, body: "Missing code parameter" };
  }

  const postBody = querystring.stringify({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const options = {
    hostname: "oauth2.googleapis.com",
    path: "/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postBody),
    },
  };

  try {
    const result = await httpsPost(options, postBody);
    const tokenData = JSON.parse(result.body);
    if (tokenData.error) {
      return {
        statusCode: 400,
        body: "OAuth error: " + tokenData.error + " - " + (tokenData.error_description || ""),
      };
    }
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || "";
    const redirectTo = APP_URL + "/?cal_token=" + encodeURIComponent(accessToken) + "&cal_refresh=" + encodeURIComponent(refreshToken);
    return {
      statusCode: 302,
      headers: { Location: redirectTo },
      body: "",
    };
  } catch (err) {
    return { statusCode: 500, body: "Server error: " + err.message };
  }
};

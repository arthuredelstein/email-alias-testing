const fs = require("fs");

const initPayload = {
  "intent": "auth_token",
  "language": "en-US",
  "service": "email-aliases"
}

const resultPayload = {
  "wait" : true
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchJson = async (...args) => {
  const response = await fetch(...args);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} | response=${text}`)
  }
  return JSON.parse(text);
}

const sandbox = false

const servicesDomain = sandbox ? "bravesoftware.com" : "brave.com"

const servicesKey = fs.readFileSync("services_key.txt", "utf8").trim();

const verificationKeyHeader = {"Brave-Key": servicesKey};

const apiKey = {"X-API-key": servicesKey};


const authHeader = (token) => ({ "Authorization": ("Bearer " + token) })

const verifyUrl = `https://accounts.bsg.${servicesDomain}/v2/verify`

const initUrl = verifyUrl + "/init"

const init = async (email) => {
  const payload = {...initPayload, email}
  const { verificationToken } = await fetchJson(initUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: verificationKeyHeader,
  });
  return verificationToken
}

const resultUrl = verifyUrl + "/result"

const verifyResult = async (verificationToken) => {
  const result = await fetchJson(resultUrl, {
    method: "POST",
    body: JSON.stringify(resultPayload),
    headers: Object.assign({}, authHeader(verificationToken), verificationKeyHeader)
  });
  const { authToken } = result;
  return authToken;
}

const initAndVerify = async (email) => {
  const verificationToken = await init(email);
  const authToken = await verifyResult(verificationToken);
  return authToken;
}

const manageUrl = `https://aliases.${servicesDomain}/manage`

const getAlias = async (sessionToken, active=true) => {
  return fetchJson(manageUrl + (active ? '?status=active' : ''), {
    method: "GET",
    headers: Object.assign({}, authHeader(sessionToken), apiKey  )
  });
}

const createAlias = async (sessionToken) => {
  return fetchJson(manageUrl, {
    method: "POST",
    headers: Object.assign({}, authHeader(sessionToken), apiKey ),
    body: '{}'
  });
}

const updateAlias = async (sessionToken, aliasEmail, status) => {
  return fetchJson(manageUrl, {
    method: "PUT",
    headers: Object.assign({}, authHeader(sessionToken), apiKey ),
    body: JSON.stringify({ "alias": aliasEmail, status })
  });
}

const deleteAlias = async (sessionToken, aliasEmail) => {
  const body = JSON.stringify({ "alias": aliasEmail })
  return fetchJson(manageUrl, {
    method: "DELETE",
    headers: Object.assign({}, authHeader(sessionToken), apiKey ),
    body
  });
}


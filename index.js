const initPayload = {
  "intent": "auth_token",
  "language": "en-US",
  "service": "email-aliases"
}

const resultPayload = {
  "wait" : true
}

const fetchJson = async (...args) => {
  const response = await fetch(...args);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} | response=${text}`)
  }
  return JSON.parse(text);
}

const apiHeaders = {"X-API-key": "px6zQ7rIMGaS8FE6cmpUp45WQTFJYXgo7ZlBhrFK"};

const headers = (token) => Object.assign({},
  apiHeaders,
  { "Authorization": ("Bearer " + token) })

const initUrl = "https://accounts.bsg.bravesoftware.com/v2/verify/init"

const init = async (email) => {
  const payload = {...initPayload, email}
  const { verificationToken } = await fetchJson(initUrl, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: apiHeaders
  });
  return verificationToken
}

const resultUrl = "https://accounts.bsg.bravesoftware.com/v2/verify/result"

const session = async (verificationToken) => {
  const { authToken } = await fetchJson(resultUrl, {
    method: "POST",
    body: JSON.stringify(resultPayload),
    headers: headers(verificationToken)
  });
  return authToken
}

const manageUrl = "https://aliases.bsg.bravesoftware.com/manage"

const getAlias = async (sessionToken, active=true) => {
  return fetchJson(manageUrl + (active ? '?status=active' : ''), {
    method: "GET",
    headers: headers(sessionToken)
  });
}

const createAlias = async (sessionToken, aliasEmail) => {
  return fetchJson(manageUrl, {
    method: "POST",
    headers: headers(sessionToken),
    body: JSON.stringify({ "alias": aliasEmail })
  });
}

const updateAlias = async (sessionToken, aliasEmail, status) => {
  return fetchJson(`${manageUrl}`, {
    method: "PUT",
    headers: headers(sessionToken),
    body: JSON.stringify({ "alias": aliasEmail, status })
  });
}

const deleteAlias = async (sessionToken, aliasEmail) => {
  const body = JSON.stringify({ "alias": aliasEmail })
  return fetchJson(`${manageUrl}`, {
    method: "DELETE",
    headers: headers(sessionToken),
    body
  });
}

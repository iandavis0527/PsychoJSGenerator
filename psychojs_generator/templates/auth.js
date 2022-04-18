const ldap = require("ldap-authentication");
const serverAddress = "ldap://srv-1:3899";

function isLocal(req) {
  console.debug(req.ip);
  return req.ip === "localhost" || req.ip === "127.0.0.1" || req.ip === "::1";
}

async function authenticate(req, res) {
  if (isLocal(req)) {
    res.cookie("authenticated", true, {
      expires: new Date(Date.now() + 3600000),
    });
    return true;
  }

  console.debug(`req.body = `);
  console.debug(req.body);
  console.debug(`authenticating ldap for user ${req.body.username}`);

  let authenticated = await ldap.authenticate({
    ldapOpts: { url: serverAddress },
    userDn: `uid=${req.body.username}`,
    userPassword: `${req.body.password}`,
  });
  res.cookie("authenticated", authenticated, {
    expires: new Date(Date.now() + 3600000),
  });
  console.debug("set authenticated cookie to true");
  console.debug("authenticated cookie = ");
  console.debug(res.cookie("authenticated"));
  return authenticated;
}

function isAuthenticated(req, res) {
  //   if (isLocal(req)) {
  //     res.cookie("authenticated", true, {
  //       expires: new Date(Date.now() + 3600000),
  //     });
  //     return true;
  //   }

  console.debug(req.cookies.authenticated);
  return req.cookies.authenticated;
}

exports.authenticate = authenticate;
exports.isAuthenticated = isAuthenticated;

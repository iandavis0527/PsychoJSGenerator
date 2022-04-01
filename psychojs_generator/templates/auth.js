const ldap = require("ldap-authentication");
const serverAddress = "ldap://srv-1:3899";

function isLocal(req) {
  console.debug(req.ip);
  return req.ip === "localhost" || req.ip === "127.0.0.1" || req.ip === "::1";
}

async function authenticate(req, res) {
  //   if (isLocal(req)) {
  //     res.cookie("authenticated", true, {
  //       expires: new Date(Date.now() + 3600000),
  //     });
  //     return true;
  //   }

  let authenticated = await ldap.authenticate({
    ldapOpts: { url: serverAddress },
    userDn: `uid=${req.headers.username}`,
    userPassword: `${req.headers.password}`,
  });
  res.cookie("authenticated", authenticated, {
    expires: new Date(Date.now() + 3600000),
  });
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
  return false;
}

exports.authenticate = authenticate;
exports.isAuthenticated = isAuthenticated;

const express = require("express");
const multer = require("multer");
const path = require("path");
const serveIndex = require("serve-index");
const app = express();
const config = require("./server_config.json");
const auth = require("./auth.js");
const cookieParser = require("cookie-parser");

let RESULT_DIRECTORY = path.join(__dirname, config.result_directory);
let upload = multer({
  storage: multer.diskStorage({
    destination: RESULT_DIRECTORY,
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "experiment"));

app.use(cookieParser());

app.post("/results", upload.single("result"), async (req, res, next) => {
  res.end("uploaded");
});

app.use(express.static("experiment"));

app.get("/login", (req, res, next) => {
  if (auth.isAuthenticated(req, res)) {
    res.redirect(req.header("redirect-url"));
  } else {
    res.render("login", { "redirect-url": req.header("redirect-url") });
  }
  next();
});

app.post("/login", async (req, res, next) => {
  if (auth.isAuthenticated(req, res) || (await auth.authenticate(req, res))) {
    res.redirect(req.header("redirect-url"));
  } else {
    res.header("redirect-url", req.header("redirect-url"));
    res.render("login", { errors: true });
    return;
  }
  next();
});

app.use("/export", (req, res, next) => {
  const loggedIn = auth.isAuthenticated(req, res);

  if (!loggedIn) {
    res.header("redirect-url", "/export");
    res.redirect("/login");
  }

  console.debug("using express.static");
  next();
});

app.use(
  "/export",
  express.static(RESULT_DIRECTORY),
  serveIndex(RESULT_DIRECTORY)
);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

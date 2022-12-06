const express = require("express");
const multer = require("multer");
const path = require("path");
const serveIndex = require("serve-index");
const app = express();
const config = require("./server_config.json");
const auth = require("./auth.js");
const dirTree = require("directory-tree");
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

function redirect(res, target, redirectUrl) {
    res.cookie("redirectUrl", redirectUrl);
    res.redirect(target);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "experiment"));

app.use(cookieParser());
app.use(express.urlencoded());

app.get("/config.json", async (req, res, next) => {
    res.set("Content-Type", "application/json");
    res.send({
        experiment: {
            name: config.project_name,
            fullpath: config.project_name,
        },

        pavlovia: {
            URL: config.server_url,
        },

        gitlab: {
            projectId: 000000,
        },
    });
});

app.post("/results", upload.single("result"), async (req, res, next) => {
    res.end("uploaded");
});

function flattenedTree(listing, namePrefix = "") {
    const children = [];

    for (let i = 0; i < listing.length; i++) {
        let entry = listing[i];
        children.push({ name: namePrefix + entry.name, path: entry.path });

        if (
            entry.children !== undefined &&
            entry.children !== null &&
            entry.children.length > 0
        ) {
            children.push(
                ...flattenedTree(
                    entry.children,
                    (namePrefix = "." + entry.path + "/")
                )
            );
        }
    }

    return children;
}

app.get("/resources/list", (req, res, next) => {
    const tree = flattenedTree(dirTree(config.resource_directory).children).map(
        (entry) => ({
            name: entry.name
                .replace(config.resource_directory.substring(2), "")
                .replace("\\\\", "/"),
            path: entry.path
                .replace("\\\\", "/")
                .replace(config.resource_directory.substring(2), "/resources"),
        })
    );
    res.set("Content-Type", "application/json");
    res.send(tree);
});

app.get("/resources/:file", (req, res, next) => {
    const filepath = path.resolve(config.resource_directory, req.params.file);
    res.sendFile(filepath);
});

app.get("/login", (req, res, next) => {
    if (auth.isAuthenticated(req, res)) {
        res.redirect(req.cookies.redirectUrl);
    } else {
        res.render("login");
    }
});

app.post("/login", async (req, res, next) => {
    if (auth.isAuthenticated(req, res)) {
        console.debug(
            `user already authenticated, redirecting to ${req.cookies.redirectUrl}`
        );
        res.redirect(req.cookies.redirectUrl);
    } else if (await auth.authenticate(req, res)) {
        console.debug(
            `user authenticated successfully, redirecting to ${req.cookies.redirectUrl}`
        );
        res.redirect(req.cookies.redirectUrl);
    } else {
        res.render("login", { errors: true });
    }
});

app.use("/export", (req, res, next) => {
    const loggedIn = auth.isAuthenticated(req, res);

    if (!loggedIn) {
        redirect(res, "/login", "/export");
        return;
    }

    console.debug("using express.static");
    next();
});

app.use(
    "/export",
    express.static(RESULT_DIRECTORY),
    serveIndex(RESULT_DIRECTORY)
);

app.use(express.static("experiment"));

app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
});

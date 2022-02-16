const express = require("express")
const multer = require("multer");
const path = require("path");
const serveIndex = require("serve-index");
const app = express();
const config = require("./server_config.json");

let RESULT_DIRECTORY = path.join(__dirname, config.result_directory);
let upload = multer({
    storage: multer.diskStorage({
        destination: RESULT_DIRECTORY,
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});

app.post("/results", upload.single("result"), async (req, res, next) => {
    res.end("uploaded");
});

app.use(express.static("experiment"));
app.use("/export", express.static(RESULT_DIRECTORY), serveIndex(RESULT_DIRECTORY));

app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
});
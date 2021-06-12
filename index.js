const fs = require("fs");
const ytdl = require("ytdl-core");

ytdl("https://www.youtube.com/watch?v=OqmXbe_c_qc", {begin: "1:30"}).pipe(fs.createWriteStream("myvideo.mp4"));
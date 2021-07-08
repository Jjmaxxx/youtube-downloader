const { ipcRenderer } = require("electron");
const fs = require("fs");
const ytdl = require("ytdl-core");

let youtubeForm, video, videoContainer; 
let source = document.createElement("source");
ipcRenderer.on("asynchronous-message",(event,message)=>{
    youtubeForm = document.getElementById("youtubeForm");
    youtubeForm.addEventListener("submit",createReadableStream);
    videoContainer = document.getElementById("videoContainer");
    videoContainer.appendChild(source);
    video = document.getElementById("video");
    //document.getelementbyid src file
})
function createReadableStream(event){
    event.preventDefault();
    let url = document.getElementById("url").value;
    //let stream = ytdl(url.value);
        let getName = async()=> await ytdl.getInfo(url);
        getName().then((info)=>{
            let name = "./videos/"+info.videoDetails.title +".mp4";
            ytdl(url).pipe(fs.createWriteStream(name)).on('finish', ()=>{
                source.setAttribute('src', name);
                video.setAttribute('src', source.src);
                videoContainer.load();
                //video.play();
                //location.reload();
            });
        })

    youtubeForm.reset();
}
//npm install electron-reload


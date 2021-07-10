const { ipcRenderer } = require("electron");
const fs = require("fs");
const ytdl = require("ytdl-core");
const utils = require("./utils.js")
let youtubeForm, video, videoContainer,afterGetInfo, songPlaying; 
let source = document.createElement("source");
ipcRenderer.on("asynchronous-message",(event,message)=>{
    youtubeForm = document.getElementById("youtubeForm");
    youtubeForm.addEventListener("submit",createReadableStream);
    videoContainer = document.getElementById("videoContainer");
    videoContainer.appendChild(source);
    video = document.getElementById("video");
    afterGetInfo = document.getElementById("afterGetInfo");
    songPlaying = document.getElementById("songPlaying");
    //document.getelementbyid src file
})
function createReadableStream(event){
    event.preventDefault();
    let url = document.getElementById("url").value;
    //let stream = ytdl(url.value);
        let getName = async()=> await ytdl.getInfo(url);
        getName().then((info)=>{
            console.log(info);
            videoContainer.style.display = "none";
            songPlaying.innerHTML = "";
            let defaultName = info.videoDetails.title;
            let quality = document.getElementById("quality");
            quality.innerHTML = "";
            let uniqueQuality = new Map();
            info.formats.forEach((element)=>{
                let elementQuality = element.qualityLabel;
                // && element.audioCodec != null
                if(element.container == "mp4" && !uniqueQuality.has(elementQuality)){
                    uniqueQuality.set(elementQuality, elementQuality)
                    let option = document.createElement("option");
                    option.value = element.itag;
                    option.innerHTML = elementQuality;
                    quality.appendChild(option);
                    console.log(option);
                }
            })
            afterGetInfo.style.display = "block";
            let name = document.getElementById("name");
            name.value = defaultName;
            let doneButton = document.getElementById("doneButton");
            doneButton.onclick = ()=>{
                pipeVideo(url,name.value,quality.options[quality.selectedIndex].value)
            };
        })

}
function pipeVideo(url,name,quality){
    let path = "./videos/"+name +".mp4";
    console.log(name);
    console.log(quality);
    ytdl(url,{quality:quality}).pipe(fs.createWriteStream(path)).on('finish', ()=>{
        source.setAttribute('src', path);
        video.setAttribute('src', source.src);
        videoContainer.style.display = "block";
        videoContainer.load();
        //video.play();
        //location.reload();
        afterGetInfo.style.display = "none";
        songPlaying.innerHTML = "Now Playing: " + name;
    });
    youtubeForm.reset();
}
//npm install electron-reload


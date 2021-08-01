const { ipcRenderer } = require("electron");
const fs = require("fs");
const ytdl = require("ytdl-core");
const utils = require("./utils.js");
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');

let youtubeForm, video, videoContainer,afterGetInfo, songPlaying, audio, audioContainer; 
let source = document.createElement("source");
ipcRenderer.on("asynchronous-message",(event,message)=>{
    youtubeForm = document.getElementById("youtubeForm");
    youtubeForm.addEventListener("submit",createReadableStream);
    videoContainer = document.getElementById("videoContainer");
    videoContainer.appendChild(source);
    video = document.getElementById("video");
    audio = document.getElementById("audio");
    audioContainer = document.getElementById("audioContainer");
    audioContainer.appendChild(source);
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
            let mp4ormp3 = document.getElementById("mp4ormp3");
            mp4ormp3.style.display = "block";
            mp4ormp3.addEventListener('change', ()=>{
              if(mp4ormp3.options[mp4ormp3.selectedIndex].value == "mp3"){
                quality.style.display = "none";
              }else{
                quality.style.display = "block";
              }
            })
            let uniqueQuality = new Map();
            info.formats.forEach((element)=>{
              let elementQuality = element.qualityLabel;
              if(element.container == "mp4" && element.hasVideo == true && element.hasAudio == false && !uniqueQuality.has(elementQuality)){
                uniqueQuality.set(elementQuality, elementQuality)
                let option = document.createElement("option");
                option.value = element.itag;
                option.innerHTML = elementQuality;
                quality.appendChild(option);
                console.log(option);
              }
            })
            //element.thumbnail.thumbnails[3].url
            afterGetInfo.style.display = "block";
            let name = document.getElementById("name");
            name.value = defaultName;
            let doneButton = document.getElementById("doneButton");
            doneButton.onclick = ()=>{
                if(mp4ormp3.options[mp4ormp3.selectedIndex].value == "mp3"){
                  audioOnly(url,name.value)
                }else{
                  mergeVideoAudio(url,name.value,quality.options[quality.selectedIndex].value);
                }
                youtubeForm.reset()
            };
        })

}
function audioOnly(url, name){
  let path = "./videos/"+name +".mp3";
  ytdl(url,{filter:"audioonly"}).pipe(fs.createWriteStream(path)).on('finish',()=>{
    source.setAttribute('src', path);
    audio.setAttribute('src', source.src);
    audioContainer.style.display = "block";
    audioContainer.load();
    afterGetInfo.style.display = "none";
    songPlaying.innerHTML = "Now Playing: " + name;
  });
}
function mergeVideoAudio(url, name, vidQuality){
    const aud = ytdl(url,{quality:"highestaudio"});
    const vid = ytdl(url, { quality: vidQuality});
    let path = "./videos/"+name +".mp4";
    const ffmpegProcess = cp.spawn(ffmpeg, [
        // Remove ffmpeg's console spamming
        '-loglevel', '8', '-hide_banner',
        // Redirect/Enable progress messages
        '-progress', 'pipe:3',
        // Set inputs
        '-i', 'pipe:4',
        '-i', 'pipe:5',
        // Map audio & video from streams
        '-map', '0:a',
        '-map', '1:v',
        // Keep encoding
        '-c:v', 'copy',
        // Define output file
        path,
      ], {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout, stderr */
          'inherit', 'inherit', 'inherit',
          /* Custom: pipe:3, pipe:4, pipe:5 */
          'pipe', 'pipe', 'pipe',
        ],
      });
      
      //done downloading this runs
      ffmpegProcess.on('close', () => {
        source.setAttribute('src', path);
        video.setAttribute('src', source.src);
        videoContainer.style.display = "block";
        videoContainer.load();
        //video.play();
        //location.reload();
        afterGetInfo.style.display = "none";
        songPlaying.innerHTML = "Now Playing: " + name;
        console.log('done');
      });
      aud.pipe(ffmpegProcess.stdio[4]);
      vid.pipe(ffmpegProcess.stdio[5]);
}
// function pipeVideo(url,name,quality){
//     let path = "./videos/"+name +".mp4";
//     console.log(name);
//     console.log(quality);
//     ytdl(url,{quality:quality}).pipe(fs.createWriteStream(path)).on('finish', ()=>{
//         source.setAttribute('src', path);
//         video.setAttribute('src', source.src);
//         videoContainer.style.display = "block";
//         videoContainer.load();
//         //video.play();
//         //location.reload();
//         afterGetInfo.style.display = "none";
//         songPlaying.innerHTML = "Now Playing: " + name;
//     });
//     youtubeForm.reset();
// }
// //npm install electron-reload


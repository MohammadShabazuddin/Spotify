console.log("Lets write Javascript")
let Currentsong = new Audio()
let songs;
let currfolder;
function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Round the seconds to the nearest integer
    seconds = Math.round(seconds);

    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    // Formatting minutes and seconds to have leading zeros if necessary
    var formattedMinutes = (minutes < 10) ? "0" + minutes : minutes;
    var formattedSeconds = (remainingSeconds < 10) ? "0" + remainingSeconds : remainingSeconds;

    return formattedMinutes + ":" + formattedSeconds;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the songs in the playlist
    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("_", " ").replaceAll("%20", "_")}</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img  class="invert" src="img/play.svg" alt="">
                            </div>
                        
          </li>`;
    }

    //Attach an event listener to every song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.replaceAll(" ", "_").replaceAll("_", "%20"))
        })
    });
    return songs;
}
const playMusic = (track, pause = false) => {
    Currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        Currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replace(".mp3", "").replaceAll("_", " ").replaceAll("%20", " ")
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.replaceAll("%20", " ").split("/").slice(4)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div class="card" data-folder="${folder}">
            <div  class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="54" height="54">
                    <circle cx="12" cy="12" r="10" fill="#FFA500" />
                    <polygon points="10,8 16,12 10,16" fill="currentColor" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {


    //get the list of all the songs
    await getSongs("songs/Favsongs1")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (Currentsong.paused) {
            Currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            Currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for time update event
    Currentsong.addEventListener("timeupdate", () => {
        console.log(Currentsong.currentTime, Currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(Currentsong.currentTime)}/${secondsToMinutes(Currentsong.duration)}`
        document.querySelector(".circle").style.left = (Currentsong.currentTime / Currentsong.duration) * 100 + "%"
    })

    //Add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        Currentsong.currentTime = ((Currentsong.duration) * percent) / 100;
    })

    //Add event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })
    //Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add an event listener to previous
    previous.addEventListener("click", () => {
        Currentsong.pause()
        let index = songs.indexOf(Currentsong.src.split("/").slice(-1)[0])
        if ((index) > 0) {
            playMusic(songs[index - 1])
        }
        else
            playMusic(songs[index])
    })
    //Add an event listener to next
    next.addEventListener("click", () => {
        Currentsong.pause()
        let index = songs.indexOf(Currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else
            playMusic(songs[index])
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, " /100")
        Currentsong.volume = parseInt(e.target.value) / 100
        if(Currentsong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        if(e.target.src.includes("img/volume.svg"))
        {
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            Currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            Currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 70
        }
    })

}

main()

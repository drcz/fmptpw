var canvas = document.getElementById("ekraniszcze");
var video_ctx = canvas.getContext("2d");

const audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
const main_amp = audio_ctx.createGain();

var voices = [];

let load_voice = (i,url) => {
  const request = new XMLHttpRequest();
  request.open("GET", url);
  request.responseType = "arraybuffer";
  var src = audio_ctx.createBufferSource();
  var amp = audio_ctx.createGain();
  var pan = new StereoPannerNode(audio_ctx);
  src.loop = true;
  amp.gain.value = 0;
  pan.pan.value = 0;
  src.connect(pan).connect(amp).connect(main_amp);
  voices[i] = {src:src, amp: amp, pan: pan};
  request.onload = () => {
    audio_ctx.decodeAudioData(request.response, data => { voices[i].src.buffer = data ; voices[i].src.start(); });
  };
  request.send();
};

let modify_voice = (i, rate, vol, pan) => {
    var voice = voices[i % voices.length];
    voice.src.playbackRate.value = rate;
    voice.pan.pan.value = pan;
    voice.amp.gain.value = vol;
};

let w_range = (min,max,p) => min+p*(max-min)

let init_stuff = () => {
    var idx = 0; /// pacz jak się domknę w ewencie mordo

    video_ctx.canvas.width  = window.innerWidth;
    video_ctx.canvas.height = window.innerHeight;

    for(var i=0;i<=10;i++) load_voice(i,"d"+i+".ogg");

    main_amp.gain.value = 1.0;
    main_amp.connect(audio_ctx.destination);    

    var cls = p => {
        video_ctx.fillStyle=(["#f00","#00f","#ff0"])[p%3];
        video_ctx.fillRect(0,0,video_ctx.canvas.width,video_ctx.canvas.height);
        video_ctx.fillStyle="#000";
    };

    var msg = txt => {
        video_ctx.font = "33px sans-serif";
        video_ctx.textAlign = "center";
        video_ctx.fillText(txt, canvas.width/2, canvas.height/2);
    };

    canvas.addEventListener('click', event => {
        var p0 = event.pageX / video_ctx.canvas.width;
        var p1 = event.pageY / video_ctx.canvas.height;
        var vol = w_range(0.2,0.6,0.5);
        var pan = w_range(-1,1,p0);
        var rate = w_range(0.5,4,p1);
        var ang0 = 2*Math.PI*((idx+1)/(1+voices.length));
        var ang1 = 0.23*Math.PI+ang0;
        idx += 1; idx %= voices.length;

        if(audio_ctx.state === 'suspended') audio_ctx.resume();
        
        cls(idx%2);
        video_ctx.beginPath();
        for(var r=10;r<(23+p0*242);r+=(1.1-p1)*20)
            video_ctx.arc(event.pageX, event.pageY, r, ang0, ang1)
        video_ctx.stroke();

        modify_voice(idx, rate, vol, pan);
        console.log([idx, rate, vol, pan])
    });
    cls(2);
    msg("keep tapping me");
}

init_stuff()

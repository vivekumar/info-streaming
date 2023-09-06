import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "https://jobportal.itexpertiseindia.com:62";
// const ENDPOINT = "http://localhost:3003";

let socket;

let micInfo = {};
let videoInfo = {};

// turn server
const configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
};

let connections = {};
let cName = {};

const Room = () => {
  const [modal, setModal] = useState(false);
  const [rooms, setRooms] = useState({});
  const [expand, setExpand] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [streamerName, setStreamerName] = useState("");
  let fakeStream;

  useEffect(() => {
    // connect to the socket server
    socket = socketIOClient(ENDPOINT);

    // Display all live streamings currently running
    socket.on("avl-rooms", (data) => {
      setRooms({ ...data });
    });

    // Generating fake video track 
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const video = document.createElement("video");
    video.src = "https://www.w3schools.com/html/mov_bbb.mp4";
    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    });

    const fakeVideoTrack = canvas.captureStream().getVideoTracks()[0];

    // Generate a fake audio track using MediaStreamTrackGenerator
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const audioStream = oscillator.connect(
      audioContext.createMediaStreamDestination()
    );
    oscillator.start();
    const fakeAudioTrack = audioStream.stream.getAudioTracks()[0];

    fakeStream = new MediaStream([fakeVideoTrack, fakeAudioTrack]);
    setMediaStream(fakeStream);

    return () => {
      // Cleanup function
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Get streams after joining live room
    socket.on("join room", async (conc, cnames, micinfo, videoinfo) => {      
      setModal(true);
      if (cnames) cName = cnames;

      if (micinfo) micInfo = micinfo;

      if (videoinfo) videoInfo = videoinfo;

      if (conc) {
        if (cnames) setStreamerName(Object.values( cnames)[0]);
        await conc.forEach((sid) => {
          connections[sid] = new RTCPeerConnection(configuration);

          connections[sid].onicecandidate = function (event) {
            if (event.candidate) {
              socket.emit("new icecandidate", event.candidate, sid);
            }
          };

          connections[sid].ontrack = function (event) {
            if (!document.getElementById(sid)) {
              let vidCont = document.createElement("div");
              let newvideo = document.createElement("video");

              vidCont.id = sid;

              vidCont.classList.add("videos");
              newvideo.classList.add("video");
              newvideo.autoplay = true;
              newvideo.playsinline = true;
              newvideo.id = `video${sid}`;
              newvideo.onclick = function () {
                goFullscreen(`video${sid}`);
              };
              newvideo.srcObject = event.streams[0];

              vidCont.appendChild(newvideo);

              document
                .getElementsByClassName("videoContainer")[0]
                .appendChild(vidCont);
            }
          };

          connections[sid].onremovetrack = function (event) {
            if (document.getElementById(sid)) {
              document.getElementById(sid).remove();
            }
          };

          connections[sid].onnegotiationneeded = function () {
            connections[sid]
              .createOffer()
              .then(function (offer) {
                return connections[sid].setLocalDescription(offer);
              })
              .then(function () {
                socket.emit(
                  "video-offer",
                  connections[sid].localDescription,
                  sid
                );
              })
              .catch(reportError);
          };

          fakeStream.getTracks().forEach((track) => {
            for (let key in connections) {
              connections[key].addTrack(track);
            }
          });
        });
      }
    });

    socket.on("video-answer", handleVideoAnswer);
  }, []);

  const handleVideoAnswer = (answer, sid) => {
    const ans = new RTCSessionDescription(answer);
    connections[sid].setRemoteDescription(ans);
  };

  // join room function
  const joinRoom = (room) => {
    socket.emit("accept call", room);
    // console.log(rooms);
  };

  // Leave streaming function
  const closeStream = () => {
    window.location.reload();
  };

  // Full screen, streaming video
  function goFullscreen(id) {
    var element = document.getElementById(id);
    if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="title d-flex align-items-center justify-content-between">
            <h3>Live Rooms</h3>

            {!modal && !modal ? (
              <>
                {/* <div className="text-center">
                                    <button className='btn-custom' onClick={getRooms}>Join</button>
                                </div> */}
              </>
            ) : (
              <>
              <div className="text-center">
                <button className="btn-custom" onClick={() => closeStream()}>
                  Leave
                </button>

              </div>
                
              </>
            )}
          </div>
        </div>
      </div>

      <div className="liveStream">
        {modal && modal ? (
          <>
            <div className={`videoContainer ${expand ? "expand" : "compress"}`}>
              {/* <button className="expand" onClick={goFullscreen}>
                <i className="fas fa-expand"></i>
                <i className="fas fa-compress"></i>
              </button> */}
              {/* <div className={`videos myVideo ${owner === false && "d-none"}`}>
                {!audioAllowed && (
                  <div className="mute-icon" id="mymuteicon">
                    <i className="fas fa-microphone-slash"></i>
                  </div>
                )}
                {!videoAllowed && <div className="video-off">Video Off</div>}
              </div> */}
            </div>
            <h3>{streamerName}</h3>
          </>
        ) : (
          <>
            <div className="row">
              {Object.keys(rooms).length !== 0 ? (
                Object.keys(rooms).map((key, index) => {
                  return (
                    // <div className="row">

                    <div className="col-md-3" key={index}>
                      <div className="stream_box">
                        <div className="stream_box_imgStyle">
                          <img
                            src="assets/img/livePic3.jpeg"
                            alt="img"
                            className="img-fluid"
                          />
                        </div>
                        <div className="stream_box_contentStyle">
                          <h3>Live Streaming Sale</h3>
                          <h4>Quality : HD</h4>
                          <button onClick={() => joinRoom(key)}>
                            Join Now
                          </button>
                        </div>
                      </div>
                    </div>
                    // </div>
                  );
                })
              ) : (
                <div className="content">
                  <img src="assets/img/1661901.png" alt="" />
                  <h3>No live Streaming !!!</h3>
                  {/* <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Odit, corporis!
                  </p> */}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Room;

import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import Header from "../Components/Header";
import { useLocation } from "react-router-dom";

const ENDPOINT = "https://jobportal.itexpertiseindia.com:62";
// const ENDPOINT = "http://localhost:3003";

let socket;

let micInfo = {};
let videoInfo = {};

// Turn Server
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
let audioTrackSent = {};
let videoTrackSent = {};

// MediaConstraints of streamer
let mediaConstraints = {
  video: { width: 320, height: 180, facingMode: "user" },
  audio: true,
};

let roomID;

const Stream = () => {
  const [me, setMe] = useState(null);
  let { search } = useLocation();
  const [videoAllowed, setVideoAllowed] = useState(true);
  const [audioAllowed, setAudioAllowed] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [modal, setModal] = useState(false);
  const myVideo = useRef(null);
  const [owner, setOwner] = useState(false);

  // getting token from iframe
  useEffect(() => {
    getUserData(search);
  }, []);

  // user info api call
  const getUserData = (loginToken) => {
    axios
      .post(
        "https://jobportal.itexpertiseindia.com/workinghongkong/public/api/list/users",
        {
          user_token: loginToken.slice(1),
        }
      )
      .then((data) => {
        setMe(data.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // webRTC
  useEffect(() => {
    if (me) {
      // connecting to socket
      socket = socketIOClient(ENDPOINT, { query: "id=" + me.user_id });

      socket.on("video-offer", handleVideoOffer);

      socket.on("new icecandidate", handleNewIceCandidate);

      socket.on("video-answer", handleVideoAnswer);

      socket.on("remove peer all", (sid) => {
        Swal.fire({
          title: "Streaming ended",
          text: "You will be returned to main menu.",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Okay!",
        }).then((result) => {
          window.location.reload();
        });
      });

      window.addEventListener("beforeunload", function () {
        socket.emit("leaving room", roomID, socket.id);
      });

      socket.on("action", (msg, sid) => {
        if (msg == "mute") {
          document.querySelector(`#mute${sid}`).style.visibility = "visible";
          micInfo[sid] = "off";
        } else if (msg == "unmute") {
          document.querySelector(`#mute${sid}`).style.visibility = "hidden";
          micInfo[sid] = "on";
        } else if (msg == "videooff") {
          document.querySelector(`#vidoff${sid}`).style.visibility = "visible";
          videoInfo[sid] = "off";
        } else if (msg == "videoon") {
          document.querySelector(`#vidoff${sid}`).style.visibility = "hidden";
          videoInfo[sid] = "on";
        }
      });
    
    }

  }, [me]);

  // Get ICE Candidate
  const handleNewIceCandidate = (candidate, sid) => {
    // console.log("new candidate recieved");
    var newcandidate = new RTCIceCandidate(candidate);

    connections[sid].addIceCandidate(newcandidate).catch(reportError);
  };

  // Answering Video offer
  const handleVideoAnswer = (answer, sid) => {
    // console.log("answered the offer");

    const ans = new RTCSessionDescription(answer);
    connections[sid].setRemoteDescription(ans);
  };

  // Handling video offer
  const handleVideoOffer = (offer, sid, cname, micinf, vidinf) => {
    cName[sid] = cname;
    setModal(true);
    // console.log("video offered recevied");
    micInfo[sid] = micinf;
    videoInfo[sid] = vidinf;
    connections[sid] = new RTCPeerConnection(configuration);

    connections[sid].onicecandidate = function (event) {
      if (event.candidate) {
        // console.log("icecandidate fired");
        socket.emit("new icecandidate", event.candidate, sid);
      }
    };

    let desc = new RTCSessionDescription(offer);

    connections[sid]
      .setRemoteDescription(desc)
      .then(() => {
        return navigator.mediaDevices.getUserMedia(mediaConstraints); ///streamer webcam
      })
      .then((localStream) => {
        localStream.getTracks().forEach((track) => {
          connections[sid].addTrack(track, localStream);
          // console.log("added local stream to peer");
          if (track.kind === "audio") {
            audioTrackSent[sid] = track;
            audioTrackSent[sid].enabled = true;
          } else {
            videoTrackSent[sid] = track;
            videoTrackSent[sid].enabled = true;
          }
        });
      })
      .then(() => {
        return connections[sid].createAnswer();
      })
      .then((answer) => {
        return connections[sid].setLocalDescription(answer);
      })
      .then(() => {
        socket.emit("video-answer", connections[sid].localDescription, sid);
      })
      .catch(handleGetUserMediaError);
  };

  // Error handling
  const handleGetUserMediaError = (e) => {
    switch (e.name) {
      case "NotFoundError":
        Swal.fire({
          title: "Error",
          text: "Unable to open your call because no camera and/or microphone were found.",
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Okay!",
        }).then((result) => {
          window.location.reload();
        });

        break;
      case "SecurityError":
      case "PermissionDeniedError":
        break;
      default:
        Swal.fire({
          title: "Error",
          text: "Error opening your camera and/or microphone: " + e.message,
          icon: "success",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Okay!",
        }).then((result) => {
          window.location.reload();
        });
        break;
    }
  };

  // Start Stream by seller
  const startStream = () => {
    setModal(true);
    setOwner(true);
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((localstreams) => {
        setLocalStream(localstreams);
        myVideo.current.srcObject = localstreams;
         roomID = uuidv4();
        // setRoom(roomID);
        socket.emit(
          "join room",
          roomID,
          me?.name + ", " + me?.email,
          "owner"
        );
      })
      .catch((err) => {
        Swal.fire({
          title: err,
          text: "Please try again later",
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Okay!",
        }).then((result) => {
          window.location.reload();
        });
      });
  };

  // video actions ---> enable, disable video by streamer
  const videoAction = () => {
    if (videoAllowed) {
      for (let key in videoTrackSent) {
        videoTrackSent[key].enabled = false;
      }
      setVideoAllowed(false);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.kind === "video") {
            track.enabled = false;
          }
        });
      }
      socket.emit("action", "videooff");
    } else {
      for (let key in videoTrackSent) {
        videoTrackSent[key].enabled = true;
      }
      setVideoAllowed(true);
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.kind === "video") track.enabled = true;
        });
      }
      socket.emit("action", "videoon");
    }
  };

   // video actions ---> enable, disable audio by streamer
  const audioAction = () => {
    if (audioAllowed) {
      for (let key in audioTrackSent) {
        audioTrackSent[key].enabled = false;
      }
      setAudioAllowed(false);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.kind === "audio") {
            track.enabled = false;
          }
        });
      }
      socket.emit("action", "mute");
    } else {
      for (let key in audioTrackSent) {
        audioTrackSent[key].enabled = true;
      }
      setAudioAllowed(true);
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          if (track.kind === "audio") track.enabled = true;
        });
      }
      socket.emit("action", "unmute");
    }
  };

  // end stream function
  const closeStream = () => {
    window.location.reload();
  };

  // full screen streaming window
  function goFullscreen(id) {
    var element = document.getElementById(id);
    console.log(element);
    if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }
  }

  return (
    <>
      {/* <Header /> */}
      <div className="mainWapper stream">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="title d-flex align-items-center justify-content-between">
                <h3>Live Streaming</h3>

                {!modal && !modal ? (
                  <>
                    <div className="text-center">
                      <button
                        className="btn-custom second"
                        onClick={startStream}
                      >
                        Go Live
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="btn-custom second" onClick={closeStream}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="liveStream">
            {modal && modal ? (
              <>
                <div className={`videoContainer  compress`}>
                  <button
                    className="expand"
                    onClick={() => goFullscreen("player")}
                  >
                    <i className="fas fa-expand"></i>
                    <i className="fas fa-compress"></i>
                  </button>
                  <div
                    className={`videos myVideo ${owner === false && "d-none"}`}
                  >
                    <video
                      autoPlay
                      playsInline
                      id="player"
                      width="100%"
                      className={`video ${owner === false && "d-none"}`}
                      ref={myVideo}
                    />

                    <div className="utils">
                      <div
                        className={`audio ${!audioAllowed && "bg-red"}`}
                        onClick={audioAction}
                      >
                        {audioAllowed ? (
                          <i className="fas fa-microphone"></i>
                        ) : (
                          <i className="fas fa-microphone-slash"></i>
                        )}
                      </div>
                      <div
                        className={`novideo ${!videoAllowed && "bg-red"}`}
                        onClick={videoAction}
                      >
                        {videoAllowed ? (
                          <i className="fas fa-video"></i>
                        ) : (
                          <i className="fas fa-video-slash"></i>
                        )}
                      </div>
                      <div
                        className="cutcall"
                        onClick={() => window.location.reload()}
                      >
                        <i className="fas fa-phone-slash"></i>
                      </div>
                    </div>

                    {!audioAllowed && (
                      <div className="mute-icon" id="mymuteicon">
                        <i className="fas fa-microphone-slash"></i>
                      </div>
                    )}
                    {!videoAllowed && (
                      <div className="video-off">Video Off</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="content">
                  <img src="assets/img/1661901.png" alt="" />
                  <h3>Click on Go Live button to start streaming</h3>
                  {/* <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit, corporis!</p> */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Stream;

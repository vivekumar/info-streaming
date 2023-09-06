const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
var cors = require("cors");

const PORT = process.env.PORT || 3003;

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = socketio(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));

let rooms = {};
let socketroom = {};
let socketname = {};
let socketType = {};
let micSocket = {};
let videoSocket = {};

//create socket connection
io.on("connection", (socket) => {
  const id = socket.handshake.query["id"];

  // show avl live rooms
  io.emit("avl-rooms", rooms);

  // viwers join the socket room 
  socket.on("accept call", (roomid, userId) => {
    socket.join(roomid);
    socketroom[socket.id] = roomid;

    if (rooms[roomid] && rooms[roomid].length > 0) {
      rooms[roomid].push(socket.id);
      io.to(socket.id).emit(
        "join room",
        rooms[roomid].filter((pid) => pid != socket.id),
        socketname,
        null,
        null,
      );
    } else {
      rooms[roomid] = [socket.id];
      io.to(socket.id).emit("join room", null, null, null, null);
    }
  });

  // owner creates the socket room and join 
  socket.on("join room", (roomid, username, owner) => {
    
    socket.join(roomid);
    socketroom[socket.id] = roomid;
    socketname[socket.id] = username;
    socketType[socket.id] = owner;

    if (rooms[roomid] && rooms[roomid].length > 0) {
      rooms[roomid].push(socket.id);
      io.to(socket.id).emit(
        "join room",
        rooms[roomid].filter((pid) => pid != socket.id),
        socketname,
      );
    } else {
      rooms[roomid] = [socket.id];
      io.to(socket.id).emit("join room", null, null, null, null,socket.id);
    }

    showRooms(); 
  });

// actions during live stream
  socket.on("action", (msg) => {
    if (msg == "mute") micSocket[socket.id] = "off";
    else if (msg == "unmute") micSocket[socket.id] = "on";
    else if (msg == "videoon") videoSocket[socket.id] = "on";
    else if (msg == "videooff") videoSocket[socket.id] = "off";

    socket.to(socketroom[socket.id]).emit("action", msg, socket.id);
  });

  // video offer
  socket.on("video-offer", (offer, sid) => {
    socket
      .to(sid)
      .emit(
        "video-offer",
        offer,
        socket.id,
        socketname[socket.id],
        micSocket[socket.id],
        videoSocket[socket.id]
      );
  });

  // video answer
  socket.on("video-answer", (answer, sid) => {
    socket.to(sid).emit("video-answer", answer, socket.id);
  });

  // Get icecandidate
  socket.on("new icecandidate", (candidate, sid) => {
    socket.to(sid).emit("new icecandidate", candidate, socket.id);
  });
  //   io.to(socketroom[socket.id]).emit(
  //     "message",
  //     msg,
  //     username,
  //     moment().format("h:mm a"),
  //     image
  //   );
  // });

  // Stop live stream
  socket.on("disconnect", () => {

    if (!socketroom[socket.id]) return;
    if (!rooms[socketroom[socket.id]]) return;
    if (!socketType[socket.id]) {
      socket
        .to(socketroom[socket.id])
        .emit("remove peer", socket.id, socketname[socket.id]);

      var index = rooms[socketroom[socket.id]].indexOf(socket.id);

      rooms[socketroom[socket.id]].splice(index, 1);

      io.to(socketroom[socket.id]).emit(
        "user count",
        rooms[socketroom[socket.id]].length
      );
      delete socketroom[socket.id];
      io.emit("avl-rooms", rooms);
    } else {
      socket.to(socketroom[socket.id]).emit("remove peer all", socket.id);
      delete rooms[socketroom[socket.id]];
      delete socketroom[socket.id];
      delete socketType[socket.id];
      delete socketname[socket.id];
      io.emit("avl-rooms", rooms);
    }
  });

  // get avl rooms
  const showRooms = () =>{
    io.emit("avl-rooms", rooms);
  }

});

server.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`)
);
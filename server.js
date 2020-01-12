require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 3000;

let users = [];
let connections = [];
let messages = [];

io.on("connection", socket => {
  connections.push({ name: "", room: "", id: socket.id });
  console.log("NEW USER JOINED:", connections);

  // Canvas
  socket.on("coord", data => {
    console.log("coord", data);
    io.emit("getCoord", data);
  });

  socket.on("dotCoord", data => io.emit("getDotCoord", data));

  // Join room
  socket.on("join global", ({ room, name }) => {
    console.log("socket", socket);
    socket.join(room);
    socket.to(room).emit("global-joinMsg", `${name} has joined!`);
    connections.map(connection => {
      if (connection.id === socket.id) {
        connection.name = name;
        connection.room = room;
        socket.emit("initialize", connection);
        users.push(connection);
      }
    });
    console.log("USERS:", users);
    let userList = users.map(user => {
      if (user.room === room) {
        return user;
      }
    });
    io.to(room).emit("users list", userList);

    // Chat
    io.to(room).emit("getMsg", messages);

    socket.on("newMsg", data => {
      messages.push(data);
      io.emit("receiveMsg", messages);
    });
  });

  // Disconnection
  socket.on("disconnect", () => {
    let disconnectedUser = connections.filter(connection => connection.id === socket.id);
    users.splice(users.indexOf(socket.id), 1);
    console.log("DISCONNECTED-USER:", disconnectedUser);
    console.log("REMAINING:", users);
    io.emit("User disconnected");
  });
});

const homeRoute = require("./routes/home");
////////////////////////////////////////////////////////////////////////
app.use("/api/home", homeRoute());

server.listen(PORT, console.log(`Listening on port ${PORT}`));

// todo:
// 1: remove users from connection list upon connection
// 2: session caching
// 3: room integration for canvas

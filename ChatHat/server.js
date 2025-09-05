const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static("public"));

let users = {};

let usersBySocket = {};
let usersByCode = {};

io.on("connection", (socket) => {
  const uniqueCode = uuidv4().slice(0, 6);
  usersBySocket[socket.id] = uniqueCode;
  usersByCode[uniqueCode] = socket.id;
  socket.emit("yourCode", uniqueCode);

  socket.on("sendMessage", ({ toCode, message }) => {
    const targetSocketId = usersByCode[toCode];
    if (targetSocketId && io.sockets.sockets.get(targetSocketId)) {
      io.to(targetSocketId).emit("receiveMessage", {
        fromCode: usersBySocket[socket.id],
        message,
      });

    } else {
      socket.emit("errorMessage", "User not found or offline");
    }
  });
  
  socket.on("disconnect", () => {
    const code = usersBySocket[socket.id];
    delete usersBySocket[socket.id];
    if (code) delete usersByCode[code];
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

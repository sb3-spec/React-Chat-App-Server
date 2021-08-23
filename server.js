const express = require('express');
const app = express();
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000

const router = require('./router');
const { isFunction, callbackify } = require('util');

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin:"*"
    }
});

io.on('connection', (socket) => {

    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error)

        socket.emit("message", { user: "admin", text: `${user.name}, welcome to ${user.room}`});
        socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined`});

        socket.join(user.room);

        callback();
    });

    socket.on('disconnect', () => {
        console.log("User has disconnected")
    })
});

socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit({ message, callback });

    callback();
})
app.use(router);

server.listen(PORT, ()=> {
    console.log(`Server has started on ${PORT}`)
})
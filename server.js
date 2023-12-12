const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Run when a client connects
io.on('connection', socket => {
    // Welcome current user
    socket.emit('message', 'Welcome to ChitChat!')

    //Broadcasts to all when a user connects except the one who connect
    socket.broadcast.emit('message', 'A user has joined the chat')

    // This runs when client disconnects
    socket.on('disconnect', () => {
        // io.emit() all the clients/users
        io.emit('message', 'A user has left the chat')
    })

    // Listen for chatmessage
    socket.on('chatMessage',(msg)=>{
        io.emit('message',msg)
    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))
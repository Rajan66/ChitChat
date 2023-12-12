const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChitChat Bot'

// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)
        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChitChat!'))

        //Broadcasts to all when a user connects except the one who connect
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`))
    })
    

    // Listen for chatmessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(`${user.username}`, msg))
    })

    // This runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            // io.emit() all the clients/users
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
        }

    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))
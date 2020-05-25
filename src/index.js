const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    

    // //server (emit) -> to new client (recieve) - countUpdated
    // socket.emit('countUpdated', count)

    socket.on('join', ({
                username,
                room
            }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        //socket.emit -> sends message to specific client
        //io.emit -> sends message to every client
        //socket.broadcast.emit -> sends message to every client except the client emiiting the event
        socket.emit('message', generateMessage('Welcome'))
        
        //io.to.emit -> emits an event to everybody in a specific room
        //socket.broadcast.to.emit -> sends message to every client except the client emiiting the event and limits it to a chat room
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        console.log(getUser)
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(msg))
        callback()
        // console.log(msg)
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()

    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
        }
    })
})



server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
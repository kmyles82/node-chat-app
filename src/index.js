const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')

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

    socket.on('join', ({ username, room }) => {
        socket.join(room)

        //socket.emit -> sends message to specific client
        //io.emit -> sends message to every client
        //socket.broadcast.emit -> sends message to every client except the client emiiting the event
        socket.emit('message', generateMessage('Welcome'))
        
        //io.to.emit -> emits an event to everybody in a specific room
        //socket.broadcast.to.emit -> sends message to every client except the client emiiting the event and limits it to a chat room
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }

        io.to('Center City').emit('message', generateMessage(msg))
        callback()
        // console.log(msg)
    })

    socket.on('sendLocation', (location, callback) => {
        
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()

    })

    

    

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'))
    })
})



server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
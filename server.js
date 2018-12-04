var express = require('express')
var app = express()
var path = require('path')
app.set('views', __dirname + '/views')


require('./server/config/routes')(app)
app.use(express.static(path.join(__dirname, '/static')));
app.set('view engine', 'ejs')
const server = app.listen(8000, '192.168.0.212', () => {
    console.log("Listening on port 8000")
})

var numUsers = 0
var rooms = [{sockets : [], roomID : 0}]

var io = require('socket.io')(server)

io.on('connection', (socket) => {

    findOpenRoom(socket)


    // console.log("user joined the game")
    // console.log(rooms)
    // console.log("\n")
    
    socket.on('disconnect', () => {
        leaveGame(socket.id)
        // console.log("user left the game")
        // console.log(rooms)
        // console.log("\n")
    })

    socket.on('newMsg', function(data){
        io.to(data.ID).emit("greeting", data.message)
    })
    
    socket.on("userClicked", function(data){
        io.to(data.ID).emit("updatedGame", {world : data.worldArr, turn : data.turn, isGameOver : data.isGameOver})
    })
})

function findOpenRoom(socket){
    var joined = false
    //parse through the rooms to find an open slot for the new socket
    for (var i = 0; i < rooms.length; i++){
        //if the num of sockets in a room is less than two, join this one
        if (rooms[i].sockets.length < 2) {
            rooms[i].sockets.push(socket.id)
            socket.join(rooms[i].roomID)
            socket.emit("welcome", {roomID : rooms[i].roomID, playerNumber : rooms[i].sockets.length})
            joined = true
            break
        }
    }

    // if we've exited the for loop and haven't joined, make a new room
    if (!joined){
        var lastRoomID = rooms[rooms.length - 1].roomID
        rooms.push({sockets : [], roomID : lastRoomID + 1})
        rooms[rooms.length - 1].sockets.push(socket.id)
        socket.join(rooms[rooms.length - 1].roomID)
        socket.emit("welcome", {roomID : rooms[rooms.length - 1].roomID, playerNumber : 1})

    }

}

function leaveGame(id){
    //look through the entirety of the rooms for the socket id
    for (var i = 0; i < rooms.length; i++){
        // look through the sockets in each room
        for (var j = 0; j < rooms[i].sockets.length; j++){
            if (rooms[i].sockets[j] == id){
                rooms[i].sockets.splice(j, 1)
            }
        }
    }
}


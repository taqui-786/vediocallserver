const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const userRouter = require('./route')


const app = express()
app.use(cors());
dotenv.config();
const server = require('http').createServer(app)



app.use(express.json())
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("connected To Database")).catch((err) => console.log(err))


app.use(userRouter)


const PORT = process.env.PORT || 5000;
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});
app.get('/', (req, res) => {
	res.send('Running');
});
const emailToSocketMapping = new Map();
let activeUsers =  new Array();

io.on('connection', socket => {
    socket.emit('me',socket.id);
    socket.on('user-join', (data)=>{
        let {emailId} = data;
        emailToSocketMapping.set(emailId,socket.id)
        if(!activeUsers.some((user) => user.userId === emailId)){
            activeUsers.push({
                userId:emailId,
                socketId:socket.id

            })
            
        }
        socket.emit('active-users',activeUsers );
        socket.broadcast.emit('active-users',activeUsers );
        
    })
 


socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    const socketId = emailToSocketMapping.get(userToCall);
    io.to(socketId).emit("callUser", { signal: signalData, from, name });
});

socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
});
socket.on("rejectCall", (data) => {
    io.to(data.to).emit('endedRes',"call is rejected")
});
socket.on('disconnect', () => {
    activeUsers = activeUsers.filter((user)=> user.socketId !== socket.id )
    socket.broadcast.emit('active-users',activeUsers );
    
socket.emit("callended");
;
}); 
})

server.listen(PORT, console.log("Server is running 5000"))

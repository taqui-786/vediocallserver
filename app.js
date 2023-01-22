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
io.on('connection', socket => {
    socket.emit('me',socket.id);
    socket.on('disconnect', () => {
    socket.broadcast.emit("callended");
}); 

socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
});

socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
});
socket.on("rejectCall", (data) => {
    io.to(data.to).emit('endedRes',"call is rejected")
});

})

server.listen(PORT, console.log("Server is running 5000"))

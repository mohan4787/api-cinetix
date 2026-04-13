
const http = require("http")
const app = require("./src/config/express.config")
const { initSocket } = require("./src/utilities/socket")
const server = http.createServer(app)
initSocket(server);   

const PORT = 9005
const HOST = "127.0.0.1"

server.listen(PORT,"0.0.0.0", (err) => {
    if(!err) {
        console.log("Server is running on port:",PORT);
        console.log("Press CTRL+C to discontinue server........");  
    }
})

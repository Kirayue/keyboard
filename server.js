import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as fs from 'fs'
let server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({
   extended:true
}))
server.use(express.static('./dist'))
server.get('/',(res,req)=>{
   res.sendFile(path.join(__dirname+'./dist/index.html'))
})

server.post('/sendData',(res,req)=>{
   console.log(req.body)
})
server.listen(8888,()=>{
    console.log('Port:8888 ')
})

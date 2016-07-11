import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import fs from 'fs'
let server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({
   extended:true
}))
server.use(express.static('./dist'))
server.get('/',(res,req)=>{
   res.sendFile(path.join(__dirname+'./dist/index.html'))
})

server.post('/sendData',(req,res)=>{
   console.log(req.body)

})
server.listen(8888,()=>{
    console.log('Port:8888 ')
})

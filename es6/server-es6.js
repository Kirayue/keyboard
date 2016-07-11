import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import fs from 'fs'
import {Do} from './do-es6' //import function

export function Server(){
  let server = express()
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({
     extended:true
  }))
  server.use(express.static('./dist'))
  server.get('/',(req,res)=>{
     res.sendFile(path.join(__dirname+'./dist/index.html'))
  })

  server.post('/sendData',(req,res)=>{
     //console.log(req.body)
     console.log(Do(req.body,res));
  })
  server.listen(8888,()=>{
      console.log('Port:8888 ')
  })
}

// vi:et:sw=2:ts=2

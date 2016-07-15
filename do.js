//! space character

import csvStringify from 'csv-stringify'
import fs from 'fs'
import querystring from 'querystring'

let calculateStat = (app) => {
  let history = app.history
  let last = history.shift()
  let stat = {
    clicks: [],
    nCorrect: 0,
    nKey: history.length,
    WPM: (history.length - 1)/(history[history.length-1].timestamp-history[0].timestamp)*1000*60/5     //word per minute
  }
  for (let cur of history) {       //loop for add user.x and user.y
    let {id,x,y}  = cur.user
    console.log(' id: '+id+' x: '+x+' y: '+y)
    if (cur.user.id === cur.target.id){
      stat.nCorrect++
      app.keyAttr[id].shiftedKey.x += x
      app.keyAttr[id].shiftedKey.y += y
      app.keyAttr[id].nTap++
    }
  }
  for (let key of app.keyPool){    //loop for shifted x and y
     app.keyAttr[key].shiftedKey.x  /= app.keyAttr[key].nTap
     app.keyAttr[key].shiftedKey.y  /= app.keyAttr[key].nTap
  }
  for (let cur of history) {   //loop for statistics
    let click = [], i = 0 
    let keyCenter = {x: app.keyAttr[cur.target.id].keyOffset.top + app.keySize.height/2, y:app.keyAttr[cur.target.id].keyOffset.left + app.keySize.width/2 }

    click[i++] = cur.target.id //target.id
    click[i++] = cur.user.id //user.id
    click[i++] = cur.timestamp - last.timestamp // duration
    click[i++] = cur.user.x  // x 
    click[i++] = cur.user.y  // y 
    click[i++] = cur.user.x - last.user.x // x displacement
    click[i++] = cur.user.y - last.user.y // y displacement
    click[i++] = Math.abs(click[i - 3]) // abs x displacement
    click[i++] = Math.abs(click[i - 3]) // abs y displacement
    click[i++] = Math.pow((Math.pow(click[i-3],2)+Math.pow(click[i-3],2)),1/2)
    click[i++] = cur.user.x - keyCenter.x //x displacement relates to keyCenter 
    click[i++] = cur.user.y - keyCenter.y //y displacement relates to keyCenter
    click[i++] = Math.abs(click[i - 3])  //abs x displacement relates to keyCenter
    click[i++] = Math.abs(click[i - 3])  //abs y displacement relates to keyCenter
    click[i++] = app.keyAttr[cur.user.id].shiftedKey.x // shiftedKey x
    click[i++] = app.keyAttr[cur.user.id].shiftedKey.y // shiftedKey y
    click[i++] = cur.user.x - app.keyAttr[cur.user.id].shiftedKey.x  //x displacement relates to shiftedKey
    click[i++] = cur.user.y - app.keyAttr[cur.user.id].shiftedKey.y  //y displacement relates to shiftedKey
    click[i++] = Math.abs(click[i - 3]) //abs x displacement relates to shiftedKey
    click[i++] = Math.abs(click[i - 3]) //abs y displacement relates to shiftedKey

    stat.clicks.push(click)
    last = cur
  }

  stat.accuracy = stat.nCorrect / stat.nKey
  return stat
}

let Do = (query, res) => {
  let path = './tp6vu6bp4/', trial
  if ('string' === typeof query)
    trial = JSON.parse(querystring.parse(query).app)
  else if ('object' === typeof query) {
    trial = JSON.parse(query.app)
    path = './dist/' + path
  }
  let stat = calculateStat(app, res)
  //! this should inside calculateStat, know why?
  stat.clicks.unshift(['Target','User','Duration(ms)','X','Y','displacement X','displacement Y','abs X','abs Y','X to keyCenter ','Y to keyCenter','abs X to keyCenter','abs Y to keyCenter','shifted X','shifted Y','X to shiftedKey','Y to shiftedKey','abs X to shiftedKey','abs Y to shiftedKey'])
  csvStringify(stat.clicks, (err, output) => {
    fs.writeFile(path+app.endTime+'.csv', output, null, '\t'), 'utf8', err => {
      if (err) throw err
      console.log('Saved!')
    }
  })
}

if (process.env.HTTP_HOST) { // from apache
  console.log("Content-type: text/plain\n")
  Do(process.env.QUERY_STRING, console)
}

module.exports = Do

// vi:et:sw=2:ts=2

//! space character
import csvStringify from 'csv-stringify'
import fs from 'fs'
import querystring from 'querystring'
import moment from 'moment/moment.js'

let calculateStat = (trial) => { 
  let history = trial.history
  let last = history.shift()
  let stat = {
    timestamp:trial.timestamp,
    clicks: [],
    nCorrect: 0,
    nKey: history.length,
    mean:{},
    WPM: (history.length - 1)/(history[history.length-1].timestamp-history[0].timestamp)*1000*60/5     //word per minute
  }
  for (let i of trial.keyList) {//loop for initial mean
    stat.mean[i] = { x: 0, y: 0 ,nTap:0}
  }
  for (let cur of history) { //loop for add user.x and user.y
    let { id, x, y}  = cur.user
    if (cur.user.id === cur.target.id){
      stat.nCorrect++
      stat.mean[id].x += x
      stat.mean[id].y += y
      stat.mean[id].nTap++
    }
  }
  for (let key of trial.keyList){ //loop for mean x and y
     stat.mean[key].x  /= stat.mean[key].nTap
     stat.mean[key].y  /= stat.mean[key].nTap
  }
  for (let cur of history) { //loop for statistics
    let click = [], i = 0
    let { id, x, y} = cur.user
    let { height, width} = trial.keySize
    let keyCenter = { y:trial.keyOffset[cur.target.id].top + height/2, x:trial.keyOffset[cur.target.id].left + width/2 }
    let leftBound = keyCenter.x - 0.75*height , rightBound = keyCenter.x + 0.75*height ,
         topBound = keyCenter.y - height ,  downBound = keyCenter.y + height
    click[i++] = x >= leftBound && x <= rightBound && y >= topBound && y <= downBound ? 'count':'not count'    
    click[i++] = cur.target.id //target.id
    click[i++] = cur.user.id //user.id
    click[i++] = cur.timestamp - last.timestamp // duration
    click[i++] = x  // x 
    click[i++] = y  // y 
    click[i++] = cur.user.x - last.user.x // x displacement
    click[i++] = cur.user.y - last.user.y // y displacement
    click[i++] = Math.abs(click[i - 3]) // abs x displacement
    click[i++] = Math.abs(click[i - 3]) // abs y displacement
    click[i++] = Math.pow((Math.pow(click[i-3],2)+Math.pow(click[i-3],2)),1/2)
    click[i++] = click[i - 2]/click[i - 9]
    click[i++] = x - keyCenter.x //x displacement relates to keyCenter 
    click[i++] = y - keyCenter.y //y displacement relates to keyCenter
    click[i++] = Math.abs(click[i - 3])  //abs x displacement relates to keyCenter
    click[i++] = Math.abs(click[i - 3])  //abs y displacement relates to keyCenter
    click[i++] = stat.mean[cur.user.id].x // shiftedKey x
    click[i++] = stat.mean[cur.user.id].y // shiftedKey y
    click[i++] = x - stat.mean[cur.user.id].x  //x displacement relates to shiftedKey
    click[i++] = y - stat.mean[cur.user.id].y  //y displacement relates to shiftedKey
    click[i++] = Math.abs(click[i - 3]) //abs x displacement relates to shiftedKey
    click[i++] = Math.abs(click[i - 3]) //abs y displacement relates to shiftedKey

    stat.clicks.push(click)
    last = cur
  }
  stat.clicks.unshift(['Count','Target','User','Duration(ms)','X','Y','displacement X','displacement Y','abs X','abs Y','distance','velocity(px/ms)','X to keyCenter ','Y to keyCenter','abs X to keyCenter','abs Y to keyCenter','shifted X','shifted Y','X to shiftedKey','Y to shiftedKey','abs X to shiftedKey','abs Y to shiftedKey'])
  stat.clicks.push([""],["WPM"],[stat.WPM])
  stat.accuracy = stat.nCorrect / stat.nKey
  //! list required statistics here
  console.log(stat)
  return stat
}
let Do = (query, res) => {
  let path = './tp6vu6bp4/', trial
  if ('string' === typeof query)
    trial = JSON.parse(querystring.parse(query).trial)
  else if ('object' === typeof query) {
    trial = JSON.parse(query.trial)
    path = './dist/' + path
  }
  let stat = calculateStat(trial,res)
  csvStringify (stat.clicks, (err,output) => {
     fs.writeFile(path+moment(stat.timestamp).format('YYYY-MM-DD_HH:mm:ss')+'.csv', output, null,'\t'),'utf8', (err) => {
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

import csvStringify from 'csv-stringify'
import fs from 'fs'
import moment from 'moment/moment.js'
import querystring from 'querystring'


function calculateStat(trial){
  let strokes = trial.history
  let lastStroke = strokes.shift()
  let stat = {
    keyCenter: {
      checkBound (keyId, userX, userY) {
        let leftBound = stat.keyCenter[keyId].x - 0.75 * trial.keySize.height, 
           rightBound = stat.keyCenter[keyId].x + 0.75 * trial.keySize.height,
             topBound = stat.keyCenter[keyId].y - trial.keySize.height,
            downBound = stat.keyCenter[keyId].y + trial.keySize.height
        return userX >= leftBound && userX <= rightBound && userY >= topBound && userY <= downBound ? 'count':'not count' 
      }
    },
    nCorrect: 0,
    nStroke: strokes.length,
    strokes: [],
    strokeCenter: {},
    timestamp: trial.timestamp,
    // word per minute, ~5 key strokes per word
    WPM: (strokes.length - 1) / (strokes[strokes.length-1].timestamp - lastStroke.timestamp) * 1000 * 60 / 5,
  }

  // stroke center && keyCenter
  for (let i of trial.keyList) {
    stat.strokeCenter[i] = { n: 0, x: 0, y: 0 }
    // init keyCenter
    stat.keyCenter[i] = { 
      y: trial.keyOffset[i].top + trial.keySize.height/2,
      x: trial.keyOffset[i].left + trial.keySize.width/2,
    } 
  }
  for (let i of strokes) {
    let { target:{ id:targetId }, user: { id, x, y }} = i
    if (id !== targetId) continue
    stat.nCorrect++
    stat.strokeCenter[id].x += x
    stat.strokeCenter[id].y += y
    stat.strokeCenter[id].n++
  }
  for (let i of trial.keyList) {
    stat.strokeCenter[i].x /= stat.strokeCenter[i].n
    stat.strokeCenter[i].y /= stat.strokeCenter[i].n
  }

  let curStroke, i, stroke
  function displacement(ref) {
    stroke[i++] = curStroke.user.x - ref.x // x displacement
    stroke[i++] = curStroke.user.y - ref.y // y displacement
    stroke[i++] = Math.abs(stroke[i-3]) // abs x displacement
    stroke[i++] = Math.abs(stroke[i-3]) // abs y displacement
  }
  for (curStroke of strokes) {
    let id
    i = 0, id = curStroke.target.id, stroke = []
    stroke[i++] = stat.keyCenter.checkBound(id ,curStroke.user.x, curStroke.user.y)  
    stroke[i++] = curStroke.target.id // target key
    stroke[i++] = curStroke.user.id // user key
    stroke[i++] = curStroke.timestamp - lastStroke.timestamp // duration
    stroke[i++] = curStroke.user.x // x 
    stroke[i++] = curStroke.user.y // y 
    displacement(lastStroke.user) // displacement related last stroke
    stroke[i++] = Math.sqrt(stroke[i-3] * stroke[i-3] + stroke[i-2] * stroke[i-2]) // displacement to the last stroke
    stroke[i++] = stroke[i-2] / stroke[i-9] // speed (displacement / duration)
    displacement(stat.keyCenter[id]) // displacement related key center
    stroke[i++] = stat.strokeCenter[id].x // x of stroke center
    stroke[i++] = stat.strokeCenter[id].y // y of stroke center
    displacement(stat.strokeCenter[id]) // displacement related stroke center

    stat.strokes.push(stroke)
    lastStroke = curStroke
  }
  stat.strokes.unshift(['Count','Target','User','Duration(ms)','X','Y','displacement X','displacement Y','abs X','abs Y','distance','velocity(px/ms)','X to keyCenter ','Y to keyCenter','abs X to keyCenter','abs Y to keyCenter','shifted X','shifted Y','X to shiftedKey','Y to shiftedKey','abs X to shiftedKey','abs Y to shiftedKey'])
  stat.strokes.push([""],["WPM"],[stat.WPM])
  stat.accuracy = stat.nCorrect / stat.nStroke
  console.log(stat)
  return stat
}
function Do(query, res) {
  let path = 'tp6vu6bp4/', trial
  if ('string' === typeof query)
    trial = JSON.parse(querystring.parse(query).trial)
  else if ('object' === typeof query) {
    trial = JSON.parse(query.trial)
    path = './dist/' + path
  }
  let stat = calculateStat(trial, res)
  let csvName = path + moment(stat.timestamp).format('YYYY-MM-DD_HH:mm:ss') + '.csv'
  console.log(csvName)
  csvStringify(stat.strokes, (err, output) => {
    fs.writeFile(csvName, output, null, '\t'), 'utf8', (err) => {
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

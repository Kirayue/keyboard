import csvStringify from 'csv-stringify'
import fs from 'fs'
import moment from 'moment/moment.js'
import querystring from 'querystring'

let calculateStat = (trial) => {

  let hit = (x, y, keyId) => {
    if (x < stat.keyCenter[keyId].x - 0.75 * trial.keySize.height) return 'not count'
    if (x > stat.keyCenter[keyId].x + 0.75 * trial.keySize.height) return 'not count'
    if (y < stat.keyCenter[keyId].y - trial.keySize.height)        return 'not count'
    if (y > stat.keyCenter[keyId].y + trial.keySize.height)        return 'not count'
    return 'count'
  }

  let strokes = trial.history
  let lastStroke = strokes.shift()
  let stat = {
    nCorrect: 0,
    nStroke: strokes.length,
    strokes: [],
    strokeCenter: {},
    timestamp: trial.timestamp,
    // word per minute, ~5 key strokes per word
    WPM: (strokes.length - 1) / (strokes[strokes.length-1].timestamp - lastStroke.timestamp) * 1000 * 60 / 5,
  }

  ////////////////////////////////////////////////////////////////
  // key and stroke centers
  //! wrap with an anonymouse function
  let h = trial.keySize.height / 2, w = trial.keySize.width / 2
  for (let i of trial.keyboard) {
    stat.keyCenter[i] = { 
      x: trial.keyOffset[i].left + w,
      y: trial.keyOffset[i].top  + h,
    } 
    stat.strokeCenter[i] = { n: 0, x: 0, y: 0 }
  }
  for (let { target: { id: keyId }, user: { id: userKeyId, x, y } } of strokes) {
    if (userKeyId === keyId) nCorrect++
    if (!hit(x, y, keyId)) continue
    stat.strokeCenter[keyId].n++
    stat.strokeCenter[keyId].x += x
    stat.strokeCenter[keyId].y += y
  }
  for (let i of trial.keyList) {
    stat.strokeCenter[i].x /= stat.strokeCenter[i].n
    stat.strokeCenter[i].y /= stat.strokeCenter[i].n
  }

  ////////////////////////////////////////////////////////////////
  // stat
  let curStroke, i, stroke
  function displacement(ref) {
    stroke[i++] = curStroke.user.x - ref.x // x displacement
    stroke[i++] = curStroke.user.y - ref.y // y displacement
    stroke[i++] = Math.abs(stroke[i-3]) // abs x displacement
    stroke[i++] = Math.abs(stroke[i-3]) // abs y displacement
  }
  for (curStroke of strokes) {
    i = 0, , stroke = []
    let keyId = curStroke.target.id
    stroke[i++] = hit(curStroke.user.x, curStroke.user.y, keyId)
    stroke[i++] = curStroke.target.id // target key
    stroke[i++] = curStroke.user.id // user key
    stroke[i++] = curStroke.timestamp - lastStroke.timestamp // duration
    stroke[i++] = curStroke.user.x // x 
    stroke[i++] = curStroke.user.y // y 
    displacement(lastStroke.user) // displacement related last stroke
    stroke[i++] = Math.sqrt(stroke[i-3] * stroke[i-3] + stroke[i-2] * stroke[i-2]) // displacement to the last stroke
    stroke[i++] = stroke[i-2] / stroke[i-9] // speed (displacement / duration)
    displacement(stat.keyCenter[keyId]) // displacement related key center
    stroke[i++] = stat.strokeCenter[keyId].x // x of stroke center
    stroke[i++] = stat.strokeCenter[keyId].y // y of stroke center
    displacement(stat.strokeCenter[keyId]) // displacement related stroke center

    stat.strokes.push(stroke)
    lastStroke = curStroke
  }
  stat.strokes.unshift(['Count','Target','User','Duration(ms)','X','Y','displacement X','displacement Y','abs X','abs Y','distance','velocity(px/ms)','X to keyCenter ','Y to keyCenter','abs X to keyCenter','abs Y to keyCenter','shifted X','shifted Y','X to shiftedKey','Y to shiftedKey','abs X to shiftedKey','abs Y to shiftedKey'])
  stat.strokes.push([""],["WPM"],[stat.WPM])
  stat.accuracy = stat.nCorrect / stat.nStroke
  console.log(stat)
  return stat
}

let Do = (query, res) => {
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

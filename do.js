import csvStringify from 'csv-stringify'
import fs from 'fs'
import moment from 'moment/moment.js'
import querystring from 'querystring'

function calculateStat(trial)
  let strokes = trial.strokes
  let lastStroke = strokes.shift()
  let stat = {
    keyCenter: {},
    nCorrect: 0,
    nStroke: history.length,
    strokes: [],
    strokeCenter: {},
    timestamp: trial.timestamp,
    // word per minute, ~5 key strokes per word
    WPM: (strokes.length - 1) / (strokes[strokes.length-1].timestamp - lastStroke.timestamp) * 1000 * 60 / 5,
  }

  // stroke center
  for (let i of trial.keyList) {
    //! init stat.keyCenter here
    stat.strokeCenter[i] = { n: 0, x: 0, y: 0 }
  }
  for (let i of strokes) {
    if (i.user.id !== cur.target.id) continue
    stat.nCorrect++
    stat.strokeCenter[cur.user.id].x += cur.user.x
    stat.strokeCenter[cur.user.id].y += cur.user.y
    stat.strokeCenter[cur.user.id].n++
  }
  for (let i of trial.keyList) {
    stat.strokeCenter[i].x /= stat.strokeCenter[i].n
    stat.strokeCenter[i].y /= stat.strokeCenter[i].n
  }

  let curStroke, i, row
  function displacement(ref) {
    stroke[i++] = curStroke.user.x - ref.x // x displacement
    stroke[i++] = curStroke.user.y - ref.y // y displacement
    stroke[i++] = Math.abs(row[i-3]) // abs x displacement
    stroke[i++] = Math.abs(row[i-3]) // abs y displacement
  }
  for (curStroke of strokes) {
    i = 0, id = curStroke.target.id, stroke = []
    //let {height, width} = trial.keySize
    //let keyCenter = { y:trial.keyOffset[cur.target.id].top + height/2, x:trial.keyOffset[cur.target.id].left + width/2 }
    let leftBound = keyCenter.x - 0.75*height , rightBound = keyCenter.x + 0.75*height ,
         topBound = keyCenter.y - height ,  downBound = keyCenter.y + height
    //! should consider in stroke center calculation?
    stroke[i++] = x >= leftBound && x <= rightBound && y >= topBound && y <= downBound ? 'count':'not count'    
    stroke[i++] = curStroke.target.id // target key
    stroke[i++] = curStroke.user.id // user key
    stroke[i++] = curStroke.timestamp - lastStroke.timestamp // duration
    stroke[i++] = curStroke.user.x // x 
    stroke[i++] = curStroke.user.y // y 
    displacement(lastStroke.user.x) // displacement related last stroke
    stroke[i++] = Math.sqrt(stroke[i-3] * stroke[i-3] + stroke[i-2] * stroke[i-2]) // displacement to the last stroke
    stroke[i++] = stroke[i-2] / stroke[i-9] // speed (displacement / duration)
    displacement(stat.keyCenter[id]) // displacement related key center
    stroke[i++] = stat.strokeCenter[id].x // x of stroke center
    stroke[i++] = stat.strokeCenter[id].y // y of stroke center
    displacement(stat.strokeCenter[id]) // displacement related stroke center

    stat.strokes.push(row)
    lastStroke = curStroke
  }
  stat.strokes.unshift(['Count','Target','User','Duration(ms)','X','Y','displacement X','displacement Y','abs X','abs Y','distance','velocity(px/ms)','X to keyCenter ','Y to keyCenter','abs X to keyCenter','abs Y to keyCenter','shifted X','shifted Y','X to shiftedKey','Y to shiftedKey','abs X to shiftedKey','abs Y to shiftedKey'])
  stat.strokes.push([""],["WPM"],[stat.WPM])
  stat.accuracy = stat.nCorrect / stat.nKey
  console.log(stat)
  return stat
}

function Do(query, res)
  let path = './tp6vu6bp4/', trial
  if ('string' === typeof query)
    trial = JSON.parse(querystring.parse(query).trial)
  else if ('object' === typeof query) {
    trial = JSON.parse(query.trial)
    path = './dist/' + path
  }
  let csvName = path + moment(stat.timestamp).format('YYYY-MM-DD_HH:mm:ss') + '.csv'
  let stat = calculateStat(trial, res)
  csvStringify(stat.clicks, (err, output) => {
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

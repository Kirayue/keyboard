/* eslint new-cap:['error', {'capIsNewExceptions':[Do]}],no-console:0,max-len:0 */
import csvStringify from 'csv-stringify'
import fs from 'fs'
import moment from 'moment/moment.js'
import rw from 'rw'
import iconvLite from 'iconv-lite'
import querystring from 'querystring'

const calculateStat = (trial) => {
  const strokes = trial.history
  let lastStroke = strokes.shift()
  const stat = {
    nCorrect: 0,
    nStroke: strokes.length,
    strokes: [],
    strokeCenter: {},
    keyCenter: {},
    timestamp: trial.timestamp,
    // word per minute, ~5 key strokes per word
    WPM: (strokes.length) / (strokes[strokes.length - 1].timestamp - lastStroke.timestamp) * 1000 * 60 / 5,
    R_keyCount: [0, 0, 0, 0, 0, 0, 0, 0, 0], // ['direction count','Left count to keyCenter','Right count to keyCenter','Left count to shiftedKey','Right count to shiftedKey']
    L_keyCount: [0, 0, 0, 0, 0, 0, 0, 0, 0], // ['direction count','Left count to keyCenter','Right count to keyCenter','Left count to shiftedKey','Right count to shiftedKey']
    T_keyCount: [0, 0, 0, 0, 0, 0, 0, 0, 0], // ['direction count','Top count to keyCenter','Down count to keyCenter','Top count to shiftedKey','Down count to shiftedKey']
    D_keyCount: [0, 0, 0, 0, 0, 0, 0, 0, 0], // ['direction count','Top count to keyCenter','Down count to keyCenter','Top count to shiftedKey','Down count to shiftedKey']
  }
  const hit = (x, y, keyId) => {
    if (x < stat.keyCenter[keyId].x - 0.75 * trial.keySize.height) return 'not count'
    if (x > stat.keyCenter[keyId].x + 0.75 * trial.keySize.height) return 'not count'
    if (y < stat.keyCenter[keyId].y - trial.keySize.height) return 'not count'
    if (y > stat.keyCenter[keyId].y + trial.keySize.height) return 'not count'
    return 'count'
  }

  // key and stroke centers
  {
    const h = trial.keySize.height / 2, w = trial.keySize.width / 2
    for (const i of trial.keyboard) {
      stat.keyCenter[i] = {
        x: trial.keyOffset[i].left + w,
        y: trial.keyOffset[i].top + h,
      }
      stat.strokeCenter[i] = { n: 0, x: 0, y: 0 }
    }
    for (const { target: { id: keyId }, user: { id: userKeyId, x, y } } of strokes) {
      if (userKeyId === keyId) stat.nCorrect++
      if (hit(x, y, keyId) !== 'count') continue
      stat.strokeCenter[keyId].n++
      stat.strokeCenter[keyId].x += x
      stat.strokeCenter[keyId].y += y
    }
    for (const i of trial.keyboard) {
      stat.strokeCenter[i].x /= stat.strokeCenter[i].n
      stat.strokeCenter[i].y /= stat.strokeCenter[i].n
    }
  }

  // stat
  let curStroke, i, stroke
  function displacement(ref) {
    stroke[i++] = curStroke.user.x - ref.x // x displacement
    stroke[i++] = curStroke.user.y - ref.y // y displacement
    stroke[i++] = stroke[i - 3] >= 0 ? 'Right' : 'Left' // horizontal direction
    stroke[i++] = stroke[i - 3] >= 0 ? 'Top' : 'Down' // vertical direction
    stroke[i++] = Math.abs(stroke[i - 5]) // abs x displacement
    stroke[i++] = Math.abs(stroke[i - 5]) // abs y displacement
    stroke[i++] = Math.sqrt(stroke[i - 3] * stroke[i - 3] + stroke[i - 2] * stroke[i - 2]) // displacement to the last stroke
  }
  for (curStroke of strokes) {
    i = 0
    stroke = []
    const keyId = curStroke.target.id
    stroke[i++] = keyId === curStroke.user.id ? 'T' : 'F'
    stroke[i++] = stat.strokes.length
    stroke[i++] = hit(curStroke.user.x, curStroke.user.y, keyId)
    stroke[i++] = keyId // target key
    stroke[i++] = curStroke.user.id // user key
    stroke[i++] = curStroke.timestamp - lastStroke.timestamp // duration
    stroke[i++] = curStroke.user.x // x
    stroke[i++] = curStroke.user.y // y
    displacement(lastStroke.user) // displacement related last stroke
    stroke[i++] = stroke[i - 2] / stroke[i - 9] // speed (displacement / duration)
    displacement(stat.keyCenter[keyId]) // displacement related key center
    stroke[i++] = stat.strokeCenter[keyId].x // x of stroke center
    stroke[i++] = stat.strokeCenter[keyId].y // y of stroke center
    displacement(stat.strokeCenter[keyId]) // displacement related stroke center

    if (stroke[10] === 'Right') {
      stat.R_keyCount[0]++
      stroke[18] === 'Left' ? stat.R_keyCount[1]++ : stat.R_keyCount[2]++
      stroke[19] === 'Top' ? stat.R_keyCount[3]++ : stat.R_keyCount[4]++
      stroke[27] === 'Left' ? stat.R_keyCount[5]++ : stat.R_keyCount[6]++
      stroke[28] === 'Top' ? stat.R_keyCount[7]++ : stat.R_keyCount[8]++
    }
    else {
      stat.L_keyCount[0]++
      stroke[18] === 'Left' ? stat.L_keyCount[1]++ : stat.L_keyCount[2]++
      stroke[19] === 'Top' ? stat.L_keyCount[3]++ : stat.L_keyCount[4]++
      stroke[27] === 'Left' ? stat.L_keyCount[5]++ : stat.L_keyCount[6]++
      stroke[28] === 'Top' ? stat.L_keyCount[7]++ : stat.L_keyCount[8]++
    }
    if (stroke[11] === 'Top') {
      stat.T_keyCount[0]++
      stroke[18] === 'Left' ? stat.T_keyCount[1]++ : stat.T_keyCount[2]++
      stroke[19] === 'Top' ? stat.T_keyCount[3]++ : stat.T_keyCount[4]++
      stroke[27] === 'Left' ? stat.T_keyCount[5]++ : stat.T_keyCount[6]++
      stroke[28] === 'Top' ? stat.T_keyCount[7]++ : stat.T_keyCount[8]++
    }
    else {
      stat.D_keyCount[0]++
      stroke[18] === 'Left' ? stat.D_keyCount[1]++ : stat.D_keyCount[2]++
      stroke[19] === 'Top' ? stat.D_keyCount[3]++ : stat.D_keyCount[4]++
      stroke[27] === 'Left' ? stat.D_keyCount[5]++ : stat.D_keyCount[6]++
      stroke[28] === 'Top' ? stat.D_keyCount[7]++ : stat.D_keyCount[8]++
    }

    stat.strokes.push(stroke)
    lastStroke = curStroke
  }
  stat.strokes.unshift(['T/F', 'Order', 'Count', 'Target', 'User', 'Duration(ms)',
                        'X', 'Y', 'displacement X', 'displacement Y', 'h-direction', 'v-direction', 'abs X', 'abs Y', 'distance', 'velocity(px/ms)',
                        'X to keyCenter ', 'Y to keyCenter', 'h-direction', 'v-direction', 'abs X to keyCenter', 'abs Y to keyCenter', 'distance to keyCenter',
                        'shifted X', 'shifted Y', 'X to shiftedKey', 'Y to shiftedKey', 'h-direction', 'v-direction', 'abs X to shiftedKey', 'abs Y to shiftedKey', 'distance to shiftedKey'])
  stat.accuracy = stat.nCorrect / stat.nStroke
  stat.strokes.push([''],
                     ['', 'WPM', 'accuracy', '', '', 'ReftCount', 'Left to keyCenter', 'Right to keyCenter', 'Top to keyCenter', 'Down to keyCenter', 'Left to shiftedKey', 'Right to shiftedKey', 'Top to shiftedKey', 'Down to shiftedKey'],
                     ['', stat.WPM, stat.accuracy, '', ''].concat(stat.R_keyCount),
                     ['', '', '', '', '',
                     'LeftCount', 'Left to keyCenter', 'Right to keyCenter', 'Top to keyCenter', 'Down to keyCenter',
                     'Left to shiftedKey', 'Right to shiftedKey', 'Top to shiftedKey', 'Down to shiftedKey'],
                     ['', '', '', '', ''].concat(stat.L_keyCount),
                     ['', '', '', '', '',
                     'TeftCount', 'Left to keyCenter', 'Right to keyCenter', 'Top to keyCenter', 'Down to keyCenter',
                     'Left to shiftedKey', 'Right to shiftedKey', 'Top to shiftedKey', 'Down to shiftedKey'],
                     ['', '', '', '', ''].concat(stat.T_keyCount),
                     ['', '', '', '', '',
                     'DeftCount', 'Left to keyCenter', 'Right to keyCenter', 'Top to keyCenter', 'Down to keyCenter',
                     'Left to shiftedKey', 'Right to shiftedKey', 'Top to shiftedKey', 'Down to shiftedKey'],
                     ['', '', '', '', ''].concat(stat.D_keyCount))
  console.log(stat)
  return stat
}

const Do = (query, res) => {
  let path = 'tp6vu6bp4/', trial
  if (typeof query === 'string') {
    trial = JSON.parse(querystring.parse(query).trial)
  }
  else if (typeof query === 'object') {
    trial = JSON.parse(query.trial)
    path = `./dist/${path}`
  }
  const stat = calculateStat(trial, res)
  const csvName = `${path + moment(stat.timestamp).format('YYYY-MM-DD_HH:mm:ss')}.csv`
  console.log(csvName)
  csvStringify(stat.strokes, (e, output) => {
    fs.writeFile(csvName, output, 'utf8', (err) => {
      if (err) throw err
      console.log('Saved!')
    })
  })
}

if (process.env.HTTP_HOST) { // from apache
  console.log('Content-type: text/plain\n')
  if (process.env.REQUEST_METHOD === 'POST') {
    const input = iconvLite.decode(rw.readFileSync('/dev/stdin'), 'utf8')
    if (input.length <= 1024 * 1024 * 8) Do(input, console)
  }
}

module.exports = Do

// vi:et:sw=2:ts=2:sts=2

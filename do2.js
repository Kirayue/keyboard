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
    mode: trial.mode,
    // word per minute, ~5 key strokes per word
    WPM: (strokes.length) / (strokes[strokes.length - 1].timestamp - lastStroke.timestamp) * 1000 * 60 / 5,
    R_keyCount: Array(9).fill(0), // ['direction count','Left count to keyCenter','Right count to keyCenter','Left count to shiftedKey','Right count to shiftedKey']
    L_keyCount: Array(9).fill(0), // ['direction count','Left count to keyCenter','Right count to keyCenter','Left count to shiftedKey','Right count to shiftedKey']
    T_keyCount: Array(9).fill(0), // ['direction count','Top count to keyCenter','Down count to keyCenter','Top count to shiftedKey','Down count to shiftedKey']
    D_keyCount: Array(9).fill(0), // ['direction count','Top count to keyCenter','Down count to keyCenter','Top count to shiftedKey','Down count to shiftedKey']
  }
  const hit = (x, y, keyId) => {
    console.log('-+++++++++++++-')
    console.log(stat.keyCenter[keyId])
    if (x < stat.keyCenter[keyId]['center'].x - 0.75 * trial.keySize.height) return 'not count'
    if (x > stat.keyCenter[keyId]['center'].x + 0.75 * trial.keySize.height) return 'not count'
    if (y < stat.keyCenter[keyId]['center'].y - trial.keySize.height) return 'not count'
    if (y > stat.keyCenter[keyId]['center'].y + trial.keySize.height) return 'not count'
    return 'count'
  }

  // key and stroke centers
  {
    const h = trial.keySize.height / 2, w = trial.keySize.width / 2
    for (const i of trial.keyboard) {
      stat.keyCenter[i] = {
        //x: trial.keyOffset[i].left + w,
        //y: trial.keyOffset[i].top + h,
        center: {
          x: trial.keyOffset[i].left + w,
          y: trial.keyOffset[i].top + h,
        },
        tl: {
          x: trial.keyOffset[i].left + w / 2,
          y: trial.keyOffset[i].top + h / 2,
        },
        tr: {
          x: trial.keyOffset[i].left + 3 * w / 2,
          y: trial.keyOffset[i].top + h / 2,
        },
        bl: {
          x: trial.keyOffset[i].left + w / 2,
          y: trial.keyOffset[i].top + 3 * h / 2,
        },
        br: {
          x: trial.keyOffset[i].left + 3 * w / 2,
          y: trial.keyOffset[i].top + 3 * h / 2,
        }
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
    console.log(ref)
    console.log('--------------')
    stroke[i++] = curStroke.user.x - ref.x // x displacement
    stroke[i++] = curStroke.user.y - ref.y // y displacement
    //stroke[i++] = stroke[i - 3] >= 0 ? 'Right' : 'Left' // horizontal direction
    //stroke[i++] = stroke[i - 3] >= 0 ? 'Top' : 'Down' // vertical direction
    stroke[i++] = Math.abs(stroke[i - 3]) // abs x displacement
    stroke[i++] = Math.abs(stroke[i - 3]) // abs y displacement
    stroke[i++] = Math.sqrt(stroke[i - 3] * stroke[i - 3] + stroke[i - 2] * stroke[i - 2]) // displacement to the last stroke
  }
  for (curStroke of strokes) {
    i = 0
    stroke = []
    console.log(curStroke)
    const keyId = curStroke.target.id
    stroke[i++] = keyId === curStroke.user.id ? 'T' : 'F'
    stroke[i++] = stat.strokes.length
    stroke[i++] = hit(curStroke.user.x, curStroke.user.y, keyId)
    stroke[i++] = keyId // target key
    stroke[i++] = curStroke.user.id // user key
    stroke[i++] = curStroke.timestamp - lastStroke.timestamp // duration
    stroke[i++] = curStroke.target.position// new added
    stroke[i++] = curStroke.user.x // x
    stroke[i++] = curStroke.user.y // y
    displacement(lastStroke.user) // displacement related last stroke
    //stroke[i++] = stroke[i - 2] / stroke[i - 10] // speed (displacement / duration)
    displacement(stat.keyCenter[keyId]['center']) // displacement related key center
    //stroke[i++] = `${stroke[10]} ${stroke[18]}`
    //stroke[i++] = `${stroke[11]} ${stroke[19]}`
    //displacement(stat.keyCenter[keyId][curStroke.target.position]) 
    displacement(stat.keyCenter[keyId]['tl']) 
    displacement(stat.keyCenter[keyId]['tr']) 
    displacement(stat.keyCenter[keyId]['bl']) 
    displacement(stat.keyCenter[keyId]['br']) 
    stroke[i++] = stat.strokeCenter[keyId].x // x of stroke center
    stroke[i++] = stat.strokeCenter[keyId].y // y of stroke center
    displacement(stat.strokeCenter[keyId]) // displacement related stroke center
    //stroke[i++] = `${stroke[10]} ${stroke[29]}`
    //stroke[i++] = `${stroke[11]} ${stroke[30]}`
    /*
    if (stroke[10] === 'Right') {
      stat.R_keyCount[0]++
      stroke[18] === 'Left' ? stat.R_keyCount[1]++ : stat.R_keyCount[2]++
      stroke[29] === 'Left' ? stat.R_keyCount[3]++ : stat.R_keyCount[4]++
      stroke[19] === 'Top' ? stat.R_keyCount[5]++ : stat.R_keyCount[6]++
      stroke[30] === 'Top' ? stat.R_keyCount[7]++ : stat.R_keyCount[8]++
    }
    else {
      stat.L_keyCount[0]++
      stroke[18] === 'Left' ? stat.L_keyCount[1]++ : stat.L_keyCount[2]++
      stroke[29] === 'Left' ? stat.L_keyCount[3]++ : stat.L_keyCount[4]++
      stroke[19] === 'Top' ? stat.L_keyCount[5]++ : stat.L_keyCount[6]++
      stroke[30] === 'Top' ? stat.L_keyCount[7]++ : stat.L_keyCount[8]++
    }
    if (stroke[11] === 'Top') {
      stat.T_keyCount[0]++
      stroke[18] === 'Left' ? stat.T_keyCount[1]++ : stat.T_keyCount[2]++
      stroke[29] === 'Left' ? stat.T_keyCount[3]++ : stat.T_keyCount[4]++
      stroke[19] === 'Top' ? stat.T_keyCount[5]++ : stat.T_keyCount[6]++
      stroke[30] === 'Top' ? stat.T_keyCount[7]++ : stat.T_keyCount[8]++
    }
    else {
      stat.D_keyCount[0]++
      stroke[18] === 'Left' ? stat.D_keyCount[1]++ : stat.D_keyCount[2]++
      stroke[29] === 'Left' ? stat.D_keyCount[3]++ : stat.D_keyCount[4]++
      stroke[19] === 'Top' ? stat.D_keyCount[5]++ : stat.D_keyCount[6]++
      stroke[30] === 'Top' ? stat.D_keyCount[7]++ : stat.D_keyCount[8]++
    }
    */
    console.log(i + 'KKKKKKKKKKKKK')
    stat.strokes.push(stroke)
    lastStroke = curStroke
  }
  //const rowCountName = ['Left to kc', 'Right to kc', 'Left to skc', 'Right to skc', 'Top to kc', 'Down to kc', 'Top to skc', 'Down to skc']
  stat.strokes.unshift(['T/F', 'Order', 'Count', 'Target', 'User', 'Duration(ms)', 'Letter Position',
                        'X', 'Y',
                        'displacement X', 'displacement Y', /*'h-dir-move', 'v-dir-move',*/ 'abs X', 'abs Y', 'distance', //'velocity(px/ms)',
                        'X to kc', 'Y to kc', /*'h-dir-move', 'v-dir-move',*/ 'abs X to kc', 'abs Y to kc', 'distance to kc',/* 'h-dir-move with kc', 'v-dir-move with kc',*/
                        'X to TL', 'Y to TL', 'abs X to TL', 'abs Y to TL', 'distance to TL',
                        'X to TR', 'Y to TR', 'abs X to TR', 'abs Y to TR', 'distance to TR',
                        'X to BL', 'Y to BL', 'abs X to BL', 'abs Y to BL', 'distance to BL',
                        'X to BR', 'Y to BR', 'abs X to BR', 'abs Y to BR', 'distance to BR',
                        'shifted X', 'shifted Y', 'X to skc', 'Y to skc', /*'h-dir-move', 'v-dir-move',*/ 'abs X to skc', 'abs Y to skc', 'distance to skc',/* 'h-dir-move with skc', 'v-dir-move with skc',*/
                        'WPM', 'accuracy', 'TL', 'TR', 'BL', 'BR', 'C'/*, 'right-move', ...rowCountName*/])
  stat.accuracy = stat.nCorrect / stat.nStroke
  /*
  const rowPercent = ['Left to kc %', 'Right to kc %', 'Left to skc %', 'Right to skc %', 'Top to kc %', 'Down to kc %', 'Top to skc %', 'Down to kc %']
  const rightRowPercent = stat.R_keyCount.map((value, index, arr) => (arr[0] === 0 ? 0 : value / arr[0] * 100)).slice(1, stat.R_keyCount.length)
  const leftRowPercent = stat.L_keyCount.map((value, index, arr) => (arr[0] === 0 ? 0 : value / arr[0] * 100)).slice(1, stat.L_keyCount.length)
  const topRowPercent = stat.T_keyCount.map((value, index, arr) => (arr[0] === 0 ? 0 : value / arr[0] * 100)).slice(1, stat.T_keyCount.length)
  const downRowPercent = stat.D_keyCount.map((value, index, arr) => (arr[0] === 0 ? 0 : value / arr[0] * 100)).slice(1, stat.D_keyCount.length)
  */
  stat.strokes[1] = [...stat.strokes[1], stat.WPM, stat.accuracy, `(${stat.keyCenter['a']['tl'].x}, ${stat.keyCenter['a']['tl'].y})`, `(${stat.keyCenter['a']['tr'].x}, ${stat.keyCenter['a']['tr'].y})`, `(${stat.keyCenter['a']['bl'].x}, ${stat.keyCenter['a']['bl'].y})`, `(${stat.keyCenter['a']['br'].x}, ${stat.keyCenter['a']['br'].y})`, `(${stat.keyCenter['a']['center'].x}, ${stat.keyCenter['a']['center'].y})`/*...stat.R_keyCount*/]
  for (let i = 1; i <= 25; i++) {
    console.log(trial.keyboard[i])
    stat.strokes[i+1] ? stat.strokes[i+1] = [...stat.strokes[i+1], '', '', `(${stat.keyCenter[trial.keyboard[i]]['tl'].x}, ${stat.keyCenter[trial.keyboard[i]]['tl'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['tr'].x}, ${stat.keyCenter[trial.keyboard[i]]['tr'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['bl'].x}, ${stat.keyCenter[trial.keyboard[i]]['bl'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['br'].x}, ${stat.keyCenter[trial.keyboard[i]]['br'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['center'].x}, ${stat.keyCenter[trial.keyboard[i]]['center'].y})`]
                                         : stat.strokes[i+1] = [...Array(48).fill(''), `(${stat.keyCenter[trial.keyboard[i]]['tl'].x}, ${stat.keyCenter[trial.keyboard[i]]['tl'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['tr'].x}, ${stat.keyCenter[trial.keyboard[i]]['tr'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['bl'].x}, ${stat.keyCenter[trial.keyboard[i]]['bl'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['br'].x}, ${stat.keyCenter[trial.keyboard[i]]['br'].y})`, `(${stat.keyCenter[trial.keyboard[i]]['center'].x}, ${stat.keyCenter[trial.keyboard[i]]['center'].y})`]
  }
  /*
  stat.strokes[2] ? stat.strokes[2] = [...stat.strokes[2], '', '', '', ...rowPercent] : stat.strokes[2] = [...Array(32).fill(''), '', '', '', ...rowPercent]
  stat.strokes[3] ? stat.strokes[3] = [...stat.strokes[3], '', '', '', ...rightRowPercent] : stat.strokes[3] = [...Array(32).fill(''), '', '', '', ...rightRowPercent]
  stat.strokes[4] ? stat.strokes[4] = [...stat.strokes[4], '', '', 'left-move', ...rowCountName] : stat.strokes[4] = [...Array(32).fill(''), '', '', ...rowCountName]
  stat.strokes[5] ? stat.strokes[5] = [...stat.strokes[5], '', '', ...stat.L_keyCount] : stat.strokes[5] = [...Array(32).fill(''), '', '', ...stat.L_keyCount]
  stat.strokes[6] ? stat.strokes[6] = [...stat.strokes[6], '', '', '', ...rowPercent] : stat.strokes[6] = [...Array(32).fill(''), '', '', '', ...rowPercent]
  stat.strokes[7] ? stat.strokes[7] = [...stat.strokes[7], '', '', '', ...leftRowPercent] : stat.strokes[7] = [...Array(32).fill(''), '', '', '', ...leftRowPercent]
  stat.strokes[8] ? stat.strokes[8] = [...stat.strokes[8], '', '', 'top-move', ...rowCountName] : stat.strokes[8] = [...Array(32).fill(''), '', '', ...rowCountName]
  stat.strokes[9] ? stat.strokes[9] = [...stat.strokes[9], '', '', ...stat.T_keyCount] : stat.strokes[9] = [...Array(32).fill(''), '', '', ...stat.T_keyCount]
  stat.strokes[10] ? stat.strokes[10] = [...stat.strokes[10], '', '', '', ...rowPercent] : stat.strokes[10] = [...Array(32).fill(''), '', '', '', ...rowPercent]
  stat.strokes[11] ? stat.strokes[11] = [...stat.strokes[11], '', '', '', ...topRowPercent] : stat.strokes[11] = [...Array(32).fill(''), '', '', '', ...topRowPercent]
  stat.strokes[12] ? stat.strokes[12] = [...stat.strokes[12], '', '', 'down-move', ...rowCountName] : stat.strokes[12] = [...Array(32).fill(''), '', '', ...rowCountName]
  stat.strokes[13] ? stat.strokes[13] = [...stat.strokes[13], '', '', ...stat.D_keyCount] : stat.strokes[13] = [...Array(32).fill(''), '', '', ...stat.D_keyCount]
  stat.strokes[14] ? stat.strokes[14] = [...stat.strokes[14], '', '', '', ...rowPercent] : stat.strokes[14] = [...Array(32).fill(''), '', '', '', ...rowPercent]
  stat.strokes[15] ? stat.strokes[15] = [...stat.strokes[15], '', '', '', ...downRowPercent] : stat.strokes[15] = [...Array(32).fill(''), '', '', '', ...downRowPercent]
  */
  /*
  const row18 = ['Xmove', 'XmovePoint', 'times(kc)', '100%(kc)', 'times(skc)', '100%(skc)', 'Ymove', 'YmovePoint', 'times(kc)', '100%(kc)', 'times(skc)', '100%(skc)']
  stat.strokes[18] ? stat.strokes[18] = [...stat.strokes[18], '', '', ...row18] : stat.strokes[18] = [...Array(38).fill(''), ...row18]

  const row19 = ['right-move', 'RR', stat.R_keyCount[2], rightRowPercent[1], stat.R_keyCount[4], rightRowPercent[3], 'top-move', 'TT', stat.T_keyCount[5], topRowPercent[4], stat.T_keyCount[6], topRowPercent[6]]
  stat.strokes[19] ? stat.strokes[19] = [...stat.strokes[19], '', '', ...row19] : stat.strokes[19] = [...Array(38).fill(''), ...row19]

  const row20 = [stat.R_keyCount[0], 'RL', stat.R_keyCount[1], rightRowPercent[0], stat.R_keyCount[3], rightRowPercent[2], stat.T_keyCount[0], 'TD', stat.T_keyCount[6], topRowPercent[5], stat.T_keyCount[7], topRowPercent[7]]
  stat.strokes[20] ? stat.strokes[20] = [...stat.strokes[20], '', '', ...row20] : stat.strokes[20] = [...Array(38).fill(''), ...row20]

  const row21 = ['left-move', 'LR', stat.L_keyCount[2], leftRowPercent[1], stat.L_keyCount[4], leftRowPercent[3], 'down-move', 'DT', stat.D_keyCount[5], downRowPercent[4], stat.D_keyCount[6], downRowPercent[6]]
  stat.strokes[21] ? stat.strokes[21] = [...stat.strokes[21], '', '', ...row21] : stat.strokes[21] = [...Array(38).fill(''), ...row21]

  const row22 = [stat.L_keyCount[0], 'LL', stat.L_keyCount[1], leftRowPercent[0], stat.L_keyCount[3], leftRowPercent[2], stat.D_keyCount[0], 'DD', stat.D_keyCount[6], downRowPercent[5], stat.D_keyCount[7], downRowPercent[7]]
  stat.strokes[22] ? stat.strokes[22] = [...stat.strokes[22], '', '', ...row22] : stat.strokes[22] = [...Array(38).fill(''), ...row22]

  const row23 = ['right-move', 'RT', stat.R_keyCount[5], rightRowPercent[4], stat.R_keyCount[7], rightRowPercent[6], 'top-move', 'TR', stat.T_keyCount[2], topRowPercent[1], stat.T_keyCount[2], topRowPercent[3]]
  stat.strokes[23] ? stat.strokes[23] = [...stat.strokes[23], '', '', ...row23] : stat.strokes[23] = [...Array(38).fill(''), ...row23]

  const row24 = [stat.R_keyCount[0], 'RD', stat.R_keyCount[6], rightRowPercent[5], stat.R_keyCount[8], rightRowPercent[7], stat.T_keyCount[0], 'TL', stat.T_keyCount[1], topRowPercent[0], stat.T_keyCount[1], topRowPercent[2]]
  stat.strokes[24] ? stat.strokes[24] = [...stat.strokes[24], '', '', ...row24] : stat.strokes[24] = [...Array(38).fill(''), ...row24]

  const row25 = ['left-move', 'LT', stat.L_keyCount[5], leftRowPercent[4], stat.L_keyCount[7], leftRowPercent[6], 'down-move', 'DR', stat.D_keyCount[2], downRowPercent[1], stat.D_keyCount[2], downRowPercent[3]]
  stat.strokes[25] ? stat.strokes[25] = [...stat.strokes[25], '', '', ...row25] : stat.strokes[25] = [...Array(38).fill(''), ...row25]

  const row26 = [stat.L_keyCount[0], 'LD', stat.L_keyCount[6], leftRowPercent[5], stat.L_keyCount[8], leftRowPercent[7], stat.D_keyCount[0], 'DL', stat.D_keyCount[1], downRowPercent[0], stat.D_keyCount[1], downRowPercent[2]]
  stat.strokes[26] ? stat.strokes[26] = [...stat.strokes[26], '', '', ...row26] : stat.strokes[26] = [...Array(38).fill(''), ...row26]
  */
  return stat
}

const Do = (query, res) => {
  let path = 'tp6vu6bp4_mode2/', trial
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

// wi:et:sw=2:ts=2:sts=2

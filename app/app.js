import './app.sass'

let app = {
  history: [],
  keyOffset: {},
  keyPool: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  opt: { nKeyPerRound: 3 },
  targetKeys: [],
}

function calculateStat(app) { //! move to server
  let history = app.history
  let last = history.shift()
  let stat = {
    clicks: [],
    nCorrect: 0,
    nKey: history.length,
  }
  for (let cur of history) {
    if (cur.user.id === cur.target.id) stat.nCorrect++
    let click = [], i = 0 
    let keyCenter = {x: app.keyOffset[cur.target.id].top + app.keySize.height/2, y:app.keyOffset[cur.target.id].left + app.keySize.width/2 }
    click[i++] = cur.target.id //target.id
    click[i++] = cur.user.id //user.id
    click[i++] = cur.timestamp - last.timestamp // duration
    click[i++] = cur.user.x - last.user.x // x displacement
    click[i++] = cur.user.y - last.user.y // y displacement
    click[i++] = Math.abs(click[i - 3]) // abs x displacement
    click[i++] = Math.abs(click[i - 3]) // abs y displacement
    click[i++] = Math.pow((Math.pow(click[i-3],2)+Math.pow(click[i-3],2)),1/2)
    click[i++] = cur.user.x - keyCenter.x //x displacement relates to keyCenter 
    click[i++] = cur.user.y - keyCenter.y //y displacement relates to keyCenter
    click[i++] = Math.abs(click[i - 3])  //abs x displacement relates to keyCenter
    click[i++] = Math.abs(click[i - 3])  //abs y displacement relates to keyCenter


    stat.clicks.push(click)
    last = cur
  }
  stat.accuracy = stat.nCorrect / stat.nKey
  //! list required statistics here
  console.log(stat)
  return stat
}

$(document).ready(function(){
  function nextRound(color) {
    for (let i=0; i<app.opt.nKeyPerRound; i++) {
      let iKey = Math.floor((Math.random() * app.keyPool.length))
      let key = {
        color: color,
        id: app.keyPool.splice(iKey, 1)[0],
        text: i + 1,
      }
      app.targetKeys.push(key)
      $("#"+key.id).addClass(key.color).text(key.text);
    } 
  }

  $('#stop').click(() => {
    //! send app to server via ajax instead of calling calculateStat()
    $.get('do',{app:JSON.stringify(app)},()=>{
       console.log('Saved!')
    })
    calculateStat(app)
  })

  $('.key').tap(event => {
    let key = app.targetKeys.shift()
    $('#'+key.id).removeClass(key.color).text('') // restore key
    app.keyPool.push(key.id) // push key back to pool
    app.history.push({
      target: key,
      timestamp: new Date(),
      user: {
        id: event.target.getAttribute('id'),
        x: event.pageX,
        y: event.pageY,
      },
    })
    if (app.targetKeys.length < 2)
      nextRound(key.color === 'red' ? 'blue' : 'red')
  })

  for (let i of app.keyPool)
    app.keyOffset[i] = $('#'+i).offset()
  let $key = $('#'+app.keyPool[0])
  app.keySize = { height: $key.height(), width: $key.width() }

  nextRound('red') // first round
});

// vi:et:sw=2:ts=2

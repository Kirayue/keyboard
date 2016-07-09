import './app.sass'

let app = {
  history: [],
  keyPool: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  opt: { nKeyPerRound: 3 },
  targetKeys: [],
}

function calculateStat(app) { //! move to server
  let history = app.history
  let first = history.shift()
  let stat = {
    nCorrect: 0,
    nKey: history.length,
  }
  for (let i of history) {
    if (i.user.id === i.target.id) stat.nCorrect++
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

  nextRound('red') // first round
});

// vi:et:sw=2:ts=2

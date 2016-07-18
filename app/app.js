import './app.sass'

let app = { //! move history and opt into trial
  keyboard: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  keyOffset: {}, //! for what?
  opt: { nKeyPerRound: 3 },
  targetKeys: [],
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
  
  function restart() {
    app.history = []
    app.keyPool = app.keyboard.splice(0)
    for (let key of app.targetKeys)
      $('#'+key.id).removeClass(key.color).text('')
    app.targetKeys = []
  }

  $('#stop').click(() => {
    let trial = {
      history: app.history,
      keyList: app.keyList,
      keySize: app.keySize,
      keyOffset: app.keyOffset,
      opt: app.opt,
      timestamp: new Date().getTime()
    }
    //calculateStat(trial)
    restart()
    nextRound('red') 
    $.get('do', { trial: JSON.stringify(trial) }, () => {
       console.log('Saved!')
    })
  })

  $('.key').tap(event => {
    let key = app.targetKeys.shift()
    $('#'+key.id).removeClass(key.color).text('') // restore key
    app.keyPool.push(key.id) // push key back to pool
    app.history.push({
      target: key,
      timestamp: new Date().getTime(),
      user: {
        id: event.target.getAttribute('id'),
        x: event.pageX,
        y: event.pageY,
      },
    })
    if (app.targetKeys.length < 2)
      nextRound(key.color === 'red' ? 'blue' : 'red')
  })

  restart()
  
  setTimeout(() => { // prevent initial position problem
    for (let i of app.keyPool) 
      app.keyOffset[i] = $('#'+i).offset()
    let $key = $('#'+app.keyPool[0])
    app.keySize = { height: $key.height(), width: $key.width() }
    nextRound('red') // first round
  },1000)

});


// vi:et:sw=2:ts=2

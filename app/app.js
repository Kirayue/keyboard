import './app.sass'
let app = { //! move history and opt into trial
  keyboard: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  keyOffset: {}, //! for what?
  opt: { nKeyPerRound: 5 },
  targetKeys: [],
}


$(document).ready(function(){

  function nextRound(color) {
    for (let i=0; i<app.opt.nKeyPerRound; i++) {
      let iKey = Math.floor((Math.random() * app.keyPool.length))
      let key = {
        color: color,
        id: app.keyPool.splice(iKey, 1)[0],
        text: color == 'red' ? i + 1: String.fromCharCode(i+65)
      }
      app.targetKeys.push(key)
      $("#"+key.id).addClass(key.color).text(key.text)
    } 
  }
  function sendTrial() {
    let trial = {
      history: app.history,
      keyboard: app.keyboard,
      keySize: app.keySize,
      keyOffset: app.keyOffset,
      timestamp: new Date().getTime(),
      opt: app.opt,
    }
    restart()
    $('#stop').text('Send')
    if ( trial.history.length < 2) {return}
    $.post('do', { trial: JSON.stringify(trial) }, () => {
      $('#stop').text('Stop')
    })
  }
  $('#timer').countdown( new Date().getTime() + 60000, (event) =>{
    $('#timer').text(event.strftime(' %M min %S sec '))
  }).on('finish.countdown',() =>{
    sendTrial()
  }).countdown('stop')
  function restart() {
    app.history = []
    app.keyPool = Array.from(app.keyboard)
    for (let key of app.targetKeys)
      $('#'+key.id).removeClass(key.color).text('')
    app.targetKeys = []
    nextRound('red') 
    $('#keyboard').one('click',() => {
      $('#timer').countdown(new Date().getTime() + 60000)
    })
  }
  $('#stop').click(() => {
    sendTrial()
    $('#timer').countdown(new Date().getTime() + 60000).countdown('stop')
  })
  $('#restart').click(() => {
    restart()
    $('#timer').countdown(new Date().getTime() + 60000).countdown('stop')
  })

  $('.key').tap(event => {
    let key = app.targetKeys.shift()
    $('#'+key.id).removeClass(key.color).text('') // restore key
    if( key.id != event.target.getAttribute('id') ){
      $('#keyboard').css({background:"red"})
      setTimeout(() => {
        $('#keyboard').css({background:'url("res/keyboard.png")'})
      },100)
    }
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
  
  
  setTimeout(() => { // prevent initial position problem
    restart() // first round
    for (let i of app.keyboard) 
      app.keyOffset[i] = $('#'+i).offset()
    let $key = $('#'+app.keyboard[0])
    app.keySize = { height: $key.height(), width: $key.width() }
  },1000)

})


// vi:et:sw=2:ts=2

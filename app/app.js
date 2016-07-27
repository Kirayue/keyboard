import './app.sass'

const $ = window.jQuery = require('jquery/dist/jquery.js')
$.event.props = []
require('imports?this=>window!jquery-mobile/dist/jquery.mobile.js')

const app = { //! move history and opt into trial
  keyboard: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  keyOffset: {},
  opt: { nKeyPerRound: 5 },
  targetKeys: [],
}

$(document).ready(() => {
  function nextRound(color) {
    for (let i = 0; i < app.opt.nKeyPerRound; i++) {
      const iKey = Math.floor((Math.random() * app.keyPool.length))
      const key = {
        color,
        id: app.keyPool.splice(iKey, 1)[0],
        text: color === 'red' ? i + 1 : String.fromCharCode(i + 65),
      }
      app.targetKeys.push(key)
      $(`#${key.id}`).addClass(key.color).text(key.text)
    }
  }
  function restart() {
    app.history = []
    app.keyPool = Array.from(app.keyboard)
    for (const key of app.targetKeys) {
      $(`#${key.id}`).removeClass(key.color).text('')
    }
    app.targetKeys = []
    nextRound('red')
    $('#keyboard').one('click', () => {
      $('#timer').countdown(new Date().getTime() + 60000)
    })
  }
  //! lint, an empty line is forced
  function sendTrial() {
    const trial = {
      history: app.history,
      keyboard: app.keyboard,
      keySize: app.keySize,
      keyOffset: app.keyOffset,
      timestamp: new Date().getTime(),
      opt: app.opt,
    }
    restart()
    $('#stop').text('Send')
    if (trial.history.length < 2) return
    $.post('do', { trial: JSON.stringify(trial) }, () => {
      $('#stop').text('Stop')
    })
  }
  $('#timer')
  .countdown(new Date().getTime() + 60000, (event) => {
    $('#timer').text(event.strftime(' %M min %S sec '))
  })
  .on('finish.countdown', () => {
    sendTrial()
  })
  .countdown('stop')
  $('#stop').click(() => {
    sendTrial()
    $('#timer').countdown(new Date().getTime() + 60000).countdown('stop')
  })
  $('#restart').click(() => {
    restart()
    $('#timer').countdown(new Date().getTime() + 60000).countdown('stop')
  })

  $('.key').tap(event => {
    const key = app.targetKeys.shift()
    $(`#${key.id}`).removeClass(key.color).text('') // restore key
    if (key.id !== event.target.getAttribute('id')) {
      $('#keyboard').css({ background: 'red' })
      setTimeout(() => {
        $('#keyboard').css({ background: "url('res/keyboard.png')" })
      }, 100)
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
    if (app.targetKeys.length < 2) {
      nextRound(key.color === 'red' ? 'blue' : 'red')
    }
  })


  setTimeout(() => { // prevent initial position problem
    restart() // first round
    for (const i of app.keyboard) {
      app.keyOffset[i] = $(`#${i}`).offset()
    }
    const $key = $(`#${app.keyboard[0]}`)
    app.keySize = { height: $key.height(), width: $key.width() }
  }, 1000) //! lint, a space before 1000 is forced
})

// vi:et:sw=2:ts=2

import './app.sass'

const $ = window.jQuery = require('jquery/dist/jquery.js')
$.event.props = []
/* eslint-disable import/no-unresolved */
require('imports?this=>window!jquery-mobile/dist/jquery.mobile.js')
require('jquery-countdown/dist/jquery.countdown.min.js')
/* eslint-enable import/no-unresolved */

const app = { //! move history and opt into trial
  keyboard: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  keyOffset: {},
  opt: { nKeyPerRound: 3 },
  targetKeys: [],
  state: true,
  duration: 60000,
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
    if(app.state === true){
      $('#keyboard').one('click', () => {
        $('#timer').countdown(new Date().getTime() + app.duration)
      })
    }
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
    .countdown(new Date().getTime() + app.duration, (event) => {
      $('#timer').text(event.strftime(' %M min %S sec '))
    })
    .on('finish.countdown', () => {
      app.state = false
      sendTrial()
    })
    .countdown('stop')

  $('#stop').click(() => {
    sendTrial()
    $('#timer').countdown(new Date().getTime() + app.duration).countdown('stop')
  })

  $('#restart').click(() => {
    app.state = true
    restart()
    $('#timer').countdown(new Date().getTime() + app.duration).countdown('stop')
  })
  const tap_handler = event => {
    if (app.state){
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
          id: event.target.getAttribute('id') === 'keyboard' ? '' : event.target.getAttribute('id'),
          x: event.pageX,
          y: event.pageY,
        },
      })
      if (app.targetKeys.length < 2) {
        nextRound(key.color === 'red' ? 'blue' : 'red')
      }
    }
  }
  $('.key').tap(event => {
    event.stopPropagation()
    tap_handler(event)
  })
  $('#keyboard').tap(tap_handler)
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

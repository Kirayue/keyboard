import './app2.sass'

const $ = window.jQuery = require('jquery/dist/jquery.js')
$.event.props = []
/* eslint-disable import/no-unresolved */
require('imports?this=>window!jquery-mobile/dist/jquery.mobile.js')
require('jquery-countdown/dist/jquery.countdown.min.js')
/* fslint-enable import/no-unresolved */

const app = { //! move history and opt into trial
  keyboard: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  position: ['tl', 'tr', 'center', 'bl', 'br'],
  keyOffset: {},
  opt: { nKeyPerRound: 3 },
  targetKeys: [],
  state: true,
  duration: 60000,
  mode: 'random'
}

$(document).ready(() => {
  let lastTime = new Date().getTime()
  $('#random').addClass('ui-btn-active')
  function nextRound(color) {
    for (let i = 0; i < app.opt.nKeyPerRound; i++) {
      const iKey = Math.floor((Math.random() * app.keyPool.length))
      const iPosition = Math.floor((Math.random() * app.position.length))
      const key = {
        color,
        id: app.keyPool.splice(iKey, 1)[0],
        position: app.position[iPosition],
        text: color === 'red' ? i + 1 : String.fromCharCode(i + 65),
      }
      app.targetKeys.push(key)
      $(`#${key.id} > .text`).addClass(key.color + ' ' + key.position).text(key.text)
    }
  }

  function restart() {
    app.history = []
    app.keyPool = Array.from(app.keyboard)
    for (const key of app.targetKeys) {
      $(`#${key.id} > .text`).removeClass(key.color + ' ' + key.position).text('')
    }
    app.targetKeys = []
    nextRound('red')
    if (app.state === true) {
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
      mode: app.mode
    }
    restart()
    $('#stop').text('Send')
    if (trial.history.length < 2) return
    $.post('do2.njs', { trial: JSON.stringify(trial) }, () => {
      console.log('OK')
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
  const changePositionlist = (state) => {
    console.log(state)
    const state_obj = {
       'random': ['tl', 'tr', 'center', 'bl', 'br'],
       'center': ['center'],
       'tl': ['tl'],
       'tr': ['tr'],
       'bl': ['bl'],
       'br': ['br'],
    }
    console.log(state_obj[state])
    app.position = state_obj[state]
    app.model = state
  }
  $('li button').click(function(){
    $('li button').removeClass('ui-btn-active')
    $(this).addClass('ui-btn-active')
    changePositionlist($(this).attr('id'))
    restart()
    $('#timer').countdown(new Date().getTime() + app.duration).countdown('stop')
  })

  const tapHandler = event => {
    const timestamp = new Date().getTime()
    if (app.state && timestamp - lastTime > 60) {
      const key = app.targetKeys.shift()
      $(`#${key.id} > .text`).removeClass(key.color + ' ' + key.position).text('') // restore key
      if (key.id !== event.target.getAttribute('id') && key.id !== event.target.parentNode.id) {
        $('#keyboard').css({ background: 'red' })
        setTimeout(() => {
          $('#keyboard').css({ background: "url('res/keyboard.png')" })
        }, 100)
      }
      app.keyPool.push(key.id) // push key back to pool
      //console.log(event.target)
      let id
      if (app.keyboard.indexOf(event.target.getAttribute('id')) !== -1) {
        id = event.target.getAttribute('id')
      }
      else if (app.keyboard.indexOf(event.target.parentNode.id) !== -1) {
        id = event.target.parentNode.id
      }
      else {
        id = ''
      }
      //console.log(id)
      let user = {
        id: id,
        x: event.pageX,
        y: event.pageY,
      }
      app.history.push({
        target: key,
        timestamp,
        user: user
      })
      if (app.targetKeys.length < 2) {
        nextRound(key.color === 'red' ? 'blue' : 'red')
      }
    }
    lastTime = timestamp
  }
  $('.key').tap(event => {
    event.stopPropagation()
    tapHandler(event)
  })
  $('#keyboard').tap(tapHandler)

  setTimeout(() => { // prevent initial position problem
    restart() // first round
    app.keyOffset['keyboard'] = $('#keyboard').offset()
    for (const i of app.keyboard) {
      app.keyOffset[i] = $(`#${i}`).offset()
    }
    const $key = $(`#${app.keyboard[0]}`)
    app.keySize = { height: $key.height(), width: $key.width() }
  }, 1000)
})

// vi:et:sw=2:ts=2

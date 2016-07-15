import './app.sass'
import moment from 'moment/moment.js'

let app = { //! move history and opt into trial
  history: [],
  keyAttr: {}, //! for what?
  keyPool: 'abcdefghijklmnopqrstuvwxyz'.split(''),
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

  $('#stop').click(() => {
    app.endTime = moment().format('YYYY-MM-DD_HH:mm:ss') //! save raw format
    $.get('do', { trial: JSON.stringify(app) }, () => {
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

  for (let i of app.keyPool){
    app.keyAttr[i]= { keyOffset : $('#'+i).offset(),
                      shiftedKey : { x:0,
                                     y:0
                                   },
                            nTap :  0
                    }
   }
  let $key = $('#'+app.keyPool[0])
  app.keySize = { height: $key.height(), width: $key.width() }

  nextRound('red') // first round
});


// vi:et:sw=2:ts=2

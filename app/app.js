import './app.sass'

let app = {
  history: [],
  keyPool: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  targetKeys: [],
}
let opt = {
  nKeyPerRound: 3,
}

$(document).ready(function(){
  function nextRound(color) {
    for (let i=0; i<opt.nKeyPerRound; i++) {
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

  $('.key').tap(event => {
    let key = app.targetKeys.shift()
    $('#'+key.id).removeClass(key.color).text('') // restore key
    app.keyPool.push(key.id) // push key back to pool
    app.history.push({
      target: key,
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

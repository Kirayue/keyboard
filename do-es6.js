import querystring from 'querystring'
import fs from 'fs'
//console.log(process); 
let calculateStat = (app) => { //! move to server
  let history = app.history
  let last = history.shift()
  let stat = {
    clicks: [],
    nCorrect: 0,
    nKey: history.length,
    WPM: (history.length - 1)/(history[history.length-1].timestamp-history[0].timestamp)*1000*60/5     //word per minute
  }
  for (let cur of history) {       //loop for add user.x and user.y
    let {id,x,y}  = cur.user
    console.log(' id: '+id+' x: '+x+' y: '+y)
    if (cur.user.id === cur.target.id){
      stat.nCorrect++
      app.keyAttr[id].shiftedKey.x += x
      app.keyAttr[id].shiftedKey.y += y
      app.keyAttr[id].nTap++
    }
  }
  for (let key of app.keyPool){    //loop for shifted x and y
     app.keyAttr[key].shiftedKey.x  /= app.keyAttr[key].nTap
     app.keyAttr[key].shiftedKey.y  /= app.keyAttr[key].nTap
  }
  for (let cur of history) {   //loop for statistics
    let click = [], i = 0 
    let keyCenter = {x: app.keyAttr[cur.target.id].keyOffset.top + app.keySize.height/2, y:app.keyAttr[cur.target.id].keyOffset.left + app.keySize.width/2 }

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
    click[i++] = app.keyAttr[cur.user.id].shiftedKey.x // shiftedKey x
    click[i++] = app.keyAttr[cur.user.id].shiftedKey.y // shiftedKey y
    click[i++] = cur.user.x - app.keyAttr[cur.user.id].shiftedKey.x  //x displacement relates to shiftedKey
    click[i++] = cur.user.y - app.keyAttr[cur.user.id].shiftedKey.y  //y displacement relates to shiftedKey
    click[i++] = Math.abs(click[i - 3]) //abs x displacement relates to shiftedKey
    click[i++] = Math.abs(click[i - 3]) //abs y displacement relates to shiftedKey

    stat.clicks.push(click)
    last = cur
  }

  stat.accuracy = stat.nCorrect / stat.nKey
  //! list required statistics here
  console.log(stat)
  return stat
}

let Do = (query,res)=> {
  let app
  if(typeof query == 'string'){
    app = JSON.parse(querystring.parse(query).app)
  }
  else if(typeof query == 'object'){
    app = JSON.parse(query.app)
  }
   fs.writeFile('test.json',JSON.stringify(calculateStat(app,res),null,'\t'),'utf8', (err) => {
    if (err) throw err
    console.log('It\'s saved!')
  })
}

if ('node'  === process.title){
    console.log('fuck');  //from node
}
else{
   if('gulp' === process.title){
   } 
   else if(process.env.HTTP_HOST != null){
     console.log('Content-type: text/plain\n');
	   Do(process.env.QUERY_STRING, console);
   }
}

export {Do}

// vi:et:sw=2:ts=2

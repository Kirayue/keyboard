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
  }
  for (let cur of history) {
    if (cur.user.id === cur.target.id) stat.nCorrect++
    let click = [], i = 0
    click[i++] = cur.target.id //target.id
    click[i++] = cur.user.id //user.id
    click[i++] = cur.timestamp - last.timestamp // duration
    click[i++] = cur.user.x - last.user.x // x displacement
    click[i++] = cur.user.y - last.user.y // y displacement
    click[i++] = Math.abs(click[i - 3]) // abs x displacement
    click[i++] = Math.abs(click[i - 3]) // abs y displacement
    click[i++] = Math.pow((Math.pow(click[i-3],2)+Math.pow(click[i-3],2)),1/2)  
    stat.clicks.push(click)
    last = cur
  }
  stat.accuracy = stat.nCorrect / stat.nKey
  //! list required statistics here
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

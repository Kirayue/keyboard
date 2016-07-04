import './app.sass'
let opt = {   //控制產生案件數量
   keyPerRound:4,
   keyList:['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'] 
};
let buttons = {   //bottons object
  now: 0,     // index of button that will be killed
  entity: [] //buttons array
};
let results =[];     //結果
function generate(color){   //產生按鍵的ASCII CODE
  for(let i=0;i<opt.keyPerRound;i++){
    let randomNum = Math.floor((Math.random() * opt.keyList.length));
    let temp = {};
    temp.key = opt.keyList[randomNum];
    temp.text = buttons.entity.length%opt.keyPerRound +1;
    temp.color = color;
    buttons.entity.push(temp);
    opt.keyList.splice(randomNum,1);
  } 
}
$(document).ready(function(){
  let showKey = ()=>{   //將被選到的buttons 加上style
      for(let i=buttons.entity.length-opt.keyPerRound;i<buttons.entity.length;i++)
        $("#"+buttons.entity[i].key).removeClass( "original" ).addClass(buttons.entity[i].color).text(buttons.entity[i].text);
  }
  let tap_handler = (event)=>{  //tap callback
    $('#'+buttons.entity[buttons.now].key).removeClass( buttons.entity[buttons.now].color ).addClass( "original" ).text(""); //移除再buttons.entity[now]的style
    opt.keyList.push(buttons.entity[buttons.now].key);
    if(buttons.now == buttons.entity.length-2){
      if(buttons.entity[buttons.now].color=='red'){
          generate('blue'); 
          showKey();
      }
      else{
          generate('red'); 
          showKey();
      }
    }
    buttons.now++;
    let temp={};
    temp.key = $(event.target).attr('id'); //將tap的key值 跟 X Y 座標 存到temp object 並 push 到 results
    temp.X = event.pageX;
    temp.Y = event.pageY;
    results.push(temp);
  }
  $('.original').on("tap",tap_handler);  //將所有按鍵綁上 tap event
  generate('red');  //產生紅色按鈕
  showKey();  
});

// vi:et:sw=2:ts=2

require("./index.sass");
let buttons = {   //bottons object
  num_r: 0,   //number of red buttons
  num_b: 0,   //number of blue buttons
  now: 0,     // index of button that will be killed
  entity: [], //buttons array
  checkNum(num){  //check number whether has already show on button
    for(let i = 0;i< this.entity.length; i++){
      if( num == this.entity[i].num)
        return true;
    }
  },
  initiate(num){  //初始化 array with num大小 
    for(let i = 0;i<num/2;i++){
      this.entity.push({num:0,key:'',color:'red'}); //一半紅色
    }
    for(let i = num/2;i<num;i++){
      this.entity.push({num:0,key:'',color:'blue'}); //一半藍色
    }
  }

};
buttons.initiate(6); //initial 6個 紅三 藍三
let questions =[];   //題目
let results =[];     //結果
function generate(color,times){   //產生按鍵的ASCII CODE
  let randomNum;
  if(color==1){ //red
    for(let i=0;i<times;i++){
      do{
        randomNum = Math.floor((Math.random() * 26) + 1);
      }while(buttons.checkNum(randomNum))   //確認是否重複
      buttons.entity[i].num = randomNum;    //將button num&key 丟到buttons.entity裡
      buttons.entity[i].key = String.fromCharCode(buttons.entity[i].num+96);
      questions.push(buttons.entity[i].key);  //將產生的button push進 questions
    } 
    buttons.num_r = buttons.num_r + times; 
  }
  else{
    for(let i=0;i<times;i++){
      do{
        randomNum = Math.floor((Math.random() * 26) + 1);
      }while(buttons.checkNum(randomNum))
        buttons.entity[buttons.entity.length/2+i].num = randomNum;
      buttons.entity[buttons.entity.length/2+i].key = String.fromCharCode(buttons.entity[buttons.entity.length/2+i].num+96);
      questions.push(buttons.entity[buttons.entity.length/2+i].key);
    }
    buttons.num_b = buttons.num_b + times;     
  }
  console.log(questions);
}
$(document).ready(function(){
  let showKey= (color)=>{   //將被選到的buttons 加上style
    if(color == 1){
      for(let i=0;i<buttons.entity.length/2;i++)
        $("#"+buttons.entity[i].key).removeClass( "original" ).addClass( "red" ).text(i+1);
    }
    else{
      for(let i=0;i<buttons.entity.length/2;i++)
        $('#'+buttons.entity[buttons.entity.length/2+i].key).removeClass( "original" ).addClass( "blue" ).text(i+1);
    }
  }
  let tap_handler = (event)=>{  //tap callback
    $('#'+buttons.entity[buttons.now].key).removeClass( buttons.entity[buttons.now].color ).addClass( "original" ).text(""); //移除再buttons.entity[now]的style
    if(buttons.entity[buttons.now].color=='red'){
      buttons.num_r = buttons.num_r -1;
      if(buttons.num_r==1){   //如果該顏色剩下一個 增加三個
        generate(0,buttons.entity.length/2); 
        showKey(0);
      }
    }
    else {	
      buttons.num_b = buttons.num_b -1;
      if(buttons.num_b==1){
        generate(1,buttons.entity.length/2); 
        showKey(1);
      }
    }
    buttons.now++;
    if(buttons.now==buttons.entity.length)  //判斷 now 是否超過array大小  有的話設回0
      buttons.now = 0;
    let temp={};
    temp.key = $(event.target).attr('id'); //將tap的key值 跟 X Y 座標 存到temp object 並 push 到 results
    temp.X = event.pageX;
    temp.Y = event.pageY;
    results.push(temp);
    //console.log(event);
    for(let i=0;i<results.length;i++)
      console.log(results[i].key);
  }
  $('.original').on("tap",tap_handler);  //將所有按鍵綁上 tap event
  generate(1,buttons.entity.length/2);  //產生紅色按鈕
  showKey(1);  
});

// vi:et:sw=2:ts=2

require('./index.css');
let buttons = {
       num_r:0,
	   num_b:0,
	   now:0,
	   entity:[],
	   checkNum(num){
	       for(let i = 0;i< this.entity.length; i++){
		      if( num == this.entity[i].num)
			  return true;
		   }
	   },
	   initiate(num){
	      for(let i = 0;i<num/2;i++){
		     this.entity.push({num:0,key:'',color:'r'});
		  }
	      for(let i = num/2;i<num;i++){
		     this.entity.push({num:0,key:'',color:'b'});
		  }
	   }
	   
};
buttons.initiate(6); //initial
let questions =[];
let results =[];
function generate(color,times){
    let randomNum;
    if(color==1){ //red
        for(let i=0;i<times;i++){
		   do{
               randomNum = Math.floor((Math.random() * 26) + 1);
           }while(buttons.checkNum(randomNum))
		   buttons.entity[i].num = randomNum;
           buttons.entity[i].key = String.fromCharCode(buttons.entity[i].num+96);
           questions.push(buttons.entity[i].key);
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
     let showKey= (color)=>{
        if(color == 1){
		  for(let i=0;i<buttons.entity.length/2;i++)
            $("#"+buttons.entity[i].key).removeClass( "original" ).addClass( "choose_r" ).text(i+1);
        }
        else{
		  for(let i=0;i<buttons.entity.length/2;i++)
            $('#'+buttons.entity[buttons.entity.length/2+i].key).removeClass( "original" ).addClass( "choose_b" ).text(i+1);
        }
    }
    let tap_handler = (event)=>{
        $('#'+buttons.entity[buttons.now].key).removeClass( "choose_"+buttons.entity[buttons.now].color ).addClass( "original" ).text("");
		if(buttons.entity[buttons.now].color=='r'){
          buttons.num_r = buttons.num_r -1;
          if(buttons.num_r==1){
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
		if(buttons.now==buttons.entity.length)
		  buttons.now = 0;
        let temp={};
		temp.key = $(event.target).attr('id');
		temp.X = event.pageX;
		temp.Y = event.pageY;
		results.push(temp);
		console.log(event);
        console.log(results);
    }
    $('.original').on("tap",tap_handler);  
    generate(1,buttons.entity.length/2); 
    showKey(1);
});

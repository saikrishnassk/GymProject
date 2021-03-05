var btn = document.getElementById("yes_opt");
var btn1 = document.getElementById("no_opt");
var flag=true;
function addQuestion(ques,opt1,opt2,id1,id2){
    console.log(ques);
    console.log(opt1,opt2);
    var div1 = document.createElement("div");
    div1.classList.add("form-group");
    div1.classList.add("Custom1");

    var div2 = document.createElement("label");
    div2.textContent=ques;
    div1.appendChild(div2);

    div2 = document.createElement("br");
    div1.appendChild(div2);

    div2 = document.createElement("input");
    div2.setAttribute("type","radio");
    div2.setAttribute("id",id1);
    div2.name =ques;
    div1.appendChild(div2);

    div2 = document.createElement("label");
    div2.setAttribute("for",id1);
    div2.textContent = opt1;
    div1.appendChild(div2);

    div2 = document.createElement("input");
    div2.setAttribute("type","radio");
    div2.setAttribute("id",id2);
    div2.name = ques;
    div1.appendChild(div2);

    div2 = document.createElement("label");
    div2.setAttribute("for",id2);
    div2.textContent = opt2;
    div1.appendChild(div2);

    document.getElementsByClassName("myForm")[0].appendChild(div1);
}

btn.addEventListener("click",(event) =>{
    console.log(event);
    console.log("Clicked");
    if(flag){
        addQuestion("Sai Toesn't it ?","ans1","ans2","opt1_id1","opt1_id2");
        addQuestion("This is sample two ?","ans2","ans3","opt2_id1","opt2_id2")
        flag=false;
    }
    
});

function removeQuestion(){
    var arr=document.getElementsByClassName("Custom1");
    console.log(arr);
    for(var i=arr.length-1;i>=0;i--){
        arr[i].remove();
    }
}
btn1.addEventListener("click",()=>{
    console.log("Came to no group");
    if(!flag){
        removeQuestion();
        flag=true;
    }
})
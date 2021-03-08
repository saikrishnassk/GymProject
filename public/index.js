var Form1 = document.getElementById("Form1");
var Form2 = document.getElementById("Form2");
// var Form3 = document.getElementById("Form3");

var Next1 = document.getElementById("Next1");
// var Next2 = document.getElementById("Next2");
var Back1 = document.getElementById("Back1");
// var Back2 = document.getElementById("Back2");

var Submit = document.getElementById("submit");

var data={};

function getRadioVal(form, name) {
    var val = "";
    // get list of radio buttons with specified name
    var radios = form.elements[name];
    
    // loop through list of radio buttons
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            val = radios[i].value; // if so, hold its value in val
            break; // and break out of for loop
        }
    }
    return val; // return value of checked radio or undefined if none checked
}

var progress = document.getElementById("progress");
Next1.onclick = function(){
    if(ValidForm1()){
        Form1.style.left = "-550px";
        Form2.style.left = "40px";
        progress.style.width = "480px";
    }
    else{
        alert("Fill all mandatory blanks with *");
    }
}
Back1.onclick = function(){
    Form1.style.left = "40px";
    Form2.style.left = "550px";
    progress.style.width = "240px";
}

// Next2.onclick = function(){
//     if(ValidForm2()){
//         Form2.style.left = "-550px";
//         Form3.style.left = "40px";
//         progress.style.width = "480px";
//     }
//     else{
//         alert("Please answer all questions!");
//     }
// }
// Back2.onclick = function(){
//     Form2.style.left = "40px";
//     Form3.style.left = "550px";
//     progress.style.width = "320px";
// }

Submit.onclick = function(){
    if(ValidForm2()){
        console.log(data);
        fetch("/feedback",{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        window.location.replace("https://www.google.com");
    }
    else{
        alert("Please answer all questions!");
    }
}

function ValidForm1(){
    var ele = document.getElementById("first-name").value.trim();
    if(ele === "") return false;
    data["First Name"] = ele;
    
    ele = document.getElementById("last-name").value.trim();
    data["Last Name"] = ele;

    ele = document.getElementById("email-id").value.trim();
    if(ele === "") return false;
    data["Email Id"] = ele;

    ele = document.getElementById("subscription-plan").value.trim();
    if(ele === "") return false;
    data["Subscription Plan"] = ele;
    console.log(data);
    return true;
}

function ValidForm2(){
    var ele = document.getElementById("question1").textContent;
    data["Question1"] = ele;
    
    ele = getRadioVal(Form2,"yes_no1");
    console.log(ele);
    if(ele === "") return false;
    data["Answer1"] = ele;

    ele = document.getElementById("question2").textContent;
    data["Question2"] = ele;

    ele = getRadioVal(Form2,"yes_no2");
    if(ele === "") return false;
    data["Answer2"] = ele;

    ele = document.getElementById("question3").textContent;
    data["Question3"] = ele;

    ele = getRadioVal(Form2,"yes_no3");
    if(ele === "") return false;
    data["Answer3"] = ele;

    console.log(data);
    return true;
}


function ValidForm3(){
    var ele = document.getElementById("question4").textContent;
    data["Question4"] = ele;
    
    ele = getRadioVal(Form3,"yes_no4");
    console.log(ele);
    if(ele === "") return false;
    data["Answer4"] = ele;

    ele = document.getElementById("question5").textContent;
    data["Question5"] = ele;

    ele = getRadioVal(Form3,"yes_no5");
    if(ele === "") return false;
    data["Answer5"] = ele;

    ele = document.getElementById("question6").textContent;
    data["Question6"] = ele;

    ele = getRadioVal(Form3,"yes_no6");
    if(ele === "") return false;
    data["Answer6"] = ele;
    
    console.log(data);
    return true;
}
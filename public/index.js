//index.js 

//This is where the user will see the text that they input for their passcode
var userInput = document.getElementById("userInput");
let userNotification = document.getElementById("userNotification");
const keys = document.querySelectorAll(".key");

//Checking to see if the user clicked on a key, and if they did run the function
keys.forEach(key => {key.addEventListener ("click", () => {keyPadClicked(key);})});


function keyPadClicked(key){

    //Different scenarios in which the user presses keys on the keypad

    if(key.textContent == "Back"){

        userInput.textContent = "";

    }//end if statement

    else if(key.textContent == "Enter"){

        checkPassCode(userInput.textContent, false);
        


    }//end else if statement

    else{

        userInput.textContent = userInput.textContent + key.textContent;

    }//end else statement

    
}//end keyPadClicked
 
function checkPassCode(passcode, isAdmin){

    //check on the server if the password exists
     fetch('/check-passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  })

  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const userId = data.userId;
      userNotification.textContent = "Passcode found";
      sessionStorage.setItem("currentUser", userId);
      console.log(sessionStorage.getItem("currentUser"));
      if(isAdmin == true){

        window.location.href = "admin.html";

      }//end if statement
      else{

        window.location.href = "dining.html";

      }//end else statement
      
    } else {
      userNotification.textContent = "Passcode not found";
    }
  });

    

}//end checkPassCode

function accessAdmin(){

  checkPassCode(userInput.textContent, true);

}//end accessAdmin


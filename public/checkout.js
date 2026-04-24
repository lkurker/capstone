//checkout.js

//subtotal that will be displayed to the user, then we will add the tip amount to calculate the total
let subtotal = 0;

//the subtotal will always stay consistent in case the user changes the tip amount. The total is what will be allowed to change
let total = 0;
let tax = 0;
let tip = 0;

//we will store the salesID as well on this page
let salesID = 0;

let totalDoc = document.getElementById("total");
let tipDoc = document.getElementById("tip");

//document elements for the keypad and user input
let userInput = document.getElementById("userInput");
let keyPad = document.getElementById("keyPad");

//Checking to see if the user clicked on a key, and if they did run the function
const keys = document.querySelectorAll(".key");
keys.forEach(key => {key.addEventListener ("click", () => {keyPadClicked(key);})});

//We will need to keep track of certain elements to ensure that the tip amount is formtted correctly on the keypad
let hasDecimal = false;
let decimalPlaces = 0;

getSubtotal();

//function definitions
async function getSubtotal(){

    salesID = Number(sessionStorage.getItem("salesID"));
    const response = await fetch(`/api/get-subtotal/${salesID}`);
    const data = await response.json();
    
    //loop through and add up the prices for the food items
    for(let i = 0; i < data.length; i++){

        subtotal += Number(data[i].Price);

    }//end for loop

    //set the current total to the value of the subtotal
    total = subtotal;

    const subtotalDoc = document.getElementById("subtotal");
    subtotalDoc.textContent = "$" + subtotal.toFixed(2);

    //Also display the tax for the item
    const taxDoc = document.getElementById("tax");
    tax = Math.round(total * 0.07 * 100) / 100;
    taxDoc.textContent = "$" + tax.toFixed(2);

    //Now add the tax with the subtotal for future use
    total = tax + total;
    totalDoc.textContent = "$" + total.toFixed(2);

}//end getSubtotal



//Set the tip amount based on what was calculated
function setTip(tipAmount){

    total = subtotal + tax;

    total = Math.round((tipAmount + total) * 100) / 100;
    tipDoc.textContent = "$" + tipAmount.toFixed(2);
    totalDoc.textContent = "$" + total.toFixed(2);
    tip = tipAmount;

}//end getTip



//Calculate the tip if the user doesn't use the custom option
function calculateTip(tipPercent){


    let tipAmount = Math.round(subtotal * tipPercent * 100) / 100;
    setTip(tipAmount);
    

}//end calculateTip



function displayKeyPad(){

    userInput.style.display = "grid";
    keyPad.style.display = "grid";

}


//Detects user input and sets the tip amount
function keyPadClicked(key){

    

    //Different scenarios in which the user presses keys on the keypad

    if(key.textContent == "Back"){

        userInput.textContent = "";
        hasDecimal = false;
        decimalPlaces = 0;

    }//end if statement

    else if(key.textContent == "Enter"){

        hasDecimal = false;
        decimalPlaces = 0;
        setTip(Number(userInput.textContent));
        userInput.textContent = "";

    }//end else if statement

    else if(key.textContent == "00"){

       
        //Only allow this if there is currently a decimal point and it doesn't have any places yet
        if(hasDecimal == true && decimalPlaces == 0){

            console.log("pressed 00");
            userInput.textContent = userInput.textContent + key.textContent;
            decimalPlaces = 2;

        }//end if statement

    }//end if statement

    else if(key.textContent == "."){

        //check to ensure there are no decimal points yet
        if(hasDecimal == false){

            userInput.textContent = userInput.textContent + key.textContent;
            hasDecimal = true;

        }

    }//end else if statement

    //every other scenario
    else{

        

        if(hasDecimal == false){

            userInput.textContent = userInput.textContent + key.textContent;

        }//end if statement

        //if there is already a decimal
        if(hasDecimal == true && decimalPlaces < 2){

            userInput.textContent = userInput.textContent + key.textContent;
            decimalPlaces += 1;

        }//end if statement

    }//end else statement

}//end keyPadClicked 



//Function to close the current sale
async function closeSale(){

    let response = await fetch("/api/close-sale", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({

            salesID: salesID,
            subtotal: subtotal, 
            tip: tip


        })

    });

    let data = await response.json();

    //if everything worked out nicely
    if(data.success){

        window.location.href = "dining.html";

    }//end if statement

    else{

        console.log("ERROR");

    }

}//end closeSale

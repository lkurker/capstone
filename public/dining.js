//Dining.js


//This is the table we are currently selecting, it will allow us to keep track and use this data
let tableSelected = null;

const diningKeyPad = document.getElementById("diningKeyPad");
var userInput = document.getElementById("userInput");
const keys = document.querySelectorAll(".key");
const test = document.getElementById("test");



//Getting all of the tables from the dining area to see if they have been clicked
const diningTables = document.querySelectorAll(".table");

//checking to see if any keys on the main key pad has been clicked
keys.forEach(key => {key.addEventListener ("click", (event) => {keyPadClicked(key); event.stopPropagation();})} );

//Adding an event listener to remove the table guest keypad if the user clicks on the screen randomly
const background = document.getElementById("background");
background.addEventListener ("click", () => {removeKeyPad();});

//Indicate which servers are assigned to which tables when the page loads
assignTables();


function removeKeyPad(){

    diningKeyPad.style.display = 'none';
    userInput.style.display = 'none';
    userInput.textContent = "";

}//end removeKeyPad


function keyPadClicked(key){

    if(key.textContent == "Enter"){

        //We will use a storage session to transfer over which table was clicked
        sessionStorage.setItem("currentTable", tableSelected);
        setGuests(userInput.textContent);
        createSale();
        window.location.href = "order.html";

    }//end if statement

    else if(key.textContent == "Back"){

        userInput.textContent = "";

    }//end else if statement

    else{

        userInput.textContent = userInput.textContent + key.textContent;

    }//end else statement

}//end keyPadClicked


//Sets which table the server is currently looking at
async function selectTable(table, e){

    e.stopPropagation();

    tableSelected = table;

    //Need to set numGuests to the value of the member variable guests
    const data = await getGuests();
    const numGuests = data.guests;
    const id = data.id;
    let currentUserID = 0;

    //In the case where a value is not null
    if(id != null){

        //Check to see if the table selected belongs to the current user
        const response = await fetch(`/api/get-userSale/${id}`);
        const info = await response.json();
        currentUserID = info[0].UserID;

    }//end if statement

        

    if(numGuests == 0){

        //We will change this soon, this is just so that I can move to the next page

        diningKeyPad.style.display = 'grid';
        userInput.style.display = 'grid';
        
    }//end if statement

    //Check if the current user is supposed to be accessing this table
    else if(sessionStorage.getItem("currentUser") == currentUserID){

        //If a table already has its guests set, then move to the next page immediately
        sessionStorage.setItem("currentTable", tableSelected);
        window.location.href = "order.html";

    }//end else if statement



}//end selectTable

//getters and setters for the number of guests at a table

async function setGuests (tableGuests){

    const response = await fetch("/api/set-guests", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({

            guests: tableGuests,
            tableId: tableSelected
        })

    });

    const data = await response.json();
    console.log("Server response:", data);

}//end setGuests

async function getGuests(){

    const response = await fetch(`/api/get-guests/${tableSelected}`);
    const data = await response.json();
    return data;


}//end getGuests

//Create an order if a table is currently empty
async function createSale(){

    const respone = await fetch("/api/create-sale", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            
            tableId: tableSelected,
            currentUser: sessionStorage.getItem("currentUser")
        
        })
    });

    const data = await response.json();



}//end createOrder



//This function will change the background color of tables if they are currently being looked at by a server
async function assignTables(){

    console.log("changing table colors!");

    const response = await fetch("/api/get-tables");
    const data = await response.json();

    console.log(data);

    //loop through each table and change their background if needed
    for(let i = 0; i < data.length; i++){

        const backgroundTable = document.getElementById("table" + (i + 1));

        

        if(data[i].color == null){

            backgroundTable.style.backgroundColor = 'white';

        }//end if statement

        else{

            backgroundTable.style.backgroundColor = data[i].color;

        }

    }//end for loop

}//end assignTables
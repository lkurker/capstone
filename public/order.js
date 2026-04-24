//order.js

const foodColumn = document.getElementById("foodColumn");
const order = document.getElementById("order");

let tableSelected = sessionStorage.getItem("currentTable");


//We will indicate which guest we are currently selecting after pressing their button
let currentGuest = 0;

//This will indicate the number of the guest so that we can insert this into the database after they order
let guestNum = 0;

//SaleID for the tables current sale
let salesID;

//These variables will keep track of which food item currently part of the sale we are looking at, in case 
//the user chooses to delete them
let displayedItem = 0;
let displayedID = 0;

setGuests();


//Function definitions
function pressedButton(){

    foodColumn.textContent = tableSelected;

}//end pressedButton



async function getGuests(){

    
    const response = await fetch(`/api/get-guests/${tableSelected}`);
    const data = await response.json();
    return data;


}//end getGuests



async function setGuests(){

    //We must set saleID for use later, I am doing it here since this function always runs once the page opens
    salesID = await getSale();

    //We will create elements on the order page based on how many guests are at the current table
    const data = await getGuests();
    const numGuests = data.guests;

    for(let i = 0; i < numGuests; i++){

        const wrapper = document.createElement("div");

        const guestNumber = document.createElement("button");
        guestNumber.className = "guestNumber";
        guestNumber.id = "guest-" + (i + 1);
        guestNumber.addEventListener("click", () => setGuest(guestNumber, (i + 1), numGuests));
        guestNumber.textContent = "Guest " + (i + 1);
        

        //Each button must have an unordered list made afterwards in order for the food items to be listed
        const foodList = document.createElement("ul");
        foodList.className = "foodList";
        foodList.id = "list-" + (i + 1); 
        
        //Place the guestNumber as well as foodList as children of the wrapper
        wrapper.appendChild(guestNumber);
        wrapper.appendChild(foodList);
      
        order.appendChild(wrapper);

    }//end for loop


    //Now we will display any and all food items that are already part of this sale
    const response = await fetch(`/api/get-items/${salesID}`);
    const information = await response.json();
    information.forEach(result => {

        displayItem(result.ItemID, result.MenuID, result.guestNum);        

    });

}//end setGuests



//This function will change which food buttons are displayed on the order page
function changeCategory(button){

    //Access the category elements here so we can change their display
    const entree = document.getElementById("entree");
    const appetizer = document.getElementById("appetizer");
    const bowl = document.getElementById("bowl");

    //change the category based on which button is clicked
    if (button.id == "entreeCategory"){

        appetizer.style.display = 'none';
        bowl.style.display = 'none';
        entree.style.display = 'contents';


    }//end if statement

    else if(button.id == "appetizerCategory"){

        bowl.style.display = 'none';
        entree.style.display = 'none';
        appetizer.style.display = 'contents';

    }//end else if statement

    else if(button.id == "saladCategory"){

        entree.style.display = 'none';
        appetizer.style.display = 'none';
        bowl.style.display = 'contents';

    }//end else if statement

}//end changeCategory



//setting the current customer
function setGuest(button, i, numButtons){

    currentGuest = "list-" + i;
    guestNum = i;

    //Indicate that the button is selected by changing the background color
    button.style.backgroundColor = "gray";

    //Change every other button back to the default
    for(let j = 0; j < numButtons; j++){

        if(j != (i - 1)){

            const button = document.getElementById("guest-" + (j + 1));
            button.style.backgroundColor = "white";
            

        }//end if statement

    }//end for loop
    
    

}//end setGuest



//Function to allow us to add items to the customers order
async function addItem(orderNum){

    

    //check to ensure a guest has been chosen
    if(currentGuest == 0){

        //do nothing
        console.log("Doing nothing");

    }//end if statement

    //if a guest was chosen
    else {

        console.log("Now I really have added one!");
        console.log(salesID);

        //Now we can log this item into the database
        let response = await fetch("/api/set-item", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({

            salesID: salesID,
            menuID: orderNum,
            guestNum: guestNum
        })

    });

    let data = await response.json();

    //Now we can add the item to the customer's order on the UI
    //We first must get the latest item from the saleitem table
    response = await fetch(`/api/get-latestItem/${salesID}`);
    data = await response.json();
    
    //Now display the item
    await displayItem(data.ItemID, data.MenuID, data.guestNum);


    }//end else statement



}//end addItem



//gets the saleId for the current tables sale
async function getSale(){

    //we must get the tableID and then pass it to the api to get the current salesID
    let tableID;
    if(Number(tableSelected) < 10){

        tableID = "000" + tableSelected;

    }//end if statement

    else if(Number(tableSelected >= 10)){

        tableID = "00" + tableSelected;

    }//end else if statement

    const response = await fetch(`/api/get-sale/${tableID}`);
    const data = await response.json();
    const sale = data.salesID;
    return sale;

}//end getSale



//this function will display the items on the page for the user to view
async function displayItem(itemID, menuID, guestNum){

    console.log("This is the menu ID: " + menuID);
    //We first must get access to the menu items name as well as price
    const response = await fetch(`/api/get-menu/${menuID}`);
    const data = await response.json();
    const itemName = data.ItemName;
    const price = data.Price;

    //Now we can set display this information for the user to see
    const displayFood = document.createElement("li");
    displayFood.className = "foodDisplay";
    displayFood.addEventListener("click", () => setDisplay(event.currentTarget, itemID));
    displayFood.textContent = itemName + "  $" + price;

    //Now we will append the item
    const listWrapper = document.getElementById("list-" + guestNum);
    listWrapper.appendChild(displayFood);


}//end displayItem



//Setting the current item that the user may want to delete
function setDisplay(button, itemID){

    //If you clicked the same button again, deselect it
      if (displayedItem === button) {

        button.style.backgroundColor = "";
        displayedItem = null;
        displayedID = null;
        return;

    }//end if statement

    displayedItem = button;
    displayedID = itemID;

    displayedItem.style.backgroundColor = "green";

    //set every food item you haven't selected back to the default
    const displayedFoodItems = document.getElementsByClassName("foodDisplay");
    for(let i = 0; i < displayedFoodItems.length; i++){

        //check if the displayedFoodItem is the one currently selected by the user
        if(displayedFoodItems[i] != displayedItem){

            displayedFoodItems[i].style.backgroundColor = "";

        }//end if statement

    }//end for loop



}//end setDisplay



//If the user wants to remove an item that they previously put on the menu, they can
async function removeItem(){

    displayedItem.remove();

    //Remove the item from the database
    await fetch(`/api/remove-item/${displayedID}`, {
        method: "DELETE"
    });

}//end removeItem



//Close the table
function closeTable(){

    //set the salesID into a session variable to carry it over to the checkout page
    sessionStorage.setItem("salesID", salesID);
    window.location.href = "checkout.html";

}//end closeTable




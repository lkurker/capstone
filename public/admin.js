var acc = document.getElementsByClassName("accordion");
var i;

const container = document.getElementById("adminContainer");

//Set the sales report table
salesReport();

async function salesReport(){

    //get the all of the completed sales
    const response = await fetch(`/api/get-salesReport`);
    const data = await response.json();
    
    //Now group each piece from the dataset based on the day they were made
    const grouped = {};

 

    //This will essentially function as a hash table, where each day is a key that will then lead the
    //System to the individual sales reports from that specefic day
    data.forEach(element => {
        
        //If a day isn't in the list yet:
        if(!grouped[element.Date]){

            //Each element gets its own set of values in an array
            grouped[element.Date] = [];

        }//end if statement

        grouped[element.Date].push(element);


    });//end for loop

    //Now with all of this data, we can create the sales report as a set of tables using the accordion table technique
    Object.entries(grouped).forEach(([day, sales]) => {

        console.log(sales[0].FirstName);

        console.log("looping through the days");
        const button = document.createElement("button");
        button.className = "accordion";
        button.textContent = day;
        container.appendChild(button);

        const table = document.createElement("table");
        table.className = "panel";

        container.appendChild(table);

        //Create the row with the column headers
        const headerRow = document.createElement("tr");
        //Create each column header
        const column1 = document.createElement("th");
        const column2 = document.createElement("th");
        const column3 = document.createElement("th");
        const column4 = document.createElement("th");
        const column5 = document.createElement("th");
        
        //Set their text values and the append them to the table
        column1.textContent = "SaleID";
        column2.textContent = "Name";
        column3.textContent = "Total";
        column4.textContent = "Tip";
        column5.textContent = "Time";

        headerRow.appendChild(column1);
        headerRow.appendChild(column2);
        headerRow.appendChild(column3);
        headerRow.appendChild(column4);
        headerRow.appendChild(column5);

        table.appendChild(headerRow);

        //Now we can begin adding the rows for each sale made during the day
        for(let i = 0; i < sales.length; i++){

            console.log(sales[i].salesID);

            const row = document.createElement("tr");
            table.appendChild(row);

            const newColumn1 = document.createElement("td");
            const newColumn2 = document.createElement("td");
            const newColumn3 = document.createElement("td");
            const newColumn4 = document.createElement("td");
            const newColumn5 = document.createElement("td");

            //Append each new column to the current row
            row.appendChild(newColumn1);
            row.appendChild(newColumn2);
            row.appendChild(newColumn3);
            row.appendChild(newColumn4);
            row.appendChild(newColumn5);

            //Now set the values for each column from the database
            newColumn1.textContent = sales[i].salesID;
            newColumn2.textContent = sales[i].firstname + " " + sales[i].lastname;
            newColumn3.textContent = sales[i].totalAmount;
            newColumn4.textContent = sales[i].tip;
            newColumn5.textContent = sales[i].Time;


        }//end for loop


        

    });//end for loop 


    for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {

    //Toggle the accordion by making the table elements either display or appear hidden to the user
    this.classList.toggle("active");

    //Stop showing the next element if it's already being displayed
    var panel = this.nextElementSibling;

    if (panel.style.display === "table") {

      panel.style.display = "none";

    }//end if statement

    else {

      panel.style.display = "table";

    }//end else statement

  });
}


}//end salesReport



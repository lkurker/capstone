//require('dotenv').config();
const express = require('express');
const app = express();
//hello
app.use(express.static('public'));

const mysql = require('mysql2');


// Connect to MySQL using a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.query('SELECT 1', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});


app.use(express.json());



//Route to check the passcode and return the current user
app.post('/check-passcode', (req, res) => {
  const { passcode } = req.body;

  pool.query(
    'SELECT * FROM user WHERE passcode = ?',
    [passcode],
    (err, results) => {

      if (err) {
        console.log(err);
        return res.status(500).json({ success: false });
      }

      if (results.length === 0) {
        return res.json({ success: false });
      }

      return res.json({
        success: true,
        userId: results[0].UserID
      });

    }
  );
}); //end check-passcode



//Route to get guests from the table
app.get('/api/get-guests/:tableId', (req, res) => {

  const tableId = Number(req.params.tableId);

  const sql = 'SELECT numguests, SalesID FROM restauranttable WHERE tableId = ?';

  pool.query(sql, [tableId], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }


    if (results.length === 0) {
      return res.json({ guests: 0 });
    }

    const numguests = results[0].numguests;
    const id = results[0].SalesID;

    res.json({ guests: numguests,
                id: id });
  });
});//end get-guests



//Route to set guests for the table
app.post("/api/set-guests", (req, res) => {


  const {guests, tableId} = req.body;

  const query = "update restauranttable set numguests = ? where tableId = ?";

  pool.query(query, [guests, tableId], (err, result) => {

    //check for an error
    if(err) {

      console.log(err);
      return res.json({success: false});

    }

    res.json({success: true});

  })

});//end set-guests



//create a new order and set that value to the current table
app.post("/api/create-sale", async (req, res) => {



    const {tableId, currentUser} = req.body;

  

    let salesID;

    pool.query(
    "INSERT INTO sales (userId, totalamount, salestatus) VALUES (?, ?, ?)",
    [currentUser, 0.00, "Open"],
    (err, results) => {

      if (err) {
        console.error(err);
        return res.json({ success: false });
      }

      const salesID = results.insertId;

      

      pool.query(
        "UPDATE restauranttable SET salesId = ? WHERE tableId = ?",
        [salesID, tableId],
        (err2) => {

          if (err2) {
            console.error(err2);
            return res.json({ success: false });
          }

          return res.json({
            success: true,
            salesID
          });

        }
      );

    }
  );

});//end create-sale


//Return the saleID for the current table
app.get('/api/get-sale/:tableID', (req, res) => {

  const tableID = Number(req.params.tableID);

  const sql = 'SELECT salesID FROM restauranttable WHERE tableID = ?';

  pool.query(sql, [tableID], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }


    if (results.length === 0) {
      return res.json({ guests: 0 });
    }

    const salesID = results[0].salesID;
    

    res.json({ salesID: salesID });
  });
});//end get-sale



//Setting food items into the saleItem relation
app.post("/api/set-item", async (req, res) => {



    const {salesID, menuID, guestNum} = req.body;

  

    pool.query(
    "INSERT INTO saleitem (salesID, menuID, guestNum) VALUES (?, ?, ?)",
    [salesID, menuID, guestNum],
    (err, results) => {

      if (err) {
        console.error(err);
        return res.json({ success: false });
      }

      return res.json({
        success: true,
        insertID: results.insertId
      });

        }
      );

    }
  );//end set-item


  //Return the row of food items that are part of the current sale
  app.get('/api/get-items/:salesID', (req, res) => {


    const salesID = req.params.salesID;
    const sql = 'select * from saleitem where salesID = ?';

    pool.query(sql, [salesID], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }//end if statement

    //if there are no errors
    return res.json(results);


  });


  });//end get-items

  //Here we will return the menu items directly from the menu table to access their price as well as name
  app.get('/api/get-menu/:menuID', (req, res) => {

    

    const menuID = req.params.menuID;
    //console.log(menuID);
    const sql = 'select ItemName, Price from menu where menuID = ?';

    pool.query(sql, [menuID], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }//end if statement

    if (results.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    
    //if there are no errors
    return res.json(results[0]);

  });

  });//end get-menu


  //Return the latest item on the saleitem table, this will return the item that was just added
  app.get('/api/get-latestItem/:salesID', (req, res) => {

    const salesID = req.params.salesID;
    const sql = 'select * from saleitem where salesID = ? order by itemID desc limit 1';

    pool.query(sql, [salesID], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }//end if statement

    if (results.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    //if there are no errors
    return res.json(results[0]);

  });

  });//end get-latestItem


  //Delete items from saleitem
  app.delete('/api/remove-item/:itemID', (req, res) => {

  const itemID = req.params.itemID;

  pool.query(
    "DELETE FROM saleitem WHERE itemID = ?",
    [itemID],
    (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      return res.json({ success: true });
    }
  );

});

//Return the prices for the food items associated with the current sale
  app.get('/api/get-subtotal/:salesID', (req, res) => {


    const salesID = req.params.salesID;
    const sql = 'select m.Price from saleitem s, menu m where s.MenuID = m.MenuID and s.SalesID = ?';

    pool.query(sql, [salesID], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }//end if statement

    //if there are no errors
    return res.json(results);


  });


  });//end get-items

  //Close the sale of a table and mark it as available for future servers
  app.post("/api/close-sale", (req, res) => {
  const { salesID, subtotal, tip } = req.body;

  //Get a dedicated connection from the pool for the transaction
  pool.getConnection((err, conn) => {
    if (err) {
      console.error(err);
      return res.json({ success: false });
    }

  //Begin a transaction to insure in anything fails, nothing will commit to the database
  conn.beginTransaction((err) => {
    if (err) {
      conn.release();
      console.error(err);
      return res.json({ success: false });
    }

    //First we will update sales to ensure that everything is closed
    conn.query(
      "update sales set totalamount = ?, salestatus = 'Paid', closeTime = Now(), tip = ? where salesID = ?",
      [subtotal, tip, salesID],
      (err2) => {
        if (err2) {
          return conn.rollback(() => {
            conn.release();
            console.error(err2);
            res.json({ success: false });
          });
        }

        //Next, make the current table available for future sales
        conn.query(
          "update restauranttable set TableStatus = 'Available', numGuests = 0, salesID = null where salesID = ?",
          [salesID],
          (err3) => {
            if (err3) {
              return conn.rollback(() => {
                conn.release();
                console.error(err3);
                res.json({ success: false });
              });
            }

            conn.commit((err4) => {
              if (err4) {
                return conn.rollback(() => {
                  conn.release();
                  console.error(err4);
                  res.json({ success: false });
                });
              }

              conn.release();
              res.json({
                success: true,
                salesID
              });
            });
          }
        );
      }
    );
  });
  });
});





//Return the sales reports from the sales table
app.get('/api/get-salesReport', (req, res) => {

  

  const sql = "select s.salesID, u.firstname, u.lastname, date_format(s.closetime, '%Y-%m-%d') as 'Date', date_format(s.closetime, '%h:%i %p') as 'Time', s.totalAmount, s.tip from sales s, user u where s.userid = u.userid and s.salestatus = 'Paid' order by Date desc, Time asc;";

  pool.query(sql, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }


    return res.json(results);

  });
});//end get-salesReport



//Return the profit reports from the sales item and menu table
app.get('/api/get-profitReport', (req, res) => {

  
//We must write a long query to calculate how much profit was made for each item every day....

  const sql = `
with item_cost AS (
    select 
        r.MenuID,
        sum(r.quantity * i.costperunit) as cost_per_item
    from recipe r
    join ingredient i 
        on r.IngredientID = i.IngredientID
    group by r.MenuID
)


select 
    date_format(s.closeTime, '%Y-%m-%d') as sale_date,
    m.ItemName,

    count(si.ItemID) AS total_sold,

    
    count(si.ItemID) * m.Price AS revenue,


    count(si.ItemID) * coalesce(ic.cost_per_item, 0) as cost,

    (count(si.ItemID) * m.Price) 
    - (count(si.ItemID) * coalesce(ic.cost_per_item, 0)) as profit

from sales s

join saleitem si 
    on s.SalesID = si.SalesID

join menu m 
    on si.MenuID = m.MenuID

left join item_cost ic 
    on m.MenuID = ic.MenuID


where s.SaleStatus = 'Paid'

group by
    sale_date,
    m.MenuID,
    m.ItemName,
    ic.cost_per_item

order by
    sale_date desc,
    total_sold desc;`;


  pool.query(sql, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    return res.json(results);

  });
});//end get-salesReport

//Return the user for the current sale being looked at
app.get('/api/get-userSale/:id', (req, res) => {

  
  const id = req.params.id;  

  const sql = "select UserID from sales where SalesID = ?";



  pool.query(sql, [id], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    
    return res.json(results);

  });
});//end get-salesReport



//Returns tables along with their associated users
app.get('/api/get-tables', (req, res) => { 


  const sql = `select rt.tableID, u.color
                from restauranttable rt
                left join sales s
                on rt.salesID = s.salesID
                left join user u
                on s.userID = u.userID
                order by tableid;`;

   pool.query(sql, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    
    return res.json(results);

  });


});//end get-tables

/*
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

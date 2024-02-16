const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function generateUniqueId(username) {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const uniqueId = `${username}${timestamp}${randomString}`;
  return uniqueId;
}

const conn = mysql.createConnection({
  host: "localhost",
  user: "root" /* MySQL User */,
  password: "" /* MySQL Password */,
  database: "node_ec" /* MySQL Database */,
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected with App...");
});
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/auth", function (req, res) {
  let username = req.body.uname;
  let password = req.body.passwd;
  if (username && password) {
    conn.query(
      "SELECT * FROM users WHERE username = ? AND passwd = ?",
      [username, password],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;

          results.forEach((result) => {
            req.session.usrtyp = result.type;
            req.session.addr = result.addr;
            console.log(results);
          });
          if (req.session.usrtyp == 1) {
            res.redirect("/dashboard");
          } else {
            res.redirect("/");
          }
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

app.get("/dashboard", function (req, res) {
  if (req.session.loggedin && req.session.usrtyp) {
    res.render("dashboard");
  } else {
    res.send("<h1>401</h1>");
  }
});
app.get("/addp", function (req, res) {
  let sqlQuery = "SELECT * FROM types";

  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;

    res.render("add_pro", { results });
  });
});
app.post("/addp", function (req, res) {
  let data = {
    name: req.body.name,
    des: req.body.des,
    price: req.body.price,
    sale_price: req.body.saleprice,
    type: req.body.category,
    image: "not config",
    stock:req.body.stock,
  };
  let sqlQuery = "INSERT INTO products SET ?";

  let query = conn.query(sqlQuery, data, (err, results) => {
    if (err) throw err;
    else {
      res.redirect("/dashboard");
    }
  });
  // console.log(data);
});

app.get("/addtocart/:id", function (req, res) {
  let id = req.params.id;
  let sqlQuery = "SELECT * from products where id=" + id;
  let query = conn.query(sqlQuery, (err, result) => {
    if (err) {throw err;}
    else {
      if(req.session.loggedin) {
        let data = {
          p_id: result[0].id,
          username: req.session.username,
          p_name: result[0].name,
          p_price: result[0].sale_price,
          addr: req.session.addr,
        }
        let sqlQuery = "INSERT INTO cart SET ?";
        let query = conn.query(sqlQuery, data, (err, result) => {
          if (err) throw err;
          // 
        });
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    }
  });
});
app.post("/buyall", function (req, res) {
  
  let sqlQuery="SELECT * FROM CART";
  let cart;
  let query=conn.query(sqlQuery,(err,result)=>{
    if(err) throw err;
    else{
          cart=result;
    }
    
  
  // console.log(cart);
  if (req.session.loggedin) {
    const uniqueId = generateUniqueId(req.session.username);
    for(var i=0;i<cart.length;i++){
    let data = {
      p_id: cart[i].p_id,
      usr_buy: cart[i].username,
      o_id: uniqueId,
      addr: cart[i].addr,
      tracking: 0,
      tracking_id: "Not Available",
      mode: req.body.mode,
    };

     sqlQuery = "INSERT INTO orders SET ?";
     query = conn.query(sqlQuery, data, (err, results) => {
      if (err) throw err;
    });
  }
  sqlQuery="DELETE FROM CART";
  query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
  });

    res.send("<H1>orderd</H1>");
  } else {
    res.redirect("/login");
  }
});

}
);
app.get("/cart", function (req, res) {
  if(req.session.loggedin){
  let sqlQuery =
    "SELECT * FROM cart WHERE username='"+ req.session.username+"'";
  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    else {
      res.render("nohome", { results });
    }
  });
}else{
  res.redirect("/login");
}
});

app.get("/", function (req, res) {
  let sqlQuery =
    "SELECT types.type,products.id,products.name,products.des,products.price,products.sale_price,products.stock FROM `types` INNER JOIN products ON products.type = types.id";
  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    else {
      res.render("home", { results });
    }
  });
});

app.get("/details/:id", function (req, res) {
  var id = req.params.id;
  let sqlQuery = "SELECT * from products where id=" + id;
  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    else {
      res.render("product", { results });
    }
  });
});

app.post("/checkout", function (req, res) {
  var id = req.body.id;
  var qty=req.body.stock
  res.render("checkout", {id,qty});
});
app.post("/buy", function (req, res) {
  // console.log(req.session.loggedin);
  if (req.session.loggedin) {
    const uniqueId = generateUniqueId(req.session.username);
    console.log(req.body);
    let data = {
      p_id: req.body.p_id,
      usr_buy: req.session.username,
      o_id: uniqueId,
      addr: req.body.addr,
      tracking: 0,
      tracking_id: "Not Available",
      mode: req.body.mode,
    };
    // console.log(req.body.qty)
    let sqlQuery=`UPDATE products SET stock=stock-${req.body.qty} WHERE id=${req.body.p_id}`;
    let query = conn.query(sqlQuery,(err, results) => {
      if (err) throw err;
    });
 
    sqlQuery = "INSERT INTO orders SET ?";
     query = conn.query(sqlQuery, data, (err, results) => {
      if (err) throw err;
    });
    res.send("<H1>orderd</H1>");
  } else {
    res.redirect("/login");
  }
});

app.get("/view_order", function (req, res) {
  if (req.session.loggedin) {
    let sqlQuery =
      "SELECT orders.id,orders.p_id,orders.usr_buy,orders.o_id,orders.addr,orders.tracking ,orders.tracking_id,products.name,orders.mode FROM orders INNER JOIN products ON products.id = orders.p_id WHERE orders.usr_buy='" +
      req.session.username +
      "'";

    let query = conn.query(sqlQuery, (err, results) => {
      if (err) throw err;
      res.render("view_orders_user", { results });
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/view_order_admin", function (req, res) {
  if (req.session.loggedin && req.session.usrtyp) {
    let sqlQuery =
      "SELECT orders.id,orders.p_id,orders.usr_buy,orders.o_id,orders.addr,orders.tracking ,orders.tracking_id,products.name,orders.mode FROM orders INNER JOIN products ON products.id = orders.p_id";

    let query = conn.query(sqlQuery, (err, results) => {
      if (err) throw err;
      res.render("view_orders_admin", { results });
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/changestaAccept/:id", function (req, res) {
  var id = req.params.id;
  let sqlQuery = "UPDATE orders SET tracking=1 WHERE id=" + id;

  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    res.redirect("/view_order_admin");
  });
});
app.get("/changestaDecline/:id", function (req, res) {
  var id = req.params.id;
  let sqlQuery = "UPDATE orders SET tracking=4 WHERE id=" + id;

  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    res.redirect("/view_order_admin");
  });
});
app.get("/changestaDelivered/:id", function (req, res) {
  var id = req.params.id;
  let sqlQuery = "UPDATE orders SET tracking=3 WHERE id=" + id;

  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    res.redirect("/view_order_admin");
  });
});
app.post("/addT_id", function (req, res) {
  var id = req.body.oid;
  let sqlQuery =
    "UPDATE orders SET tracking=2,tracking_id='" +
    req.body.tid +
    "' WHERE id=" +
    id;

  let query = conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    res.redirect("/view_order_admin");
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000...");
});

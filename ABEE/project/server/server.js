const express = require('express');
const mysql = require('mysql');
const session = require('express-session');


const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydatabase'
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      res.send('Login successful!');
    } else {
      res.send('Invalid username or password');
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout successful!');
});
app.get('/',(req,res)=>{
    res.send("server running nigga");
})

app.listen(3001, () => {
  console.log('Server started on port 3001');
});

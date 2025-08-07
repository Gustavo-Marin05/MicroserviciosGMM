const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bd_agenda"
});

connection.connect((err) => {
  if (err) {
    console.error( err);
    return;
  }
  console.log("Conectado a la base datos");
});

module.exports = connection;

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 8089;
const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

app.use(bodyParser.urlencoded({ extended: true }));

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://moodly-9fa79-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

global.db = firebaseApp.database();

require("./routes/main")(app);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.listen(port, () => console.log(`mood.ly app listening on port ${port}!`));

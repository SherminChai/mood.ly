/* const cookieParser = require("cookie-parser");
const csrf = require("csurf"); */
const express = require("express");
const bodyParser = require("body-parser");
var path = require('path');
const app = express();
const port = 8089;
const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

/* const csrfMiddleware = csrf({ cookie: true });

app.use(cookieParser());
app.use(csrfMiddleware);; */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
var path = require("path");
app.use(express.static(path.join(__dirname, "public")));

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

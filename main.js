module.exports = function (app) {

    var fs = require('fs');
    var admin = require('firebase-admin');
    const cookieParser = require("cookie-parser");
    var firebaseRef = db.ref("main");
    var signUpRef = firebaseRef.child("sign-up");

    app.use(cookieParser());

    app.get("/", function (req, res) {
      res.render("welcomepage.html"); 
    });

    app.get("/welcomepage", function (req, res) {
      res.render("welcomepage.html")
    });

    app.get("/homepage", function (req, res) {
      res.render("homepage.html")
    });

    app.get("/mood_tracker", function (req, res) {
      res.render("mood_tracker.html")
    });

    app.get("/journal", function (req, res) {
      res.render("journal.html");
    });
    
    app.get("/signIn", function (req, res) {
      res.render('signIn.html');
    });

    app.post("/signIn", function(req,res){
      res.render("signIn.html");
    });

    //saving sign-up to database

    app.post('/sign_up', function (req, res) {
    
      admin
          .auth()
          .createUser({
            "email" : req.body.email,
            "password" : req.body.password
          })
          .then((userData) => {
            
           signUpRef.push().set({
              "userID": userData.uid,
              "name" : req.body.name,
              "email" : req.body.email,
              "password" : req.body.password,
              "username" : req.body.user_name,
              "birthday" : req.body.birthday,
              "gender" : req.body.gender,
              "phone_number" : req.body.phone_number,
              "educational_level" : req.body.educational_level,
              "school" : req.body.school
             
          });
          res.render("signIn.html");
        })
        .catch((error) => {
            // console.log('Error creating userr:',error);
            var errorCode = error.code;
            var err = error.message;
            console.log(errorCode)
            console.log(err)
            res.send({err: err });
        });
      
    });

    app.all("*", (req, res, next) => {
      res.cookie("XSRF-TOKEN");
      next();
    });
    
    app.get("/profile", function (req, res) {
      const sessionCookie = req.cookies.session || "";
    
      admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then((userData) => {
          req.cookies.userID = userData.uid;
          console.log("uid: " + userData.uid);
          console.log("Test: " + req.cookies.userID);
          console.log("Logged in:", userData.email);
          res.render("profile.html");
        })
        .catch((error) => {
          res.redirect("/signIn");
        });
    });
    
    app.get("/", function (req, res) {
      res.render("index.html");
    });
    
    app.post("/sessionLogin", (req, res,next) => {
      const idToken = req.body.idToken.toString();
    
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
      admin
        .auth()
        .createSessionCookie(idToken, { expiresIn })
        .then((sessionCookie) => {
            const options = { maxAge: expiresIn, httpOnly: true };
            res.cookie("session", sessionCookie, options);
            res.end(JSON.stringify({ status: "success" }));
          },
          // (error) => {
          //   res.status(401).send("UNAUTHORIZED REQUEST!");
          // }
          )
    });
    
    app.get("/sessionLogout", (req, res) => {
      res.clearCookie("session");
      res.redirect("/signIn");
    });
  
}

module.exports = function (app) {

    var fs = require('fs');
    var admin = require('firebase-admin');
    var firebaseRef = db.ref("main");
    var signUpRef = firebaseRef.child("sign-up");
    var signInRef = firebaseRef.child("sign-in");
  


    app.get("/", function (req, res) {
      
      // Example write
      /*
      usersRef.set({
        0: {
          "username" : "john1",
          "password" : "asdf23radvv",
          "full_name" : "John Malkovich",
          "email" : "test123@gmail.com"
        }
      });

      journalRef.set({
        0:{
          "userID" : 0,
          "date_added" : Date(),
          "content" : "Hello Journal"
        }
      });
      **/
    
      res.render("signIn.html");
    });

    app.get("/mood_tracker", function (req, res) {
      res.render("mood_tracker.html")
    });

    app.get("/journal", function (req, res) {
      render("journal.html");
    });

    // app.all("*", (req, res, next) => {
    //   res.cookie("XSRF-TOKEN", req.csrfToken());
    //   next();
    // });
    
    app.get("/signIn", function (req, res) {
      res.render('signIn.html');
    });

  //   app.post("/sign_in", function (req, res) {

  //     admin
  //     .auth()
  //     .signInWithEmailAndPassword({
  //      "email" : req.body.email,
  //      "password" : req.body.password
  //     })
  //     .then(function () {
  //       admin.auth().currentUser.getIdToken(true).then(function(idToken){
  //              res.send(idToken)
  //              res.end()
  //           }).catch(function (error) {
  //               //Handle error
  //           });
  //  }).catch(function (error) {
  //        //Handle error
  //  });
  //     // .then(({ user }) => {
  //     //   console.log(user);
  //     //   return user.getIdToken()
  //     // })
  //     res.render('profile.html');

  //   });

  // app.post('/sign_in', async(req, res) => {
  //   const {email, password} = req.body;
  //   admin
  //   .auth()
  //   .signInWithEmailAndPassword(email, password)
  //   .then((userCredential) => {
  //   var user = userCredential.user;
  //   })
  //   .catch((error) => {
  //   var errorCode = error.code;
  //   var errorMessage = error.message;
  //   });
  //   res.render('profile.html');
  //   })
  
  //   app.get("/signUp", function (req, res) {
  //     res.render("signUp.html");
  //   });
    
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
              "email" : req.body.email,
              "password" : req.body.password,
              "username" : req.body.user_name,
              "age" : req.body.age,
              "gender" : req.body.gender,
              "phone_number" : req.body.phone_number,
              "educational_level" : req.body.educational_level,
              "school" : req.body.school

          });
        })
        // .then(({ user }) => {
        //   console.log(user);
        //   return user.getIdToken()
        // })
        .catch((error) => {
            console.log('Error creating userr:',error);
        });
        res.render("signIn.html");
    });

    app.get("/profile", function (req, res) {
      res.render("profile.html");
    })
    
    app.get("/profile", function (req, res) {
      const sessionCookie = req.cookies.session || "";
    
      admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then((userData) => {
          console.log("Logged in:", userData.email)
          res.render("profile.html");
        })
        .catch((error) => {
          res.redirect("/signIn");
        });
    });
    
    app.get("/", function (req, res) {
      // res.clearCookie("__session");
      res.render("index.html");
    });
    
    app.post("/sessionLogin", (req, res) => {
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
          (error) => {
            res.status(401).send("UNAUTHORIZED REQUEST!");
          }
        );
    });
    
    app.get("/sessionLogout", (req, res) => {
      res.clearCookie("session");
      res.redirect("/signIn");
    });
    
}

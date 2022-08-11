module.exports = function (app) {
  var fs = require("fs");
  var admin = require("firebase-admin");
  var firebaseRef = db.ref("main");
  var usersRef = firebaseRef.child("users");
  var journalRef = firebaseRef.child("journal");
  var signUpRef = firebaseRef.child("sign-up");
  var signInRef = firebaseRef.child("sign-in");

  var DateUtil = require("js/dateUtil.js");
  var dateUtil = new DateUtil();

  var tipsRef = firebaseRef.child("tips");

  app.get("/", function (req, res) {
    tipsRef
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          var tips = snapshot.val();
          console.log(tips);
          res.render("homepage.html", { tipsData: tips });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });

  app.get("/mood_tracker", function (req, res) {});

  app.get("/journal", function (req, res) {
    var userID = 0;
    // variable to check if user has entered their daily journal
    var isDailyEntryDone = false;
    // variable containing the date of the latest journal
    var latestDate = "";
    // array containing all previously user entered journals
    var userJournalEntries = [];
    // array containing all day numbers for all user entered journal
    var dayNums = [];

    journalRef
      .child(userID)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          let journalDataObj = JSON.parse(JSON.stringify(snapshot.val()));
          for (let i in journalDataObj) {
            userJournalEntries.push(journalDataObj[i]);
            dayNums.push(parseInt(journalDataObj[i].dayNum));
          }

          // sort entries in descending order
          userJournalEntries.sort(function (a, b) {
            return b.dayNum - a.dayNum;
          });

          // get latest date by getting object with the latest dayNum
          var maxDayNum = Math.max(...dayNums);
          for (let i in userJournalEntries) {
            if (userJournalEntries[i].dayNum === maxDayNum) {
              latestDate = userJournalEntries[i].dateAdded;
              break;
            }
          }

          // check if daily journal has been added for today,
          // by checking if the latest journal entry date is today
          isDailyEntryDone = dateUtil.isDateToday(latestDate);

          res.render("journal.html", {
            userJournalEntriesData: userJournalEntries,
            dailyEntryDone: isDailyEntryDone,
            latestDayNum: maxDayNum,
          });
        } else {
          console.log("No data available");
          res.render("journal.html", { latestDayNum: 0 });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });

  app.post("/addjournalentry", function (req, res) {
    var userID = 0;

    journalRef
      .child(userID)
      .push()
      .set(
        {
          userID: userID,
          dateAdded: dateUtil.formatDate(Date()),
          content: req.body.journalContent,
          dayNum: parseInt(req.body.dayNum),
        },
        (error) => {
          if (error) {
            console.error(error);
            res.render("homepage.html");
          }
        }
      );

    res.render("homepage.html");
  });

  app.post("/editjournalentry", function (req, res) {
    var userID = 0;

    journalRef
      .child(userID)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          let journalDataObj = JSON.parse(JSON.stringify(snapshot.val()));
          var keys = Object.keys(journalDataObj);

          for (let i in journalDataObj) {
            if (journalDataObj[i].dayNum == req.body.dayNum) {
              journalRef
                .child(userID)
                .child(i)
                .set({
                  userID: userID,
                  dateAdded: req.body.dateAdded,
                  content: req.body.journalContent,
                  dayNum: parseInt(req.body.dayNum),
                });

              res.render("homepage.html");
            }
          }
        } else {
          console.log("something went wrong");
          res.render("homepage.html");
        }
      })
      .catch((error) => {
        console.error(error);
        res.render("homepage.html");
      });
  });

  ///////////////////////////////////////////////////////SIGN IN AND SIGN UP///////////////////////////////////////////////////////////////////////////
  app.get("/signIn", function (req, res) {
    res.render("signIn.html");
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

  app.post("/sign_up", function (req, res) {
    admin
      .auth()
      .createUser({
        email: req.body.email,
        password: req.body.password,
      })
      .then((userData) => {
        signUpRef.push().set({
          userID: userData.uid,
          email: req.body.email,
          password: req.body.password,
          username: req.body.user_name,
          age: req.body.age,
          gender: req.body.gender,
          phone_number: req.body.phone_number,
          educational_level: req.body.educational_level,
          school: req.body.school,
        });
      })
      // .then(({ user }) => {
      //   console.log(user);
      //   return user.getIdToken()
      // })
      .catch((error) => {
        console.log("Error creating userr:", error);
      });
    res.render("signIn.html");
  });

  ////////////////////////////////////////////////SESSION, LOG-IN//////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.get("/profile", function (req, res) {
    res.render("profile.html");
  });

  app.get("/profile", function (req, res) {
    const sessionCookie = req.cookies.session || "";

    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((userData) => {
        console.log("Logged in:", userData.email);
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
      .then(
        (sessionCookie) => {
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

  app.get("/tips", function (req, res) {
    tipsRef
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          var tips = snapshot.val();
          console.log(tips);
          res.render("tips.html", { tipsData: tips });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
  
  app.get("/profile", function (req, res) {
    var userID = 0;

    usersRef
      .child(userID)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());

          var name = snapshot.child("full_name").val();
          var email = snapshot.child("email").val();
          var username = snapshot.child("username").val();
          var password = snapshot.child("password").val();
          // var age = snapshot.child("age").val();
          // var educational_level = snapshot.child("educational_level").val();
          // var gender = snapshot.child("gender").val();
          // var phone_number = snapshot.child("phone_number").val();
          // var school = snapshot.child("school").val();

          res.render("profile.html", {
            userFullName: name,
            userEmail: email,
            userUsername: username,
            userPassword: password,
            // userAge: age,
            // userEducationalLevel: educational_level,
            // userGender: gender,
            // userPhoneNumber: phone_number,
            // userSchool: school
          });
        } else {
          console.log("No data available");
          res.render("homepage.html");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });

};

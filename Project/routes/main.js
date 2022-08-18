module.exports = function (app) {
  var fs = require("fs");
  var admin = require("firebase-admin");
  var firebaseRef = db.ref("main");
  
  var timeAgo = require('node-time-ago');
  
  var usersRef = firebaseRef.child("users");
  var journalRef = firebaseRef.child("journal");
  var signUpRef = firebaseRef.child("sign-up");
  var signInRef = firebaseRef.child("sign-in");
  var moodRef = firebaseRef.child("mood_tracker");
  var forumRef = firebaseRef.child("forum");
  var signUpRef = firebaseRef.child("sign-up");

  var DateUtil = require("./util/dateUtil.js");
  var dateUtil = new DateUtil();

  var tipsRef = firebaseRef.child("tips");

  app.get("/", function (req, res) {
    var forumListRef = forumRef;
    var forumList = [];
    
    forumListRef.on('value', (data) => {
      data.forEach(function (snapshot) {
        forumList.push(snapshot.val());
      })
    });
    
    res.render("homepage.html", { forumItem: forumList });
  });

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
            res.redirect("/");
          }
        }
      );

      res.redirect("journal");
  });

  app.post("/editjournalentry", function (req, res) {
    var userID = 0;

    journalRef
      .child(userID)
      .get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          let journalDataObj = JSON.parse(JSON.stringify(snapshot.val()));

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

                res.redirect("journal");
            }
          }
        } else {
          console.log("something went wrong");
          res.redirect("/");
        }
      })
      .catch((error) => {
        console.error(error);
        res.redirect("/");
      });
  });

  ///////////////////////////////////////////////////////SIGN IN AND SIGN UP///////////////////////////////////////////////////////////////////////////
   app.get("/", function (req, res) {
      res.render("signIn.html"); 
    });

    app.get("/mood_tracker", function (req, res) {
      res.render("mood_tracker.html")
    });

    app.get("/journal", function (req, res) {
      render("journal.html");
    });
    
    app.get("/signIn", function (req, res) {
      res.render('signIn.html');
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

        
        })
        .catch((error) => {
            console.log('Error creating userr:',error);
        });
        res.render("signIn.html");
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
          console.log("Logged in:", userData.email)
          res.render("profile.html");
        })
        .catch((error) => {
          res.redirect("/signIn");
        });
    });
    
    app.get("/", function (req, res) {
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
  /////////////////////////////////////////////////////// TIPS ///////////////////////////////////////////////////////////////////////////
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
    var userID = "tEkSAGudKTNPYDfprPdKWu2WSgH3";

    signupRef.get().then((snapshot) => {
      if(snapshot.exists()) {
        let signUpObj = JSON.parse(JSON.stringify(snapshot.val()));
        var IDvariable;

        for(let profileID in signUpObj) {
          if(signUpObj[profileID].userID === userID) {
            IDvariable = profileID;

            var name = signUpObj[profileID].name;
            var email = signUpObj[profileID].email;
            var username = signUpObj[profileID].username;
            var password = signUpObj[profileID].password;
            var age = signUpObj[profileID].age;
            var educational_level = signUpObj[profileID].educational_level;
            var gender = signUpObj[profileID].gender;
            var phone_number = signUpObj[profileID].phone_number;
            var school = signUpObj[profileID].school;

            res.render("profile.html", {
              userFullName: name,
              userEmail: email,
              userUsername: username,
              userPassword: password,
              userAge: age,
              userEducationalLevel: educational_level,
              userGender: gender,
              userPhoneNumber: phone_number,
              userSchool: school
            });
          } else {
            console.log("No users available");
          }  
        }
      }
    }).catch((error) => {
      console.error(error);
    });
  });
  
  app.get("/topNav", function (req, res) {
    res.render("topNav.html", {
      title: "Dynamic title"
    });
  });

  app.get("/forumNav", function (req, res) {
    res.render("forum_nav.html", {
      title: "Dynamic title"
    });
  });

  //ROUTE DIRECT TO EACH FORUM || GET FORUM ITEMS
  app.get("/eachForum", function (req, res) {
    var forumId = req.query.forumId;
    var forumDataRef = forumRef;

    forumDataRef.child(forumId).once('value')
      .then((querySnapshot) => {
        if (!querySnapshot.numChildren()) { 
          throw new Error('expected at least one result');
        }
        
        if (!querySnapshot.exists()) { 
          throw new Error(`Entry ${forumId} not found.`);
        }

        var forumTitle = querySnapshot.val().forumTitle;
        var currentTime = querySnapshot.val().currentTime;
        var numOfLikes = querySnapshot.val().numOfLikes;
        var numOfReplies = querySnapshot.val().numOfReplies;
        var numOfViews = querySnapshot.val().numOfViews;                         
        var forumContent = querySnapshot.val().forumContent;
        var uploader = querySnapshot.val().username;
       
        let timePast = timeAgo(currentTime);
   
        var viewCount = numOfViews;
        updatedViewCount = viewCount + 1;
        var ref = forumRef.child(forumId);
         
        ref.update({
            numOfViews: updatedViewCount   
        });

        var repliesRef = forumRef.child(forumId).child("forumReplies");
        var replyPost = repliesRef;
        var forum_replies = [];
        

        replyPost.on('value', (data) => {
          data.forEach(function (snapshot) {
            forum_replies.push(snapshot.val());
          })
        });
        console.log(replyPost);
        res.render("eachForum.html", {replyPosts: forum_replies, forumId: forumId, forumTitle:forumTitle, uploader: uploader, currentTime:timePast, numOfLikes:numOfLikes,numOfReplies:numOfReplies,forumContent:forumContent, numOfViews: numOfViews});
      })
      .catch((error) => {
        console.log("Unexpected error:", error);
      })

  });

  //ADD REPLY TO FIREBASE
  app.post("/addReply", function (req, res) {
    username = "user 1";
    forumId = req.body.forumId;
    reply = req.body.userReply;
    let currentTime = new Date();
    let timePast = timeAgo(currentTime);

      
    var ref = forumRef.child(forumId).child("forumReplies"); 
    var newforumList = ref.push();
    newforumList.set({ 
      forumReplyId: newforumList.key,
      username: "user 1",
      reply: reply,
      currentTime: timePast
    });

    var forumListRef = ref;
    var forum_replies = [];
    

    forumListRef.on('value', (data) => { 
      data.forEach(function (snapshot) {
        forum_replies.push(snapshot.val());
      })
    });

    var forumDataRef = forumRef;
    forumDataRef.child(forumId).once('value')
      .then((querySnapshot) => {
        if (!querySnapshot.numChildren()) { // handle rare no-results case
          throw new Error('expected at least one result');
        }
        if (!querySnapshot.exists()) { // value may be null, meaning idToFind doesn't exist
          throw new Error(`Entry ${forumId} not found.`);
        }
        var numOfReplies = querySnapshot.val().numOfReplies;
   
        var repliesCount = numOfReplies;
        updated_replies_count = repliesCount + 1;
        var forum_post_ref = forumRef.child(forumId);
         
        forum_post_ref.update({
            numOfReplies:  updated_replies_count   
        });

        res.redirect('back');
      })
  });

    //ROUTE DIRECT TO FORUM MAIN PAGE ||GET ALL DATA FROM DB TO DISPLAY
    app.get("/forum_mainpage", function (req, res) {
      var forumListRef = forumRef;
      var forumList = [];

      forumListRef.on('value', (data) => {
        data.forEach(function (snapshot) {
          forumList.push(snapshot.val());
        })
      });

      res.render("forumpage.html", {
        title: "Dynamic title", forumItem: forumList
      });
    });

    //ADD FORUM ITEMS INTO FIREBASE
    app.post("/addForumItem", function (req, res) {
      username = "user 1";
      forumTitle = req.body.forum_name;
      forumContent = req.body.forum_content;
      numOfLikes = 0;
      numOfViews = 0;
      numOfReplies = 0;
      currentTime = new Date();
      var newforumList = forumRef.push();
      newforumList.set({ 
        forumId: newforumList.key,
        username: "user 1",
        forumTitle: req.body.forum_name,
        forumContent: req.body.forum_content,
        numOfLikes: 0,
        numOfViews: 0,
        numOfReplies: 0,
        currentTime: Date()
      });
      console.log(newforumList.key)

      var forumListRef = forumRef;
      var forumList = [];

      forumListRef.on('value', (data) => {
        data.forEach(function (snapshot) {
          forumList.push(snapshot.val());
        })
      });

      res.redirect('back');
    });

    //REGISTER
    app.post('/registerUser', function (req, res, next) {
      var email = req.body.email;
      var password = req.body.password;

      admin
        .auth()
        .createUser({
          email: email,
          password: password,
        })
        .then((userRecord) => {
          console.log('Successfully created new user:', userRecord.uid);
          signUpRef.push().set({
            "userID": userRecord.uid,
            "email": email,
          });
        })
        .catch((error) => {
          console.log('Error creating new user:', error);
        });
    });
  
    
    //-----mood_tracker-----
    //insert happy mood
    app.get("/happy", function (req, res) {
      console.log("mood = happy")
      username = "user 1";
      mood = "happy";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists();          //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
            if (a == true) {
                userMood.set({     
                    username: "user 1",
                    mood: mood,
                    currentTime: currentDate
                });
            } else if (a == false) {
                userMood.set({     
                    username: "user 1",
                    mood: mood,
                    currentTime: currentDate
                });
            } else {
              console.log("error adding mood")
            }
          });
      res.redirect('back');
    });


    //insert mad mood
    app.get("/mad", function (req, res) {
      console.log("mood = mad")
      username = "user 1";
      mood = "mad";
    
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists(); //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
            if (a == true) {
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate     
              });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate
              });
            } else {
              console.log("error adding mood")
            }
          
        });
      res.redirect('back');
    });

    //insert sad mood   
    app.get("/sad", function (req, res) {
      console.log("mood = sad")
      username = "user 1";
      mood = "sad";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists(); //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
          console.log(a);
            if (a == true) {       
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate   
            });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate     
              });
            } else {
              console.log("error adding mood")
            }
          });
      res.redirect('back');
    });

    //insert cool mood 
    app.get("/cool", function (req, res) {
      console.log("mood = cool")
      username = "user 1";
      mood = "cool";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear();
      let currentDate = date + + month + year;
      
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists(); //-- when query is empty -- false || when query is not empty -- true
            if (a == true) {
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate             
            });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate 
              });
            } else {
              console.log("error adding mood")
            }
          });
      
      res.redirect('back');
    });

    //route to mood_tracker || insert neutral moods to display on the html calendar
    app.get("/neutral", function (req, res) {
      console.log("mood = neutral")
      username = "user 1";
      mood = "neutral";
      
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear(); 
      let currentDate = date + + month + year;
      
      var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
        .then((querySnapshot) => {
          var a = querySnapshot.exists();//-- when query is empty -- false || when query is not empty -- true
            if (a == true) {              
              userMood.set({     
                username: "user 1",
                mood: mood,
                currentTime: currentDate              
            });
            } else if (a == false) {
              userMood.set({     
                  username: "user 1",
                  mood: mood,
                  currentTime: currentDate                
              });
            } else {
              console.log("error adding mood")
            }
        });
      
      res.redirect('back');
    });
      

    //insert getting mood 
    app.get("/mood_tracker", function (req, res) {
      username = "user 1";     
      currentTime = new Date();
      let date = ("0" + currentTime.getDate()).slice(-2);
      let month = ("0" + (currentTime.getMonth() + 1)).slice(-2);
      let year = currentTime.getFullYear(); 
      let currentDate = date + + month + year;

      /* var userMood = moodRef.child(username).child(currentDate).child("today_mood");
      userMood.once('value') 
      .then((querySnapshot) => {
        //querySnapshot.exists(); -- when query is empty -- false || when query is not empty -- true
        var a = querySnapshot.exists();
        console.log(a);

          if (a == true) {
            
            userMood.once('value')
              .then((querySnapshot) => {
                if (!querySnapshot.numChildren()) {
                  var today_mood = "empty";
                }
                if (!querySnapshot.exists()) {
                  var today_mood = "empty";
                }
                var today_mood = querySnapshot.val().mood;
                console.log("mood today is " + today_mood);

                // retrieve all user 

                res.render("mood_tracker.html", {
                  title: "Dynamic title",
                  today_mood : today_mood
                });
              });
          } else if (a == false) {
            var today_mood = "empty";
                console.log("mood today is " + today_mood);  

                res.render("mood_tracker.html", {
                  title: "Dynamic title", today_mood : today_mood
                });
          } else {
            console.log("error adding mood")
          }
      }); */

      var today_mood = "empty";

      moodRef.child(username).get().then((snapshot) => {
        if(snapshot.exists()) {

          let moodDataObj = JSON.stringify(snapshot.val());
          moodDataObj = JSON.parse(moodDataObj);

          var prev_moods = {};

          for(let i in moodDataObj) {
            
            if(i != currentDate) {
              prev_moods[i] = moodDataObj[i].today_mood.mood;
            }
            else {
              var moodObj = moodDataObj[i].today_mood;
              today_mood = moodObj.mood;
            }
          }

          res.render("mood_tracker.html", {
            title: "Dynamic title", 
            today_mood : today_mood,
            prev_moods : prev_moods
          });

        }
        else {
          console.log("no data available");
          res.redirect("/");
        }
      })
      .catch((error) => {
        console.error(error);
        res.redirect("/");
      });
      
      
    });

};

module.exports = function (app) {

  var firebaseRef = db.ref("main");
  var usersRef = firebaseRef.child("users");
  var journalRef = firebaseRef.child("journal");

  var DateUtil = require("./util/dateUtil.js");
  var dateUtil = new DateUtil();


  app.get("/", function (req, res) {
    
    
    res.render("homepage.html");
  });

  app.get("/mood_tracker", function (req, res) {
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

    journalRef.child(userID).get().then((snapshot) => {
      if (snapshot.exists()) {

        let journalDataObj = JSON.parse(JSON.stringify(snapshot.val()));
        for(let i in journalDataObj) {
          userJournalEntries.push(journalDataObj[i]);
          dayNums.push(parseInt(journalDataObj[i].dayNum));
        }

        // sort entries in descending order
        userJournalEntries.sort(function(a,b) {
          return b.dayNum - a.dayNum;
        });


        // get latest date by getting object with the latest dayNum
        var maxDayNum = Math.max(...dayNums);
        for(let i in userJournalEntries) {
          if(userJournalEntries[i].dayNum === maxDayNum) {
            latestDate = userJournalEntries[i].dateAdded;
            break;
          }
        }

        // check if daily journal has been added for today,
        // by checking if the latest journal entry date is today
        isDailyEntryDone = dateUtil.isDateToday(latestDate);
        
        res.render("journal.html", {
          userJournalEntriesData : userJournalEntries, 
          dailyEntryDone : isDailyEntryDone,
          latestDayNum : maxDayNum
        });
      } else {
        console.log("No data available");
        res.render("journal.html", {latestDayNum : 0});
      }
    }).catch((error) => {
      console.error(error);
    });

    
  });

  app.post("/addjournalentry", function (req, res) {

    var userID = 0;

    journalRef.child(userID).push().set({
      "userID" : userID,
      "dateAdded" : dateUtil.formatDate(Date()),
      "content" : req.body.journalContent,
      "dayNum" : parseInt(req.body.dayNum)
    }, (error) => {
      if (error) {
        console.error(error);
        res.render("homepage.html");
      }
    });

    res.render("homepage.html");

  });

  app.post("/editjournalentry", function (req, res) {

    var userID = 0;

    journalRef.child(userID).get().then((snapshot) => {
      if (snapshot.exists()) {

        let journalDataObj = JSON.parse(JSON.stringify(snapshot.val()));
        var keys = Object.keys(journalDataObj);

        for(let i in journalDataObj) {
          if(journalDataObj[i].dayNum == req.body.dayNum) {
            journalRef.child(userID).child(i).set({
              "userID": userID,
              "dateAdded": req.body.dateAdded,
              "content": req.body.journalContent,
              "dayNum": parseInt(req.body.dayNum)
            });

            res.render("homepage.html");
          }
        }
        
      } else {
        console.log("something went wrong");
        res.render("homepage.html");
      }
    }).catch((error) => {
      console.error(error);
      res.render("homepage.html");
    });
  });
}
module.exports = function (app) {

    var fs = require('fs');

    var firebaseRef = db.ref("main");
    var usersRef = firebaseRef.child("users");
    var journalRef = firebaseRef.child("journal");

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
      res.render("homepage.html");
    });

    app.get("/mood_tracker", function (req, res) {

      var user_data, mood_tracker_data;

      user_data = JSON.parse(fs.readFileSync('./sample_data/sample-user.json'));
      mood_tracker_data = JSON.parse(fs.readFileSync('./sample_data/sample-mood-tracker.json'));

      console.log(user_data);
      console.log(mood_tracker_data);

      res.render("mood_tracker.html", {moodTracker : mood_tracker_data})
    });

    app.get("/journal", function (req, res) {

      // Example retrieve data
      /*
      usersRef.child(0).get().then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
      **/

      // Get users journal entries
      //journalRef.orderBy("userID")

      res.render("journal.html");
    });

    //app.post()
}
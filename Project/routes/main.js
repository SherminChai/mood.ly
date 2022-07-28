module.exports = function (app) {

    var fs = require('fs');

    var firebaseRef = db.ref("main");

    var usersRef = firebaseRef.child("users");

    app.get("/", function (req, res) {
      
      // Example
      /*
      usersRef.set({
        john1: {
          "id" : 1,
          "username" : "John",
          "password" : "asdf23radvv",
          "email" : "test123@gmail.com"
        }
      });
      **/

      res.render("homepage.html");
    });

    app.get("/mood-tracker", function (req, res) {

      var user_data, mood_tracker_data;

      user_data = JSON.parse(fs.readFileSync('./sample_data/sample-user.json'));
      mood_tracker_data = JSON.parse(fs.readFileSync('./sample_data/sample-mood-tracker.json'));

      console.log(user_data);
      console.log(mood_tracker_data);

      res.render("mood-tracker.html", {moodTracker : mood_tracker_data})
    });
}
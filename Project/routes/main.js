module.exports = function (app) {
  var firebaseRef = db.ref("main");
  var usersRef = firebaseRef.child("users");
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

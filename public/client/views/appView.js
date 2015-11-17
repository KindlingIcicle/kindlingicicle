var appView = Backbone.View.extend({

  //the appView will be anchored on to the div tag with class 'mainAppView' on the index.html
  el: '.mainAppView',

  // -------------------------------------------------------------
  // EXPERIMENTAL FEATURE: USER-SUBMITTED WEBHOOK CREATION
  // Display form for user to submit a new webhook
  // -------------------------------------------------------------
  formToPickRepo : _.template(
    '<form>\
      <input class = "getUserName" placeholder="User_name"><br>\
      <input class = "getRepoName" placeholder="Repo_name"><br>\
      <button class = "pickRepoButton">tune into repo</button>\
    </form>'
    ),

  initialize : function () {
    //create the eventListView to manage all the events as soon as the appView is instantiated:
    this.eventListView = new eventListView({collection : this.model.get("eventList")});
    this.render();
    var mainAppView = this;
    $('.switchMode').on('click', function(){
      mainAppView.model.audioLibChange();
    });

  // --------------------------------------------------------------------------
  // EXPERIMENTAL FEATURE: USER-SUBMITTED WEBHOOK CREATION
  // Ajax request to users database, then to Github to register hook.
  // This works (!), with some suggested improvements below:
  //
  // Note 1: You must first manually navigate to '/auth/github' to
  // create OAuth token. Suggestion: this should be done automatically for user.
  //
  // Note 2: Change the url in 'jsonObj' to the host of your app. This
  // is currently set to an 'ngrok' locally-hosted app. An issue
  // with current implementation is that each user is "listening"
  // to the same callback URL (so each new hook will be heard by all users).
  // Suggestion: create a unique callback url for each user, and redirect
  // user to their specific unique url upon log-in
  //
  // --------------------------------------------------------------------------

    var jsonObj = {
     "name": "web",
     "active": true,
     "events": [
       "*",
     ],
     "config": {
       "url": "http://9567e799.ngrok.io/githubCallbackURL",
       "content_type": "json"
     }
   };

   var access_token;

    $('.pickRepoButton').on('click', function(event){
      event.preventDefault();
      var userName = $('.getUserName').val();
      var repoName = $('.getRepoName').val();
      
      // Outer request: grab the user's oauth token from our database
      $.ajax({
      url: 'http://9567e799.ngrok.io/api/users/' + userName,
      method: 'GET',
      success: function (data) {
        access_token = data.token;

        // Inner request: register a new webhook with Github
        $.ajax({
          url: "https://api.github.com/repos/" + userName + "/" + repoName+"/hooks?access_token=" + access_token,
          method: 'POST',
          data: JSON.stringify(jsonObj),
          success : function(data){
            console.log('we got the respond from github:', data);
            $('.getUserName').val('');
            $('.getRepoName').val('');
          },
          error : function(data){
            console.log(data);
            $('.getUserName').val('Ouch!');
            $('.getRepoName').val('That didn\'t work, buddy');
          }
        }).done(function(data) {
          console.log('got it',data);
        });


      },
      error: function (data) {
        console.log("error");
      }
      });

    });
  },

  render : function(){

    // -------------------------------------------------------------
    // EXPERIMENTAL FEATURE: USER-SUBMITTED WEBHOOK CREATION
    // Display the hook creation form
    // -------------------------------------------------------------
    this.$el.append(this.formToPickRepo());

    //append the eventListView to the div tag with class = "mainAppView";
    this.$el.append(this.eventListView.$el);
  }

});

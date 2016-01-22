if (Meteor.isClient) {
  // This code only runs on the client
  Template.home.helpers({
    tasks: function () {

      var currentList = this._id;

       // Show newest tasks at the top
      return Tasks.find({listId: currentList}, {sort: {createdAt: -1}});
    }
  });
}



 
if (Meteor.isClient) {

  //Subscriptions to Published collections

  Meteor.subscribe('lists');

  Meteor.subscribe('tasks');

  // This code only runs on the client
  Template.tasksView.helpers({
    tasks: function () {
      //return Tasks.find({});

      var currentList = this._id;

      // Only return tasks which match the currentList uniqueID
      return Tasks.find({listId: currentList}, {sort: {createdAt:-1} });
    }
  });


    Template.tasksView.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var text = event.target.text.value;

      // defining currentuser
      var currentUser = Meteor.userId();

      // Create variable for tasksView
      var tasksView = $('[name="tasksView]').val();

      // set variable of current list to be unique ID of current view
      var currentList = this._id;


      var listName = $('[name=listName]').val();
 
      // Insert a task into the collection
     /* Tasks.insert({
        text: text,
        completed: false,
        createdAt: new Date(), // current time
        createdBy: currentUser,
        listId: currentList
      }); */
 
      // Clear form
      event.target.text.value = "";

      //console log test to see whats happening
      console.log('something got inserted!');
      

      //Meteor Call to server
      Meteor.call('addTask', text, currentList);
    }
  });


      Template.task.events({
    "click .toggle-checked": function () {
      Meteor.call('setChecked', this._id, this.checked);

      // Set the checked property to the opposite of its current value
      /* Tasks.update(this._id, {
        $set: {checked: ! this.checked}
      }); */ 
    },

    "click .delete": function () {

      Meteor.call('deleteTask', this._id);
      /*Tasks.remove(this._id); */
    }

/*
    'keyup [name='text']': function(event) {
        if(event.which == 13 || event.which == 27){
        $(event.target).blur();
    } else {
        var documentId = this._id;
        var todoItem = $(event.target).val();
        Meteor.call('updateListItem', documentId, todoItem);
    }
    } */ 

  });




      Template.addList.events({
    'submit form': function(event){
      event.preventDefault();
      var listName = $('[name=listName]').val();

      //adding in currentUser
      var currentUser = Meteor.userId();

      // Connection to serverside script createNewList
      Meteor.call('createNewList', listName);

     
     /* Lists.insert({
          name: listName,
          createdBy: currentUser
      }); */


      // Detect when error has occured and define logic that responds to that error
      // Retrieve ID of newly created Document
     /* function (error,results) {
        Router.go( 'listPage', {_id: results});
      } */

      
      $('[name=listName]').val('');
    }
});


Template.lists.helpers({
    'list': function(){
        var currentUser = Meteor.userId();
        return Lists.find({}, {sort: {name: 1}});
    }
});



// When you're free, add in the todo count function 


// Registration form
/*Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
            email: email,
            password: password
        }, function(error) {

          if (error) {
            console.log(error.reason); //output error in console
          } 

          else {
            Router.go('home'); //redirect user if reg is successful
          }

        });
    }
}); */


// Login form
/*Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function (error) {
          if (error) {
            console.log(error.reason);
          }

          else {
            var currentRoute = Router.current().route.getName();

            if (currentRoute == 'login') {
            Router.go('home');
          }
        }

          
        });
    }
}); */

// Logout 
Template.navigation.events({
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
        Router.go('login');
    }
});



/* Form Validation */
Template.login.onRendered(function(){
    $('.login').validate({
        submitHandler: function(event){
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();


            Meteor.loginWithPassword(email, password, function(error){
                if(error){

                  if(error.reason == "Incorrect password.") {
                    validator.showErrors ({
                      password: "Incorrect Password!"
                    });
                  }
                    //console.log(error.reason);

                } else {
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute == "login"){
                        Router.go("home");
                    }
                }
            });
        }
    });
});


Template.register.onRendered(function(){
      var validator = $('.register').validate({ 
        submitHandler: function(event){
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password
            }, function(error){
                if(error){
                  if(error.reason == "Email already exists."){
                    validator.showErrors({
                    email: "That email already belongs to a registered user."   
        });
    }
}else {
                    Router.go("home");
                }
            });
        }    
    });
});


/* Set Defaults Validator */
$.validator.setDefaults({
        rules: {
        email: {
          required: true,
          email: true
        },

        password: {
          required: true,
          minlength: 6
        }

      },

        messages: {
        email: {
            required: "You must enter an email address.",
            email: "You've entered an invalid email address."
        },

        password: {
            required: "You must enter a password.",
            minlength: "Your password must be at least {0} characters."
        }
    }


});

}

Tasks = new Mongo.Collection("tasks");
Lists = new Mongo.Collection("lists");

Router.configure ({
  layoutTemplate: 'main'
  /* loadingTemplate: 'loading' */
});

Router.route('/', function () {
  this.render('home');
}, {
  name: 'home'
});

Router.route('/register'), {
  name: 'register',
  template: 'register'
};

Router.route('/login'), {
  name: 'login',
  template: 'login'
};

Router.route('/list/:_id', {
    name: 'listPage',
    template: 'listPage',

    data: function(){
        var currentList = this.params._id;
        return Lists.findOne({ _id: currentList });
    },

    //Executed before route renders
    onBeforeAction: function() {
      var currentUser = Meteor.userId();
      if (currentUser) {
        this.next();
      } else {
        this.render('login');
      }
    },


    // Subscription to Lists Collection

    waitOn: function() {
      var currentList = this.params._id;
      return Meteor.subscribe('tasks', currentList);
    }

});



if (Meteor.isServer) {

  Meteor.publish('lists', function() { 
    var currentUser = this.userId;
    return Lists.find({ createdBy: currentUser });
  });


// currentlist as a parameter to ensure that function is only retrieving
// data from list viewed 
  Meteor.publish('tasks', function(currentList) { 
    var currentUser = this.userId;
    var currentList = this._Id;
    return Tasks.find({ createdBy: currentUser, listId: currentList});
  });



// Inserting, Updating and Remove functions should be server side for security purposes
  Meteor.methods ({
    // Create new list function 
    'createNewList': function(listName){
      var currentUser = Meteor.userId();

            var listName = $('[name=listName]').val();

              if (listName === "" ) {
                function defaultName (currentUser) {
                  var nextLetter = 'A';

                  var nextName = 'List ' + nextLetter;

                  while (Lists.findOne ({ name:nextName, createdBy: currentUser}))
                    { 
                      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
                      nextName = 'List ' + nextLetter;
                    }

                    return nextName;
                }
              }

              check(listName, String);

      var data = {
        name: listName,
        createdBy: currentUser
      };


      if(!currentUser) {
        throw new Meteor.error("not-logged-in", "you're not logged in");
      }
   
      Lists.insert (data);
    },



    'addTask': function(text, currentList) {

        var currentUser = Meteor.userId();
        var currentList = this._id; 

      // Create variable for tasksView
      //var tasksView = $('[name="tasksView]').val();

        Tasks.insert({
        text: text,
        completed: false,
        createdAt: new Date(), // current time
        createdBy: currentUser,
        listId: currentList
        });
      },

      deleteTask: function(taskId) {
        Tasks.remove(taskId);
      },

      setChecked: function (taskId, setChecked) {
        Tasks.update(taskId, {$set: {checked: setChecked} });
      },

      /* updateListItem: function(documentId, text) {
        var currentUser = Meteor.userId();

        var data = {
          _id: documentId,
          createdBy: currentUser
        }

        Tasks.update({data, {$set: {name:text}} )
      }       */ 

  });

}


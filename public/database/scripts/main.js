/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Shortcuts to FORM Elements.
var firstNameInput = document.getElementById('new-first-name');
var lastNameInput = document.getElementById('new-last-name');
var genderInput = document.getElementById('new-gender');
var emailInput = document.getElementById('new-email');
var pizzaQtyInput = document.getElementById('new-pizza-qty');
var allergiesInput = document.getElementById('new-allergies');
var tshirtSizeInput = document.getElementById('new-tshirt-size');
var progInput = document.getElementById('new-prog');
var souperInput = document.getElementById('checkbox-souper');
var photoInput = document.getElementById('checkbox-photo');


// Shortcuts to DOM Elements.
var inscriptionForm = document.getElementById('inscription-form');
var signInButton = document.getElementById('sign-in-button');
var splashPage = document.getElementById('page-splash');
var addInscription = document.getElementById('add-inscription');
var sectionInfo = document.getElementById('section-Info');
var sectionIntro = document.getElementById('section-intro');
var sectionConfirmation = document.getElementById('section-Confirmation');
var containerConfirmation = document.getElementById('container-confirmation');
var myInscriptionButton = document.getElementById('menu-mon-inscription');
var menuInfoButton = document.getElementById('menu-info');
var menuIntroButton = document.getElementById('menu-intro');
var navBar = document.getElementById('nav-bar');
var headerBar = document.getElementById('header-bar');
var containerConfirmationColor = document.getElementById('container-confirmation-color');
var emailConfirmation = document.getElementById('email-confirmation');

var listeningFirebaseRefs = [];

/**
 * Saves a new registration to the Firebase DB.
 */
// [START write_fan_out]
function writeNewInscription(uid, firstname, lastname, gender, email, pizzaQty, allergies, tshirtSize, programme, souper, photo) {
  // A registration entry.
  var postData = {
    uid: uid,
    firstname: firstname,
    lastname: lastname,
    gender: gender,
    email: email,
    pizzaQty: pizzaQty,
    allergies: allergies,
    tshirtSize: tshirtSize,
    programme: programme,
    souper: souper,
    photo: photo,
    equipe: null
  };

  // Get a key for a new registration.
  var newPostKey = firebase.database().ref().child('inscriptions').push().key;

  var updates = {};
  updates['/inscriptions/' + uid] = postData;

  return firebase.database().ref().update(updates);
}
// [END write_fan_out]


/**
 * Creates a post element.
 */
/*function createPostElement(postId, title, text, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;

  var html =
      '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
                  'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
        '<div class="mdl-card mdl-shadow--2dp">' +
          '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
            '<h4 class="mdl-card__title-text"></h4>' +
          '</div>' +
          '<div class="header">' +
            '<div>' +
              '<div class="avatar"></div>' +
              '<div class="username mdl-color-text--black"></div>' +
            '</div>' +
          '</div>' +
          '<span class="star">' +
            '<div class="not-starred material-icons">star_border</div>' +
            '<div class="starred material-icons">star</div>' +
            '<div class="star-count">0</div>' +
          '</span>' +
          '<div class="text"></div>' +
          '<div class="comments-container"></div>' +
          '<form class="add-comment" action="#">' +
            '<div class="mdl-textfield mdl-js-textfield">' +
              '<input class="mdl-textfield__input new-comment" type="text">' +
              '<label class="mdl-textfield__label">Comment...</label>' +
            '</div>' +
          '</form>' +
        '</div>' +
      '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;
  if (componentHandler) {
    componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
  }

  var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
  var commentInput = postElement.getElementsByClassName('new-comment')[0];
  var star = postElement.getElementsByClassName('starred')[0];
  var unStar = postElement.getElementsByClassName('not-starred')[0];

  // Set values.
  postElement.getElementsByClassName('text')[0].innerText = text;
  postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
  postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
      (authorPic || './silhouette.jpg') + '")';

  // Listen for comments.
  // [START child_event_listener_recycler]
  var commentsRef = firebase.database().ref('post-comments/' + postId);
  commentsRef.on('child_added', function(data) {
    addCommentElement(postElement, data.key, data.val().text, data.val().author);
  });

  commentsRef.on('child_changed', function(data) {
    setCommentValues(postElement, data.key, data.val().text, data.val().author);
  });

  commentsRef.on('child_removed', function(data) {
    deleteComment(postElement, data.key);
  });
  // [END child_event_listener_recycler]

  // Listen for likes counts.
  // [START post_value_event_listener]
  var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
  starCountRef.on('value', function(snapshot) {
    updateStarCount(postElement, snapshot.val());
  });
  // [END post_value_event_listener]

  // Listen for the starred status.
  var starredStatusRef = firebase.database().ref('posts/' + postId + '/stars/' + uid)
  starredStatusRef.on('value', function(snapshot) {
    updateStarredByCurrentUser(postElement, snapshot.val());
  });

  // Keep track of all Firebase reference on which we are listening.
  listeningFirebaseRefs.push(commentsRef);
  listeningFirebaseRefs.push(starCountRef);
  listeningFirebaseRefs.push(starredStatusRef);

  // Create new comment.
  addCommentForm.onsubmit = function(e) {
    e.preventDefault();
    createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
    commentInput.value = '';
    commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
  };

  // Bind starring action.
  var onStarClicked = function() {
    var globalPostRef = firebase.database().ref('/posts/' + postId);
    var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
    toggleStar(globalPostRef, uid);
    toggleStar(userPostRef, uid);
  };
  unStar.onclick = onStarClicked;
  star.onclick = onStarClicked;

  return postElement;
}*/

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId) {
  firebase.database().ref('users/' + userId).set({
    username: userId
  });
}
// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    currentUID = user.uid;
    splashPage.style.display = 'none';
    writeUserData(user.uid);
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}


/**
 * Creates a new registration for the current user.
 */
function newInscriptionForCurrentUser(firstname, lastname, gender, email, pizzaQty, allergies, tshirtSize, programme, souper, photo) {
  return writeNewInscription(firebase.auth().currentUser.uid, firstname, lastname, gender, email, pizzaQty, allergies, tshirtSize, programme, souper, photo);
    // [END_EXCLUDE]
  // [END single_value_read]
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  
  sectionInfo.style.display = 'none';
  sectionIntro.style.display = 'none';
  addInscription.style.display = 'none';
  sectionConfirmation.style.display = 'none';

  myInscriptionButton.classList.remove('is-active');
  menuInfoButton.classList.remove('is-active');
  menuIntroButton.classList.remove('is-active');

  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  }
}

/**
 * Changes the color of the specified element from the original ligh-blue-600.
 */
function changeColor(ogColor, sectionElement, newColor) {
  sectionElement.classList.remove(ogColor);
  sectionElement.classList.add(newColor);
}


// Bindings on load.
window.addEventListener('load', function() {
  // Bind Sign in button.
  signInButton.addEventListener('click', function() {
  
    firebase.auth().signInAnonymously().catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error(error);
    });
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Saves message on form submit.
inscriptionForm.onsubmit = function(e) {
  e.preventDefault();
  var firstname = firstNameInput.value;
  var lastname = lastNameInput.value;
  var gender = genderInput.value;
  var email = emailInput.value;
  var pizzaQty = pizzaQtyInput.value;
  var allergies = allergiesInput.value;
  var tshirtSize = tshirtSizeInput.value;
  var programme = progInput.value;
  var souper = souperInput.checked;
  var photo = photoInput.checked;

  if (allergies == "") {
    allergies = "aucune";
  }
  
  if (firstname && lastname && gender && email && pizzaQty && allergies && tshirtSize && programme) {
    newInscriptionForCurrentUser(firstname, lastname, gender, email, pizzaQty, allergies, tshirtSize, programme, souper, photo).then(function() {
      // REDIRIGER VERS LA PAGE DE CONFIRMATION ET LA COULEUR
      showSection(sectionConfirmation);
      emailConfirmation.innerHTML = emailInput.value;
      alert("Envoyé avec succès");
    });
    //messageInput.value = '';
    // clean up the form ou juste la masquer
  } else{
    alert('Veuillez compléter tous les champs');
  }

};

// Bind menu buttons.
menuIntroButton.onclick = function() {
  showSection(sectionIntro, menuIntroButton);
};
myInscriptionButton.onclick = function() {
  showSection(addInscription, myInscriptionButton);
};
menuInfoButton.onclick = function() {
  showSection(sectionInfo, menuInfoButton);
};
}, false);

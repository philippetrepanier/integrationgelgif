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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp(functions.config().firebase);

//Keeps track of the total of registrations and assigns users to teams
exports.countRegistrations = functions.database.ref('/inscriptions/{inscriptionid}').onWrite(event => {
  //for counter
  const collectionRef = event.data.ref.parent;
  const countRef = collectionRef.parent.child('/equipes/total');

  //for assignment
  const user = event.data.val();

  // Return the promise from countRef.transaction() so our function 
  // waits for this async event to complete before it exits.
  return countRef.transaction(current => {
    if (event.data.exists() && !event.data.previous.exists()) {
      return (current || 0) + 1;
    }
    else if (!event.data.exists() && event.data.previous.exists()) {
      return (current || 0) - 1;
    }
  }).then(() => {
    console.log('Counter updated.');

    //for assignement
    return admin.database().ref('/equipes/total').once('value').then(function(snapshot) {
        var nbInscriptions = snapshot.val();
        var numEquipe = nbInscriptions % 4;
        console.log('Equipe numero : ', numEquipe);    
        var nomEquipe = 'equipe' + numEquipe.toString();

        console.log('Assign team');
        return event.data.ref.parent.parent.child('/equipes/' + nomEquipe + '/' + user.uid).set(user);
        console.log('Assignment completed !!');
    }); 
  });
});

//Displays stats about registrations
exports.statsInscriptions = functions.https.onRequest((req, res) => {
  return admin.database().ref('/').once('value').then(function(snapshot) {
      var nbInscriptions = snapshot.child('/equipes/total').val();
      var usersSnap = snapshot.child('/inscriptions/');
      var equipe0 = snapshot.child('/equipes/equipe0/');
      var equipe1 = snapshot.child('/equipes/equipe1/');
      var equipe2 = snapshot.child('/equipes/equipe2/');
      var equipe3 = snapshot.child('/equipes/equipe3/');

      var user_equipe0 = "";
      var user_equipe1 = "";
      var user_equipe2 = "";
      var user_equipe3 = "";
      var user_list = "";

      usersSnap.forEach(function(childSnapshots){
        var prenom = childSnapshots.val().firstname;
        var nom = childSnapshots.val().lastname;

        user_list += prenom + ' ' + nom + '<br>';
      });

      equipe0.forEach(function(childSnapshots){
        var prenom = childSnapshots.val().firstname;
        var nom = childSnapshots.val().lastname;

        user_equipe0 += prenom + ' ' + nom + '<br>';
      });

      equipe1.forEach(function(childSnapshots){
        var prenom = childSnapshots.val().firstname;
        var nom = childSnapshots.val().lastname;

        user_equipe1 += prenom + ' ' + nom + '<br>';
      });

      equipe2.forEach(function(childSnapshots){
        var prenom = childSnapshots.val().firstname;
        var nom = childSnapshots.val().lastname;

        user_equipe2 += prenom + ' ' + nom + '<br>';
      });

      equipe3.forEach(function(childSnapshots){
        var prenom = childSnapshots.val().firstname;
        var nom = childSnapshots.val().lastname;

        user_equipe3 += prenom + ' ' + nom + '<br>';
      });


      res.status(200).send(`<!doctype html>
        <head>
          <title>Statistiques des Inscriptions</title>
        </head>
        <body>
            <h1>Statistiques des inscriptions</h1>
            <h2>Total de ${nbInscriptions} inscriptions </h2>
            ${user_list}
            <h2>Membres de l'equipe 0</h2>
            ${user_equipe0}
            <h2>Membres de l'equipe 1</h2>
            ${user_equipe1}
            <h2>Membres de l'equipe 2</h2>
            ${user_equipe2}
            <h2>Membres de l'equipe 3</h2>
            ${user_equipe3}
        </body>
      </html>`);
  });
});

const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(
    `smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

// Sends a confirmation email to the given user.
function sendConfirmationGmail(email, allergies, firstname, pizzaQty, programme, tshirtSize, equipe) {
const mailOptions = {
    from: `Intégration GEL-GIF <info@integrationgelgif.com>`,
    to: email
  };

  mailOptions.subject = `Équipe ${equipe} - Confirmation de l'inscription!`;
  mailOptions.text = `Bonjour ${firstname}!\n\nCeci est une confirmation de ton inscription. \n\nVoici les informations fournies: \n    Allergies: ${allergies} \n    Pointes de pizza: ${pizzaQty} \n    Programme: ${programme} \n    Taille du t-shirt: ${tshirtSize}\n\nTu es dans l'équipe ${equipe} donc tu dois utiliser cette couleur dans ton costume\n\nPour toute question, écrivez-nous! À bientôt \nLe comité de l'intégration`;
  return mailTransport.sendMail(mailOptions).then(() => {
    console.log('New welcome email sent to:', email);
  });
}


function handleError (err) {
  throw new Error(err.ErrorMessage);
};

exports.sendConfirmationEmailDEV = functions.https.onRequest((req, res) => {
    return sendConfirmationGmail("philippe.trepanier.2@ulaval.ca");
});


//Confirmation equipe 0
exports.sendConfirmationEmailPROD = functions.database.ref('/equipes/equipe0/{inscriptionid}').onWrite(event => {
    const user = event.data.val();

    var email = user.email;
    var allergies = user.allergies;
    var firstname = user.firstname;
    var pizzaQty = user.pizzaQty;
    var programme = user.programme;
    var tshirtSize = user.tshirtSize;
    var equipe = "mauve";

    return sendConfirmationGmail(email, allergies, firstname, pizzaQty, programme, tshirtSize, equipe);
});

exports.sendConfirmationEmailPROD1 = functions.database.ref('/equipes/equipe1/{inscriptionid}').onWrite(event => {
    const user = event.data.val();

    var email = user.email;
    var allergies = user.allergies;
    var firstname = user.firstname;
    var pizzaQty = user.pizzaQty;
    var programme = user.programme;
    var tshirtSize = user.tshirtSize;
    var equipe = "rose";

    return sendConfirmationGmail(email, allergies, firstname, pizzaQty, programme, tshirtSize, equipe);
});

exports.sendConfirmationEmailPROD2 = functions.database.ref('/equipes/equipe2/{inscriptionid}').onWrite(event => {
    const user = event.data.val();

    var email = user.email;
    var allergies = user.allergies;
    var firstname = user.firstname;
    var pizzaQty = user.pizzaQty;
    var programme = user.programme;
    var tshirtSize = user.tshirtSize;
    var equipe = "bleu poudre";

    return sendConfirmationGmail(email, allergies, firstname, pizzaQty, programme, tshirtSize, equipe);
});

exports.sendConfirmationEmailPROD3 = functions.database.ref('/equipes/equipe3/{inscriptionid}').onWrite(event => {
    const user = event.data.val();

    var email = user.email;
    var allergies = user.allergies;
    var firstname = user.firstname;
    var pizzaQty = user.pizzaQty;
    var programme = user.programme;
    var tshirtSize = user.tshirtSize;
    var equipe = "vert pastel";

    return sendConfirmationGmail(email, allergies, firstname, pizzaQty, programme, tshirtSize, equipe);
});
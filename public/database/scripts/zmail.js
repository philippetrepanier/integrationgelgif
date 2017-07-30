
var url = "https://api.mailjet.com/v3/send";
var params = "{"FromEmail": "info@integrationgelgif.com", "FromName": "Intégration GEL-GIF", "Subject": "Confirmation de l'inscription - Intégration GEL-GIF", "MJ-TemplateID": "191745", "MJ-TemplateLanguage": true, "Recipients": [{ "Email": "philippe.trepanier.2@ulaval.ca" }], "Vars": {"var_prenom": "Bonjour", "var_pizza": "0", "var_allergies": "Aucunes", "var_tshirt": "Medium", "var_programme": "ULaval"}}";

var xhr = new XMLHttpRequest();
xhr.open("POST", url, true, 34f6925d484a9afab9890838c31497b7, 8413c8a748619b8efe8f9bf984edeacc);

xhr.setRequestHeader("Content-type", "application/json");

xhr.send(params);
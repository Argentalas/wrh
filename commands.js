//commands.js

// Add your commands here. Every command recieves (request, response) as arguments.
// Core api methods are defined in api.js module.

var commands = {};

commands.echo = echo;

module.exports = commands;

/////////////////////////////

function echo(request, response){
	// request.postData property contains data sent to api.
	var message = request.postData.message

	var reply = message;

	//response.send(data) method sends data back as json; you can also use require('./utl.js').send(data, response) or full functionality of http.ServerResponse https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_class_http_serverresponse
	response.send(reply);
};
var defUser = {
	name: 'user',
	pass: 'password'
};
var user;

searchButton.onclick = function(){
	search(searchField.value, user);
};

loginButton.onclick = function(){
	display("loginForm", "main");
}

goButton.onclick = function(){
	user = {
		name: emailField.value,
		pass: passwordField.value
	};
	echo("auth", user);
};

/////////////////////////

function display(el, scr){
	var arr = new Array(document.getElementById(scr).children);
	arr.forEach((e)=>{
		e.stlye = "display: none;"
	});
	document.getElementById(el).style = "display: block;";
}

function search(q, user){
	user = user || defUser;
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/search/'+user.name);
	xhr.setRequestHeader('Content-type', 'application/json');
	var postData = {
		token: user.pass,
		query: q
	};
	xhr.onreadystatechange = function(){if (xhr.readyState = 4){handle()}};
	xhr.responseType = 'json';
	xhr.send(JSON.stringify(postData));
	///
	function handle(){
		if(xhr.status==='200'){
			console.log(xhr.response);
			console.log('query: '+q);
		}
	}
}

function echo(message, user){
	user = user || defUser;
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/echo/'+user.name); 
	xhr.setRequestHeader('Content-type', 'application/json');
	var postData = {
		token: user.pass,
		message: message
	};
	xhr.onreadystatechange = function(){if (xhr.readyState = 4){handle()}};
	xhr.responseType = 'json';
	xhr.send(JSON.stringify(postData));
	///
	function handle(){
		if(xhr.status==='200'){
			console.log(xhr.response);
			console.log('message: '+q);
		};
	};
}

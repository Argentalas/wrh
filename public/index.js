var defUser = {
	name: 'user',
	pass: 'password'
};
var user;

s.onclick = function(){
	console.log('click');
	search(searchField.value, user);
};

/////////////////////////

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

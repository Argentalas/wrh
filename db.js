//db.js
const fs = require('fs');

var db = createDB('data');
db.private = createDB('private');

module.exports = db;

///////////////////////

function createDB(dbname) {
	
	fs.statSync(dbname).isDirectory() || fs.mkdir(dbname);

	return	function (rel, pkey, value) {

		// If no arguments provided return list of relations (a.k.a. tables :-) )
		var l = fs.readdirSync(dbname);
		if (arguments.length === 0) {return l};

		// If only one argument provided return entire table
		if (l.indexOf(rel+'.json') === -1) {return 'table not found'};
		var r = JSON.parse(fs.readFileSync(`${dbname}/${rel}.json`));
		if (arguments.length === 1) {return r};

		// If two arguments provided return requested value
		if (arguments.length === 2) {return r[pkey] || 'entry not found'};

		// If at least three arguments provided then write provided value to the database
		r[pkey] = value;
		fs.writeFileSync(`${dbname}/${rel}.json`, JSON.stringify(r, null, '\t'));
	};
};
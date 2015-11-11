//tmp file, please execute gulp task to make test
var postcss = require('postcss');
var path = require('path');
var plugin = require('./');

var input = '@constants "./test/constants"; a{background: blue; color: @constants.colors.primary;}';

postcss([ plugin({
	alias: {
		test: path.resolve(process.cwd(), './test')
	},
	defaults: {
		constants: {
			colors: {
				primary: 'red'
			}
		}
	}
}) ]).process(input).then(function ( result ) {
	console.log( result );
}).catch(function ( error ) {
	console.log( error );
});
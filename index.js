var postcss = require('postcss');
var nodepath = require('path');
var assign = require('lodash/object/assign');
var resolve = require('resolve');
var forceRequire = require('require-reload');

module.exports = postcss.plugin('postcss-constants-with-reload', function(opts) {
	var sets = opts && opts.defaults || {};
	var alias = opts && opts.alias || {};
	var webpack = opts && opts.webpack || {};
	var regex = /@([\w]+)(\.([\w]+))+/g;
	var globalNode;

	var AT_RULE_PRESERVED = 'charset import namespace media supports document page font-face keyframes -webkit-keyframes viewport'.split(' ');

	var getConstants = function(name, path, directory) {
		for (var i in alias) {
			if (path.indexOf(i) === 0) {
				var aliasPath = alias[i].replace(/\/$/, '') + '/';
				path = path.replace(new RegExp('^' + i + '/'), aliasPath);
				path = nodepath.resolve(path);
			}
		}

		var res = resolve.sync(path, {
			basedir: nodepath.dirname(directory)
		});

		if( typeof  webpack.addDependency === 'function' ){
			//add to dependency
			//http://webpack.github.io/docs/loaders.html#adddependency
			//https://github.com/postcss/postcss-import#L92
			webpack.addDependency( res );
		 }
		
		var constantSets;

		try {
			constantSets = forceRequire(res);
		} catch (e) {
			constantSets = {};
		}

		if (sets[name]) {
			sets[name] = assign({}, sets[name], constantSets);
		} else {
			sets[name] = constantSets;
		}
	};

	var requiresAction = function(context) {
		return !!context.match(regex);
	};

	var getValue = function( path ) {
		var tmp = getPropertyByPath( sets, path );
		
		if( typeof tmp === 'undefined' ){
			if( typeof globalNode !== 'undefined' ){
				throw globalNode.error('No such path `' + path + '` found in set');
			}
		}
		
		return tmp;
	};

	function getPropertyByPath( obj, path ){
		var context = obj, value;

		if( typeof context === 'undefined' ){
			return void 0;
		}

		keys = String( path ).split('.');

		for( var i = 0, len = keys.length; i < len; i++ ){
			if (i < len - 1) {
				context = context[ keys[ i ] ];
				if( typeof context === 'undefined' ){
					value = void 0;
					break;
				}

			} else if(i === len - 1){
				value = context[ keys[ i ] ];
			}
		}

		return value;
	};

	var strip = function(context) {
		if (!requiresAction(context)) {
			return context;
		}

		var requires = context.match(regex);

		requires.forEach(function(req) {
			context = context.replace(req, getValue( req.replace(/[\s|@]/g, '') ));
		});

		return context;
	};

	return function(css) {
		css.eachInside(function(node) {
			var name, constantsPath;
			
			globalNode = node;

			if (node.type === 'atrule' && !~AT_RULE_PRESERVED.indexOf(node.name)) {
				name = node.name.match(/[\w|-]+/);

				if (name) {
					name = name[0];
					constantsPath = node.params && node.params.replace(/\s/g, '').replace(/['|"]/g, '');
					getConstants(name, constantsPath, node.source.input.from);
					node.removeSelf();
				}
			} else if (node.type === 'atrule') {
		        node.params = strip(node.params);
		    }

		    if (node.type === 'decl') {
		        node.value = strip(node.value);
		    }
		});
	};
});
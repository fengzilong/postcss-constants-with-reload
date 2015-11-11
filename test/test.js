var postcss = require('postcss');
var expect  = require('chai').expect;
var path = require('path');
var plugin = require('../');
var opts = {
	alias: {
		test: path.resolve(process.cwd(), './test')
	},
	defaults: {
		colors: {
			primary: 'red'
		}
	}
};

var test = function (input, output, opts, done) {
    postcss([ plugin(opts) ]).process(input).then(function (result) {
        expect(result.css).to.eql(output);
        expect(result.warnings()).to.be.empty;
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('postcss-constants', function () {
    it('does not replace static values', function (done) {
        test('a{color: #8EE7D3}', 'a{color: #8EE7D3}', opts, done);
    });

    it('replaces constants in values', function (done) {
        test('@constants "./test/constants.js"; a{color: @constants.colors.primary;}', 'a{color: #8EE7D3;}', opts, done);
    });

	//it will throw CssSyntaxError: Unclosed block error, so avoid write css remaining atrule without semi-colons
    //it('replaces constants in values without semi-colons', function (done) {
    //    test('@constants "./test/constants.js"; a{background: blue; color: @constants.colors.primary}', 'a{background: blue; color: #8EE7D3}', opts, done);
    //});

    it('replaces constants at start of value', function (done) {
        test('@constants "./test/constants.js"; a{border: @constants.borders.weight solid #8EE7D3;}', 'a{border: 2px solid #8EE7D3;}', opts, done);
    });

    it('replaces constants in middle of value', function (done) {
        test('@constants "./test/constants.js"; a{border: 2px @constants.borders.style #8EE7D3;}', 'a{border: 2px solid #8EE7D3;}', opts, done);
    });

    it('replaces constants at end of value', function (done) {
        test('@constants "./test/constants.js"; a{border: 2px solid @constants.colors.primary;}', 'a{border: 2px solid #8EE7D3;}', opts, done);
    });

    it('replaces constants in @ rules', function (done) {
        test('@constants "./test/constants.js"; @media (max-width: @constants.queries.maxWidth) {color: red;}', '@media (max-width: 200px) {color: red;}', opts, done);
    });

    it('multiple sources', function (done) {
        test('@constants "./test/constants.js"; @second_constants "./test/second_constants.js"; a{color: @constants.colors.primary; border: solid 2px @second_constants.colors.secondary;}', 'a{color: #8EE7D3; border: solid 2px #DDD;}', opts, done);
    });

    it('multiple constants in a single value', function (done) {
        test('@constants "./test/constants.js"; a{border: @constants.borders.weight @constants.borders.style black}', 'a{border: 2px solid black}', opts, done);
    });

    it('overrides default constants', function (done) {
        test('@constants "./test/constants.js"; a{color: @constants.colors.primary;}', 'a{color: #8EE7D3;}', opts, done);
    });

    it('default constants', function (done) {
        test('@constants "./test/constants.js"; a{color: @constants.colors.secondary;}', 'a{color: red;}', opts, done);
    });
});

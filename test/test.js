var chai = require('chai');
var expect = chai.expect;
var semver = require('semver');
var requireAll = require('../src/requireAll');

describe('requireAll', function () {
  describe('defaults', function () {

    // requiring json only became an option in 0.6+
    if (semver.gt(process.version, 'v0.6.0')) {
      it('should use default options', function () {
        expect(requireAll({
          dirname: __dirname + '/mydir'
        })).to.deep.equal({
          foo: 'bar',
          hello: {
            world: true,
            universe: 42
          },
          sub: {
            config: {
              settingA: 'A',
              settingB: 'B'
            },
            yes: true
          }
        });
      });

      it('dirname as string', function () {
        expect(requireAll(__dirname + '/mydir')).to.deep.equal({
          foo: 'bar',
          hello: {
            world: true,
            universe: 42
          },
          sub: {
            config: {
              settingA: 'A',
              settingB: 'B'
            },
            yes: true
          }
        });
      });
    }
  });

  describe('recursive', function () {
    it('should create nested objects for recursive routes', function () {
      expect(requireAll({
        dirname: __dirname + '/controllers',
        filter: /(.+Controller)\.js$/
      })).to.deep.equal({
        'main-Controller': {
          index: 1,
          show: 2,
          add: 3,
          edit: 4
        },

        'other-Controller': {
          index: 1,
          show: 'nothing'
        },

        'sub-dir': {
          'other-Controller': {
            index: 1,
            show: 2
          }
        }
      });
    });

    it('should skip nested folders in non-recursive mode', function () {
      expect(requireAll({
        dirname: __dirname + '/controllers',
        filter: /(.+Controller)\.js$/,
        recursive: false
      })).to.deep.equal({
        'main-Controller': {
          index: 1,
          show: 2,
          add: 3,
          edit: 4
        },

        'other-Controller': {
          index: 1,
          show: 'nothing'
        }
      });
    });
  });

  describe('map', function () {
    it('single level rename', function () {
      expect(requireAll({
        dirname: __dirname + '/controllers',
        filter: /(.+Controller)\.js$/,
        map: function (name) {
          return name.replace(/-([A-Z])/, function (m, c) {
            return '_' + c.toLowerCase();
          });
        }
      })).to.deep.equal({
        main_controller: {
          index: 1,
          show: 2,
          add: 3,
          edit: 4
        },

        other_controller: {
          index: 1,
          show: 'nothing'
        },

        'sub-dir': {
          other_controller: {
            index: 1,
            show: 2
          }
        }
      });
    });

    it('multiple level rename', function () {
      expect(requireAll({
        dirname: __dirname + '/controllers',
        filter: /(.+Controller)\.js$/,
        map: function (name) {
          return name.replace(/-([A-Za-z])/g, function (m, c) {
            return '_' + c.toLowerCase();
          });
        }
      })).to.deep.equal({
        main_controller: {
          index: 1,
          show: 2,
          add: 3,
          edit: 4
        },

        other_controller: {
          index: 1,
          show: 'nothing'
        },

        sub_dir: {
          other_controller: {
            index: 1,
            show: 2
          }
        }
      });
    });
  });

  describe('excludeDirs', function () {
    it('should not exclued any folder in disabled mode', function () {
      var unfiltered = requireAll({
        dirname: __dirname + '/filterdir',
        filter: /(.+)\.js$/,
        excludeDirs: false
      });

      expect(unfiltered).to.have.property('.svn');
      expect(unfiltered).to.have.property('root');
      expect(unfiltered).to.have.property('sub');
    });

    it('exclude hidden folders', function () {
      var unfiltered = requireAll({
        dirname: __dirname + '/filterdir',
        filter: /(.+)\.js$/,
        excludeDirs: /^\.svn$/
      });

      expect(unfiltered).to.not.have.property('.svn');
      expect(unfiltered).to.have.property('root');
      expect(unfiltered).to.have.property('sub');
    });

    it('exclude multiple folders', function () {
      var unfiltered = requireAll({
        dirname: __dirname + '/filterdir',
        filter: /(.+)\.js$/,
        excludeDirs: /^(\.svn|sub)$/
      });

      expect(unfiltered).to.not.have.property('.svn');
      expect(unfiltered).to.have.property('root');
      expect(unfiltered).to.not.have.property('sub');
    });
  });

  describe('resolve', function () {
    it('should use resolve result', function () {
      var resolvedValues = requireAll({
        dirname: __dirname + '/resolved',
        filter: /(.+)\.js$/,
        resolve: function (memo, filePath, key) {
          var fn = require(filePath);
          memo[key] = fn('arg1', 'arg2');
        }
      });

      expect(resolvedValues).to.have.property('onearg', 'arg1');
      expect(resolvedValues).to.have.property('twoargs', 'arg2');
    });
  });
});
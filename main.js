#!/usr/bin/env node
var argv = require('optimist')
    .usage("execute command with node version acceptable to engine package.json property\nusage: $0")
    .demand('c')
    .describe('c', 'Shell command')
    .demand('f')
    .describe('f', 'Path to package.json')
    .argv
    exec = require('child_process').exec,
    fs = require('fs'),
    semver = require('semver'),
    spawn = require('child_process').spawn;

var nave_path = "./node_modules/nave/nave.sh";

// Check what version of node is already in system $PATH
function getSystemNodeVers(cb) {
    exec('node -v', function(err, stdout) {
      if (err) {
        return cb(err, null);
      }
      cb(null, stdout.slice(1).replace('\n',''));
    });
}

function readPackage(path) {
  try {
    return(fs.readFileSync(path));
  } catch(e) {
    console.log(e.toString());
    process.exit(1);
  }
}

function parsePackage(contents) {
  try {
    return(JSON.parse(contents));
  } catch(e) {
    console.log("Error: Could not parse package.json:", e);
    process.exit(1);
  }
}

function getEngine(pkgData) {
  var engine;
  if (data.engines && data.engines.node) {
    engine = data.engines.node;
  } else {
    engine = "*";
  }
  return engine;
}
// Look in ~/.nave/installed to list currently installed Node.JS versions
// @param cb function(err, [versions])
function getLocalNodeVers(cb) {
  var nave_path =  process.env.HOME + "/.nave/installed/";

  fs.readdir(nave_path, cb);
}

// Use `nave ls-remote` to build a list of available node.js versions
// @param cb function([versions])
function getRemoteNodeVers(cb) {
  var cmd = nave_path + " ls-remote";

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    // Filter out 'remote:'
    stdout = stdout.replace('remote:', '');
    var versions = stdout.split(/\s+/);
    var res = [];
    // Filter empty strings
    for (var i=0; i < versions.length; i++) {
      if (versions[i].length > 0) {
        res.push(versions[i]);
      }
    }

    cb(res);
  });
}

function run(cmd, cb, hide_dl) {
  cmd = cmd.split(/\s+/);

  console.log("running cmd: %j", cmd);
  var child = spawn(cmd[0], cmd.slice(1));
  var done = false;
  child.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  child.stderr.on('data', function(data) {
    var d = data.toString()
    // Try to filter out most of the curl download
    if (hide_dl == true) {
      if (!done && d.indexOf('100.0%') != -1) {
        console.log("download complete");
        done = true;
      }
      if (done) {
        console.log(d);
      }
    } else {
      console.log(d);
    }
  });
  child.on('exit', function(code) {
    if (code != 0) {
      console.log("Error executing command %s: %s", cmd);
      process.exit(1);
    }
    cb();
  });
}

var json = readPackage(argv.f);
var data = parsePackage(json);
var engine = getEngine(data);

// Check for matching system (non-Nave) Node.JS version
getSystemNodeVers(function(err, version) {
  if (!err) {
    if (semver.satisfies(version, engine)) {
      console.log("System non-Nave Node.JS version %s satisfies range %s", version, engine);
      return run(argv.c, function() {
        process.exit(0);
      });

    }
  }
  console.log("System non-Nave Node.JS version %s does not satisfy range %s", version, engine);
  getLocalNodeVers(function(err, versions) {
    if (err) {
      versions = [];
    }
    console.log("local versions: %j", versions);
    // Check whether an already-installed-via-Nave node version satisfies the engine
    var found = false;
    for (var i=0; i<versions.length; i++) {
      if (semver.satisfies(versions[i], engine)) {
        found = versions[i];
        break;
      }
    }
    var cmd = nave_path + " use " + found + " " + argv.c;
    if (found) {
      console.log("Local version %s satisfies range %s", found, engine);
      run(cmd, function() {
          process.exit(0);
      }, true);
    } else {
      // No locally-installed version satisfies, find the latest remote version 
      // install that, then run the command with that version.
      getRemoteNodeVers(function(versions) {
        var remote_version = semver.maxSatisfying(versions, engine);
        if (!remote_version) {
          console.log("Error: No remote version can satisfy range %s!", engine);
          process.exit(1);
        }
        console.log("Remote version %s satisfies range %s", remote_version, engine);
        var cmd = nave_path + " use " + remote_version + " " + argv.c;
        run(cmd, function() {
          process.exit(0);
        }, true);
      });
    }

  });

});

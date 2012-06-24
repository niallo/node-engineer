node-engineer
=============

Parse package.json, inspect engine property and ensure command runs with right node.js version - avoiding as much compilation as possible.

Engineer makes it trivial to run a command in an environment where `node` and
`npm` match those specified by a particular package.json's `engine` field. It
attempts to do this using already-present node binaries to save time if at all possible.

Engineer will try in this order, using the first satisfying version it finds:

* Inspect the version of node.js in the $PATH to see if it satifies engine.
* Inspect the version of node.js versions already installed locally via nave to
  see if any of those satifies engine.
* Pick the maximum remote version of node.js which satisfies via nave.

This makes it a no-brainer to run an arbitrary package under whatever version
of node it needs. Engineer uses `nave` and `semver` to do the heavy lifting of
installing and checking for valid node.js versions.

Installation
============
```
npm install -g node-engineer
```

Usage
=====
```
execute command with node version acceptable to engine package.json property
usage: engineer

Options:
  -c  Shell command         [required]
  -f  Path to package.json  [required]

Missing required arguments: c, f
```

Demo
====

```
# "node":">=0.6.19 <0.7.0"
# $PATH contains node 0.6.17
# No existing locally-installed nave versions

$ engineer -f package.json -c 'npm ls'
System non-Nave Node.JS version 0.6.17 does not satisfy range >=0.6.19 <0.7.0
local versions: []
Remote version 0.6.19 satisfies range >=0.6.19 <0.7.0
running cmd: ["./node_modules/nave/nave.sh","use","0.6.19","npm","ls"]
```

```
# "node":">=0.6.0 <0.7.0"
# $PATH contains node 0.6.17
$ engineer -f package.json -c 'npm ls'
System non-Nave Node.JS version 0.6.17 satisfies range >=0.6.0 <0.7.0
running cmd: ["npm","ls"]
node-engineer@0.2.0 /Users/nialljohiggins/projects/node-engineer
├── chai@1.0.4  extraneous
├─┬ mocha@1.2.0  extraneous
│ ├── commander@0.5.2 
│ ├── debug@0.7.0 
│ ├── diff@1.0.2 
│ ├── growl@1.5.1 
│ └─┬ jade@0.20.3 
│   └── mkdirp@0.3.3 
├── nave@0.2.13 
├─┬ optimist@0.3.4 
│ └── wordwrap@0.0.2 
└── semver@1.0.14 
```

Credits
=======

This is a glue package which relies on:

* [Nave by IsaacS](https://github.com/isaacs/nave)
* [semver by IsaacS](https://github.com/isaacs/node-semver)
* [optimist by substack](https://github.com/substack/node-optimist)



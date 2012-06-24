node-engineer
=============

Parse package.json, inspect engine property and ensure command runs with right node.js version.

Engineer makes it trivial to run a command in an environment where `node` and `npm` match those
specified by a particular package.json's `engine` field.

This makes it a no-brainer to run an arbitrary package under whatever version of node it needs. Engineer uses `nave` and `semver` to do the heavy lifting ot installing and checking for valid node.js versions.

Installation
============
```
npm install engineer
```

Usage
=====
```
execute command with node version acceptable to engine package.json property
usage: node ./main.js

Options:
  -c  Shell command         [required]
  -f  Path to package.json  [required]

Missing required arguments: c, f
```

Demo
====

```
$ engineer -f package.json -c 'npm ls'
local versions: ["0.6.19"]
Local version 0.6.19 satisfies range >=0.6.0 <0.7.0
running cmd: ["./node_modules/nave/nave.sh","use","0.6.19","npm","ls"]
node-engineer@0.1.0 /Users/nialljohiggins/projects/node-engineer
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

* (Nave by IsaacS )[https://github.com/isaacs/nave]
* (semver by IsaacS )[https://github.com/isaacs/node-semver]



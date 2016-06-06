bae
===

babelrc plugin and preset manager

```sh
npm install -g @quarterto/bae
```

usage
-----

```sh
bae --preset es2015 --preset stage-3 --plugin transform-runtime
```

installs the packages as devdeps and adds them to babelrc. if babelrc isn't there, create it. look for babelrc in the current directory, or the closest parent directory with a `.git`.

if transform-runtime is requested, also installs `babel-runtime` as a production dep.

if you pass in `-r` or `--remove`, the plugins are removed instead of installed

licence
-------

mit

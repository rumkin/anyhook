function __init {
    __initial_deps
    npm init
}

function __initial_deps {
    set -e
    bake dev mocha
    bake dev istanbul
}

# Install node package
function __i {
    npm i $@
}

# Install dev dependency
function __dev {
    npm i --save-dev $@
}

function __cov {
    npm run cov
}

function __sync {
    TARGET=${1:=stage}
    npm sync -- $1
    ssh -i /projects/.ssh/hyphen hyphen@http://78.47.172.45/ 'pm2 restart ~/githook'
}

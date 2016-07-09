task:init() {
    __initial_deps
    npm init
}

task:initial_deps() {
    set -e
    bake dev mocha
    bake dev istanbul
}

# Install node package
task:i() {
    npm i $@
}

# Install dev dependency
task:dev() {
    npm i --save-dev $@
}

task:cov() {
    npm run cov
}

task:sync() {
    TARGET=${1:=stage}
    npm sync -- $1
    ssh -i /projects/.ssh/hyphen hyphen@http://78.47.172.45/ 'pm2 restart ~/githook'
}

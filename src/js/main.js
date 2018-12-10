
export default class Greeting {
    constructor (name) {
        this.username = name
    }

    sayHi () {
        console.log('Hi ' + this.username)
    }
}

let rudy = new Greeting('Rudy')
rudy.sayHi()


class Message2 {
    private value : number
    private static nextValue : number = 0

    constructor() {
        this.value = Message2.nextValue;
        Message2.nextValue++;
    }

    getValue() : number {
        return this.value;
    }
}

class Publisher2 {

    public generate() : Message2 {
        var m : Message2 = new Message2();
        console.log("generated message : " + m.getValue())
        return m;
    }
}

class Subscriber2 {
    private received : Message2[]

    constructor() {
        this.received = [];
    }

    public receive(m : Message2){
        this.received.push(m);
        console.log("received message : " + m.getValue())
    }
}

class AsyncQueue2 {
    
    private messageQueue : Message2[]

    constructor() {
        this.messageQueue = [];
    }

    public async pull(s : Subscriber2) : Promise<void>{
        console.log("subscriber pull attempt");

        while(this.messageQueue.length == 0) {

            console.log("waiting for message")
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 1000)
              });

            await promise;
        }

        

        s.receive(this.messageQueue[0]);
        this.messageQueue.splice(0, 1);
    }

    public async push(p : Publisher2) : Promise<void>{
        console.log("publisher push");

        this.messageQueue.push(p.generate())
    }
}

function test2() {
    var s = new Subscriber2();
    var s2 = new Subscriber2();
    var p = new Publisher2();
    var mq = new AsyncQueue2();

    var pushes = 0;
    var pulls = 0;

    for(var i = 0; i < 100; i ++) {
        var r = Math.random();
        if(r >= 0.5) {
            mq.push(p);
            pushes++;
        }
        else if(r >= 0.25) {
            mq.pull(s);
            pulls++;
        }
        else {
            mq.pull(s2);
            pulls++;
        }  
    }

    console.log("pulls : " + pulls);
    console.log("pushes : " + pushes);

    while(pulls - pushes > 0) {
        mq.push(p);
        pushes++;
    }

    console.log("pulls : " + pulls);
    console.log("pushes : " + pushes);
}

test2();
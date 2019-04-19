var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Message {
    constructor() {
        this.value = Message.nextValue;
        Message.nextValue++;
    }
    getValue() {
        return this.value;
    }
}
Message.nextValue = 0;
class Publisher {
    generate() {
        var m = new Message();
        console.log("generated message : " + m.getValue());
        return m;
    }
}
class Subscriber {
    constructor() {
        this.received = [];
    }
    receive(m) {
        this.received.push(m);
        console.log("received message : " + m.getValue());
    }
}
class AsyncQueue {
    constructor() {
        this.messageQueue = [];
    }
    pull(s) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("subscriber pull attempt");
            while (this.messageQueue.length == 0) {
                console.log("waiting for message");
                let promise = new Promise((resolve, reject) => {
                    setTimeout(() => resolve(), 1000);
                });
                yield promise;
            }
            s.receive(this.messageQueue[0]);
            this.messageQueue.splice(0, 1);
        });
    }
    push(p) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("publisher push");
            this.messageQueue.push(p.generate());
        });
    }
}
function test() {
    var s = new Subscriber();
    var p = new Publisher();
    var mq = new AsyncQueue();
    var pushes = 0;
    var pulls = 0;
    for (var i = 0; i < 100; i++) {
        var r = Math.random();
        if (r >= 0.5) {
            mq.push(p);
            pushes++;
        }
        else {
            mq.pull(s);
            pulls++;
        }
    }
    console.log("pulls : " + pulls);
    console.log("pushes : " + pushes);
    while (pulls - pushes > 0) {
        mq.push(p);
        pushes++;
    }
    console.log("pulls : " + pulls);
    console.log("pushes : " + pushes);
}
test();
//# sourceMappingURL=scenario1.js.map
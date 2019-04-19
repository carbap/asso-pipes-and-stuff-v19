var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Message2 {
    constructor() {
        this.value = Message2.nextValue;
        Message2.nextValue++;
    }
    getValue() {
        return this.value;
    }
}
Message2.nextValue = 0;
class Publisher2 {
    generate() {
        var m = new Message2();
        console.log("generated message : " + m.getValue());
        return m;
    }
}
class Subscriber2 {
    constructor() {
        this.received = [];
    }
    receive(m) {
        this.received.push(m);
        console.log("received message : " + m.getValue());
    }
}
class AsyncQueue2 {
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
function test2() {
    var s = new Subscriber2();
    var s2 = new Subscriber2();
    var p = new Publisher2();
    var mq = new AsyncQueue2();
    var pushes = 0;
    var pulls = 0;
    for (var i = 0; i < 100; i++) {
        var r = Math.random();
        if (r >= 0.5) {
            mq.push(p);
            pushes++;
        }
        else if (r >= 0.25) {
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
    while (pulls - pushes > 0) {
        mq.push(p);
        pushes++;
    }
    console.log("pulls : " + pulls);
    console.log("pushes : " + pushes);
}
test2();
//# sourceMappingURL=scenario2.js.map
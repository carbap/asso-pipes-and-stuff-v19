var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Message3 {
    constructor() {
        this.value = Message3.nextValue++;
    }
    getValue() {
        return this.value;
    }
}
Message3.nextValue = 0;
class Publisher3 {
    generate() {
        var m = new Message3();
        console.log("generated message : " + m.getValue());
        return m;
    }
}
class Subscriber3 {
    constructor() {
        this.id = Subscriber3.nextId++;
        this.received = [];
    }
    receive(m, v) {
        this.received.push(m);
        console.log("subID : " + this.getId() + ", received message : " + m.getValue());
        this.sendACK(v, m.getValue());
    }
    sendACK(v, msgId) {
        v.receiveACK(this.getId(), msgId);
    }
    getId() {
        return this.id;
    }
}
Subscriber3.nextId = 0;
class AsyncQueue3 {
    constructor() {
        this.messageQueue = [];
        this.ventilator = new Ventilator3();
    }
    push(m) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("publisher push, msgId : " + m.getValue());
            this.messageQueue.push(m);
            yield this.ventilator.notifySubscriberList(m);
            for (var i = 0; i < this.messageQueue.length; i++) {
                if (this.messageQueue[i].getValue() == m.getValue()) {
                    this.messageQueue.splice(i, 1);
                }
            }
        });
    }
    registerSubscriber(s) {
        this.ventilator.registerSubscriber(s);
    }
    unregisterSubscriber(s) {
        this.ventilator.unregisterSubscriber(s);
    }
}
class Ventilator3 {
    constructor() {
        this.subscriberList = [];
        this.pendingACK = [];
    }
    registerSubscriber(s) {
        this.subscriberList.push(s);
        console.log("registered subID : " + s.getId());
    }
    unregisterSubscriber(s) {
        for (var i = 0; i < this.subscriberList.length; i++) {
            if (s === this.subscriberList[i]) {
                this.subscriberList.splice(i, 1);
            }
        }
        console.log("unregistered subID : " + s.getId());
    }
    notifySubscriberList(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("notifying subs, msgID : " + msg.getValue());
            for (var i = 0; i < this.subscriberList.length; i++) {
                this.notifySubscriber(this.subscriberList[i], msg);
            }
        });
    }
    notifySubscriber(s, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            var pACK = new MsgMetaData3(s.getId(), msg.getValue());
            this.pendingACK.push(pACK);
            s.receive(msg, this);
            var noResponse = true;
            var counter = 0;
            while (noResponse) {
                if (counter == 3) {
                    counter = 0;
                    s.receive(msg, this);
                }
                console.log("waiting for ACK from subscriber " + s.getId());
                let promise = new Promise((resolve, reject) => {
                    setTimeout(() => resolve(), 500);
                });
                yield promise;
                noResponse = false;
                for (var i = 0; i < this.pendingACK.length; i++) {
                    if (this.pendingACK[i].getSubId() == s.getId() &&
                        this.pendingACK[i].getMsgId() == msg.getValue()) {
                        noResponse = true;
                        counter++;
                        break;
                    }
                }
            }
            console.log("processed ACK from subscriber " + s.getId() + ", msgID : " + msg.getValue());
        });
    }
    receiveACK(subId, msgId) {
        console.log("receive ACK subID: " + subId + ", msgID : " + msgId);
        for (var i = 0; i < this.pendingACK.length; i++) {
            var pACK = this.pendingACK[i];
            if (pACK.getMsgId() == msgId && pACK.getSubId() == subId) {
                this.pendingACK.splice(i, 1);
                break;
            }
        }
    }
}
class MsgMetaData3 {
    constructor(subId, msgId) {
        this.msgId = msgId;
        this.subId = subId;
    }
    getMsgId() {
        return this.msgId;
    }
    getSubId() {
        return this.subId;
    }
}
function test3() {
    var s0 = new Subscriber3();
    var s1 = new Subscriber3();
    var s2 = new Subscriber3();
    var s3 = new Subscriber3();
    var s4 = new Subscriber3();
    var s5 = new Subscriber3();
    var p = new Publisher3();
    var mq = new AsyncQueue3();
    mq.registerSubscriber(s0);
    mq.registerSubscriber(s1);
    mq.push(p.generate());
    mq.registerSubscriber(s2);
    mq.registerSubscriber(s3);
    mq.unregisterSubscriber(s0);
    mq.push(p.generate());
    mq.registerSubscriber(s4);
    mq.registerSubscriber(s5);
    mq.unregisterSubscriber(s1);
    mq.push(p.generate());
}
test3();
//# sourceMappingURL=scenario3.js.map
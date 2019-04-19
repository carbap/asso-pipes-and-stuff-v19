var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Publisher4 {
    constructor(id, maxQueueSize) {
        this.producedMessages = new Array();
        this.id = id;
        this.queue = new BoundedAsyncQueue(maxQueueSize);
    }
    write(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queue.enqueue(message);
            this.producedMessages.push(message);
            console.log("p" + this.id + " published (" + message.content + ", tag: " + message.tag + ")");
        });
    }
}
class Subscriber4 {
    constructor(id, tags, maxQueueSize) {
        this.readMessages = new Array();
        this.id = id;
        this.tags = tags;
        this.queue = new BoundedAsyncQueue(maxQueueSize);
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            let message = yield this.queue.dequeue("subscriber");
            this.readMessages.push(message);
            console.log("s" + this.id + " read (" + message.content + ", tag: " + message.tag + ")");
        });
    }
}
class Broker {
    constructor(publishers, subscribers) {
        this.publishers = publishers;
        this.subscribers = subscribers;
    }
    deliverMessage(promise) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = yield promise;
            console.log("Broker read: " + message.content + ", " + message.tag);
            for (let sub of this.subscribers) {
                if (sub.tags.includes(message.tag)) {
                    sub.queue.enqueue(message);
                    sub.read(); // Observer pattern - this read function is the same as notifying the observer that his state has changed
                }
            }
        });
    }
    work() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                let delayPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        //console.log("Broker is resting for 5 seconds");
                        resolve();
                    }, 5000);
                });
                yield delayPromise;
                //console.log("Fetching promises from publishers");
                for (let pub of this.publishers) {
                    let promise = pub.queue.dequeue("broker");
                    this.deliverMessage(promise);
                }
            }
        });
    }
}
class Message4 {
    constructor(tag, content) {
        this.tag = tag;
        this.content = content;
    }
}
class BoundedAsyncQueue {
    constructor(size) {
        this.queue = new Array();
        this.semaphore = new AsyncSemaphore(size);
    }
    enqueue(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.semaphore.waitPush();
            this.queue.push(message);
            this.semaphore.signalPush();
        });
    }
    dequeue(order) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.semaphore.waitPull(order);
            let message = this.queue.shift() || new Message4(1, "error message");
            this.semaphore.signalPull();
            return message;
        });
    }
}
class AsyncSemaphore {
    constructor(size) {
        this.currentSize = 0;
        this.emptySize = size;
        this.maxSize = size;
    }
    signalPush() {
        this.emptySize--;
    }
    signalPull() {
        this.currentSize--;
    }
    waitPush() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.currentSize >= this.maxSize) {
                let promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
                yield promise;
            }
            this.currentSize++;
        });
    }
    waitPull(order) {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.emptySize >= this.maxSize) {
                var promise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
                yield promise;
            }
            this.emptySize++;
        });
    }
}
function produce(publishers) {
    return __awaiter(this, void 0, void 0, function* () {
        let productionRounds = 0;
        while (productionRounds < 6) {
            for (let pub of publishers) {
                let tag = Math.floor(Math.random() * 3) + 1;
                let content = Math.random().toString(36).substring(7);
                let message = new Message4(tag, content);
                pub.write(message);
            }
            productionRounds++;
        }
    });
}
setInterval(() => { }, 1000); // run program until explicit exit
function sameContent(a1, a2) {
    if (a1.length <= 0 && a2.length <= 0)
        return false;
    for (let e1 of a1) {
        let elementFound = false;
        for (let e2 of a2) {
            if (e1.content === e2.content && e1.tag === e2.tag)
                elementFound = true;
        }
        if (!elementFound)
            return false;
    }
    for (let e2 of a2) {
        let elementFound = false;
        for (let e1 of a1) {
            if (e1.content === e2.content && e1.tag === e2.tag)
                elementFound = true;
        }
        if (!elementFound)
            return false;
    }
    return true;
}
(() => __awaiter(this, void 0, void 0, function* () {
    var p1 = new Publisher4(1, 1);
    var p2 = new Publisher4(2, 3);
    var p3 = new Publisher4(3, 3);
    var p4 = new Publisher4(4, 3);
    let publishers = [p1, p2, p3, p4];
    var s1 = new Subscriber4(1, [1], 5);
    var s2 = new Subscriber4(2, [2], 5);
    var s3 = new Subscriber4(3, [3], 5);
    let subscribers = [s1, s2, s3];
    produce(publishers);
    let broker = new Broker(publishers, subscribers);
    broker.work();
    let delayPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            let producedMsgs = new Array();
            for (let pub of publishers) {
                producedMsgs = producedMsgs.concat(pub.producedMessages);
            }
            console.log(producedMsgs.length + " messages were produced");
            let readMsgs = new Array();
            for (let sub of subscribers) {
                readMsgs = readMsgs.concat(sub.readMessages);
            }
            console.log(readMsgs.length + " messages were read");
            if (sameContent(producedMsgs, readMsgs))
                console.log("TEST WAS SUCCESSFUL - ALL PRODUCED MESSAGES WERE READ");
            else
                console.log("TEST FAILED - NOT ALL PRODUCED MESSAGES WERE READ");
            resolve();
        }, 40000);
    });
    yield delayPromise;
    process.exit();
}))();
//# sourceMappingURL=scenario4.js.map
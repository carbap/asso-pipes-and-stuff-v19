
class Message3 {
    private value : number;
    private static nextValue : number = 0;

    constructor() {
        this.value = Message3.nextValue++;
    }

    getValue() : number {
        return this.value;
    }
}

class Publisher3 {

    public generate() : Message3 {
        var m : Message3 = new Message3();
        console.log("generated message : " + m.getValue());
        return m;
    }

}

interface Observer3 {
    receive(m : Message3, v : Ventilator3) : void
}

class Subscriber3 implements Observer3{
    private received : Message3[];
    private id : number;
    private static nextId : number = 0;

    constructor() {
        this.id = Subscriber3.nextId++;
        this.received = [];
    }

    public receive(m : Message3, v : Ventilator3){
        this.received.push(m);
        console.log("subID : " + this.getId() + ", received message : " + m.getValue());
        this.sendACK(v, m.getValue());
    }

    public sendACK(v : Ventilator3, msgId : number) {
        v.receiveACK(this.getId(), msgId);
    }

    public getId() : number {
        return this.id;
    }
}

class AsyncQueue3 {
    
    private messageQueue : Message3[];
    private ventilator : Ventilator3;

    constructor() {
        this.messageQueue = [];
        this.ventilator = new Ventilator3();
    }

    public async push(m : Message3) : Promise<void>{
        console.log("publisher push, msgId : " + m.getValue());

        this.messageQueue.push(m);
        await this.ventilator.notifySubscriberList(m);
        for(var i = 0; i < this.messageQueue.length; i++) {
            if(this.messageQueue[i].getValue() == m.getValue()) {
                this.messageQueue.splice(i, 1);
            }
        }
    }

    public registerSubscriber(s : Subscriber3) {
        this.ventilator.registerSubscriber(s);
    }

    public unregisterSubscriber(s : Subscriber3) {
        this.ventilator.unregisterSubscriber(s);
    }
}

class Ventilator3 {

    private subscriberList : Subscriber3[];
    private pendingACK : MsgMetaData3[];

    constructor() {
        this.subscriberList = [];
        this.pendingACK = [];
    }

    public registerSubscriber(s : Subscriber3) {
        this.subscriberList.push(s);
        console.log("registered subID : " + s.getId());
    }

    public unregisterSubscriber(s : Subscriber3) {
        for(var i = 0; i < this.subscriberList.length; i++) {
            if(s === this.subscriberList[i]) {
                this.subscriberList.splice(i, 1);
            }
        }
        console.log("unregistered subID : " + s.getId());
    }

    public async notifySubscriberList(msg : Message3) {
        console.log("notifying subs, msgID : " + msg.getValue());
        for(var i = 0; i < this.subscriberList.length; i++) {
            this.notifySubscriber(this.subscriberList[i], msg);
        }
    }

    public async notifySubscriber(s : Subscriber3, msg : Message3) {
        var pACK = new MsgMetaData3(s.getId(), msg.getValue());
        this.pendingACK.push(pACK);
        s.receive(msg, this);

        var noResponse = true;
        var counter = 0;

        while(noResponse) {
            
            if(counter == 3) {
                counter = 0;
                s.receive(msg, this);
            }

            console.log("waiting for ACK from subscriber " + s.getId())
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 500)
              });

            await promise;

            noResponse = false;
            for(var i = 0; i < this.pendingACK.length; i++) {
                if(this.pendingACK[i].getSubId() == s.getId() && 
                this.pendingACK[i].getMsgId() == msg.getValue()) {
                    noResponse = true;
                    counter++;
                    break;
                }
            }

        }

        console.log("processed ACK from subscriber " + s.getId() + ", msgID : " + msg.getValue());

    }

    public receiveACK(subId : number, msgId : number) {
        console.log("receive ACK subID: " + subId + ", msgID : " + msgId);
        for(var i = 0; i < this.pendingACK.length; i++) {
            var pACK = this.pendingACK[i]
            if(pACK.getMsgId() == msgId && pACK.getSubId() == subId) {
                this.pendingACK.splice(i, 1);
                break;
            }
        }
    }
}

class MsgMetaData3 {
    private subId : number;
    private msgId : number;

    constructor(subId : number, msgId : number) {
        this.msgId = msgId;
        this.subId = subId;
    }

    public getMsgId() : number {
        return this.msgId;
    }

    public getSubId() : number {
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
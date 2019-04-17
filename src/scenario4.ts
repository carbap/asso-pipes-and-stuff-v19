import { promises } from "fs";

/*
interface AsyncQueue<T> {
    enqueue(): void
    dequeue(): Promise<T>
}

interface AsyncSemaphore {
    signal(): void
    wait(): Promise<void>
}

interface BoundedAsyncQueue<T> {
    enqueue(message : T): Promise<void>
    dequeue(): Promise<T>
}*/

class Queue4 {
    
    public queue : Array<Message>;
    public size : number;
    public semaphore : Semaphore4;

    constructor(size : number){
        this.queue = new Array<Message>();
        this.size = size;
        this.semaphore = new Semaphore4(this.size);
    }
    
    // private unresolvedPromisses : Array();

    enqueue(message: Message): void {
        this.semaphore.waitPush();
        this.queue.push(message);
        this.semaphore.signalPush();
        console.log(this.queue);
    }

    dequeue(): Message {
        this.semaphore.waitPull();
        let message = this.queue.shift();
        this.semaphore.signalPull();
        return message;
    }
}

class Semaphore4 {
    
    public currentSize : number;
    public maxSize: number;

    constructor(size : number){
        this.currentSize = 0;
        this.maxSize = size;
    }

    signalPush(): void {
        this.currentSize++;
    }
    signalPull(): void {
        this.currentSize--;
    }  
    async waitPush(): Promise<void> {
        console.log("current size " + this.currentSize + " max size: " + this.maxSize)
        while(this.currentSize == this.maxSize) {
            console.log("waiting for free space to push message")
            var promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 1000)
            });

            await promise;
        }

        console.log("aaaaa")
    }
    async waitPull(): Promise<void> {
        while(this.currentSize == 0) {

            console.log("waiting for message to pull")
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 1000)
            });

            await promise;
        }
    }
}

class Publisher {

    public queue : Queue4;

    constructor(queue : Queue4){
        this.queue = queue;
    }

    async write(message : Message){
        this.queue.enqueue(message);
        console.log(message.content + " - written to queue");
    }

}

class Subscriber {

    public tags : Array<number>;

    constructor(tags : Array<number>){
        this.tags = tags;
    }

}

class Broker {

}


class Message {
    public tag : number;
    public content : string;

    constructor(tag : number, content : string){
        this.tag = tag;
        this.content = content;
    }
}

setInterval(() => { }, 1000); // run program until explicit exit

(async () => {
    
    var queue1 : Queue4 = new Queue4(3);
    var publisher1 : Publisher = new Publisher(queue1);

    var message1 : Message = new Message(1, "message1");
    var message2 : Message = new Message(1, "message2");
    var message3 : Message = new Message(1, "message3");
    var message4 : Message = new Message(1, "message4");

    publisher1.write(message1);

    publisher1.write(message2);

    publisher1.write(message3);

    publisher1.write(message4);

    var message = await publisher1.queue.dequeue()
    console.log(message.content);

    //setTimeout(resolve, 5000);
    

    process.exit()
})()


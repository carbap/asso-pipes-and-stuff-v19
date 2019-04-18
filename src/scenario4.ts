class Publisher4 {

    public queue : BoundedAsyncQueue;

    constructor(maxQueueSize : number){
        this.queue = new BoundedAsyncQueue(maxQueueSize);
    }

    async write(message : Message4){
        await this.queue.enqueue(message);
        console.log(message.content + " - published (tag: " + message.tag + ")");
    }
}

class Subscriber4 {

    public tags : Array<number>;
    public queue : BoundedAsyncQueue;

    constructor(tags : Array<number>, maxQueueSize: number){
        this.tags = tags;
        this.queue = new BoundedAsyncQueue(maxQueueSize);
    }

    async read(){
        let message = await this.queue.dequeue("subscriber");
        console.log(message.content + " - read (tag: " + message.tag + ")");
    }
}

class Broker {
    private publishers: Array<Publisher4>;
    private subscribers: Array<Subscriber4>;

    constructor(publishers: Array<Publisher4>, subscribers: Array<Subscriber4>) {
        this.publishers = publishers;
        this.subscribers = subscribers;
    }

    public async deliverMessage(promise : Promise<Message4>) {
        let message = await promise;
        console.log("Broker read: " + message.content + ", " + message.tag);
        for(let sub of this.subscribers){
            if(sub.tags.includes(message.tag)){
                sub.queue.enqueue(message);
            }
        }

    }

    public async work() {
        while(true) {
            //console.log("Fetching promises from publishers");
            for(let pub of this.publishers)
            {
                let promise = pub.queue.dequeue("broker");
                this.deliverMessage(promise);
            }

            let delayPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    //console.log("Broker is resting for 1 sec");
                    resolve();
                }, 1000);
            });
            await delayPromise;
        }
    }
}

class Message4 {
    public tag : number;
    public content : string;

    constructor(tag : number, content : string){
        this.tag = tag;
        this.content = content;
    }
}

class BoundedAsyncQueue {
    
    public queue : Array<Message4>;
    public semaphore : AsyncSemaphore ;

    constructor(size : number){
        this.queue = new Array<Message4>();
        this.semaphore = new AsyncSemaphore (size);
    }

    async enqueue(message: Message4) {
        //console.log("checking if enqueue is possible");
        await this.semaphore.waitPush();
        //console.log("enqueue will proceed");
        this.queue.push(message);
        this.semaphore.signalPush();
        //console.log(this.queue);
    }

    async dequeue(order : String): Promise<Message4> {
        //console.log("checking if dequeue is possible");
        await this.semaphore.waitPull(order);

        //console.log("DEQUEUE ordered by " + order + ", current );
        let message = this.queue.shift() || new Message4(1, "error message");
        //console.log("DEQUED MESSAGE: (" + message.content + ", " + message.tag + "), ordered by " + order + ", remaining queue: " + this.queue);
        this.semaphore.signalPull();
        return message;
    }
}

class AsyncSemaphore  {
    
    public currentSize : number;
    public emptySize : number;
    public maxSize : number;

    constructor(size : number){
        this.currentSize = 0;
        this.emptySize = size;
        this.maxSize = size;
    }

    signalPush(): void {
        this.emptySize--;
        //console.log("Push has been made - queue size has been incremented");
    }

    signalPull(): void {
        this.currentSize--;
        //console.log("Pull has been made - queue size has been diminished");
    } 

    async waitPush(): Promise<void> {
        while(this.currentSize >= this.maxSize) { 
            //console.log("waiting for free space to push message");
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    //console.log("done waiting for free space for one second");
                    resolve();
                }, 1000);
            });
            await promise;
        }
        this.currentSize++;
    }

    async waitPull(order: String): Promise<void> {
        while(this.emptySize >= this.maxSize) { 
            //console.log(order + "is waiting for a message to pull");
            var promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    //console.log(order + "done waiting for a message for one second");
                    resolve();
                }, 1000);
            });
            await promise;
        }
        this.emptySize++;
        //console.log(order + "CAN DEQUEUE");
    }
}

async function produce(publishers: Array<Publisher4>) {
    while(true) {
        for(let pub of publishers){
            let tag = Math.floor(Math.random() * 3) + 1;
            let content = Math.random().toString(36).substring(7);
            let message = new Message4(tag, content);
            pub.write(message);
        }

        let delayPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                //console.log("Publishers are stoping for 3 seconds");
                resolve();
            }, 3000);
        });
        await delayPromise;
    }
}

async function consume(subscribers: Array<Subscriber4>) {
    while(true) {
        for(let sub of subscribers){
            sub.read();
        }

        let delayPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                //console.log("Subscribers are stoping for 0.5 seconds");
                resolve();
            }, 500);
        });
        await delayPromise;
    }
}

setInterval(() => { }, 1000); // run program until explicit exit

(async () => {
    
    var p1 : Publisher4 = new Publisher4(3);
    var p2 : Publisher4 = new Publisher4(3);
    var p3 : Publisher4 = new Publisher4(3);
    var p4 : Publisher4 = new Publisher4(3);
    let publishers = [p1, p2, p3, p4];

    var s1 : Subscriber4 = new Subscriber4([1], 5);
    var s2 : Subscriber4 = new Subscriber4([2], 5);
    var s3 : Subscriber4 = new Subscriber4([3], 5);
    let subscribers = [s1, s2, s3];

    produce(publishers);

    let broker = new Broker(publishers, subscribers);
    broker.work();

    consume(subscribers);

    let delayPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Test finished");
            resolve();
        }, 5000);
    });
    await delayPromise;
    //await s.read();
    //console.log("se isto não aparecer, é porque ainda esta à espera que mensagens aparecam para ler");
    

    /*var message = await p.queue.dequeue()
    console.log(message.content);*/

    //setTimeout({}, 5000);
    

    process.exit()
})()

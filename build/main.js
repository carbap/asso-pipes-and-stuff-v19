"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Message {
    constructor(value) {
        this.value = value;
    }
}
Message.none = new Message(null);
// class Concatenate implements Filter{
//     constructor(public readonly a: Filter, public readonly b: Filter) { }
//     do(): Message {
//         return new Message(this.a.do().value.toString() + this.b.do().value.toString())
//     }
// }
// class ConstantString implements Filter {
//     constructor(public readonly c: string) {}
//     do(): Message {
//         return new Message(this.c)
//     }
// }
class ToUpperCase {
    constructor(f) {
        this.f = f;
    }
    next() {
        return new Message(this.f.next().value.toUpperCase());
    }
    hasNext() {
        return this.f.hasNext();
    }
}
class Writer {
    constructor(f) {
        this.f = f;
    }
    next() {
        console.log(this.f.next().value.toString());
        return Message.none;
    }
    hasNext() {
        return this.f.hasNext();
    }
}
class FileLineReader {
    constructor(fileName) {
        this.fileName = fileName;
        this.lines = fs_1.readFileSync(fileName, 'utf-8').split('\n');
    }
    next() {
        return new Message(this.lines.shift());
    }
    hasNext() {
        return this.lines.length > 0;
    }
}
class SlowFileLineReader extends FileLineReader {
    constructor(fileName) {
        super(fileName);
        this.fileName = fileName;
    }
    delay(millis) {
        const date = new Date();
        let curDate = null;
        do {
            curDate = new Date();
        } while (curDate.getTime() - date.getTime() < millis);
    }
    next() {
        this.delay(2000);
        return new Message(this.lines.shift());
    }
}
class Join {
    constructor(...fs) {
        this.currentFilter = 0;
        this.fs = fs;
    }
    next() {
        const f = this.fs[this.currentFilter];
        this.currentFilter = (this.currentFilter + 1) % this.fs.length;
        if (f.hasNext())
            return f.next();
        else
            return this.next();
    }
    hasNext() {
        return this.fs.filter(f => f.hasNext()).length > 0;
    }
}
function iterate(f) {
    while (f.hasNext()) {
        f.next();
    }
}
const f1 = new SlowFileLineReader('./best15.txt');
const f2 = new FileLineReader('./best-mieic.txt');
const r1 = new Writer(new ToUpperCase(new Join(f1, f2)));
iterate(r1);
//# sourceMappingURL=main.js.map
import { clamp } from "./util";

export class History {
    index: number;
    a: any;

    constructor() {
        this.index = 0;
        this.a = [];
        this.clear();
    }

    clear() {
        this.a = [];
        this.index = 0;
    }

    push(data: any) {
        if (this.index < this.a.length - 1) {
            this.fork();
        }
        this.index = this.a.length;
        this.a = this.a.slice(0, this.index);
        this.a.push(this.copy(data));

        if (this.a.length > 20) {
            this.a.shift();
        }
    }

    fork() {
        this.a = this.a.slice(0, this.index + 1);
    }

    pop() {
        return this.a.pop();
    }

    prev() {
        this.index = clamp(this.index - 1, 0, this.a.length - 1);
        return this.copy(this.a[this.index]);
    }

    next() {
        this.index = clamp(this.index + 1, 0, this.a.length - 1);
        return this.copy(this.a[this.index]);
    }

    copy(data: any) {
        return data ? JSON.parse(JSON.stringify(data)) : [];
    }
}
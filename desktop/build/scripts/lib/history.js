"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
var util_1 = require("./util");
var History = /** @class */ (function () {
    function History() {
        this.index = 0;
        this.a = [];
        this.clear();
    }
    History.prototype.clear = function () {
        this.a = [];
        this.index = 0;
    };
    History.prototype.push = function (data) {
        if (this.index < this.a.length - 1) {
            this.fork();
        }
        this.index = this.a.length;
        this.a = this.a.slice(0, this.index);
        this.a.push(this.copy(data));
        if (this.a.length > 20) {
            this.a.shift();
        }
    };
    History.prototype.fork = function () {
        this.a = this.a.slice(0, this.index + 1);
    };
    History.prototype.pop = function () {
        return this.a.pop();
    };
    History.prototype.prev = function () {
        this.index = util_1.clamp(this.index - 1, 0, this.a.length - 1);
        return this.copy(this.a[this.index]);
    };
    History.prototype.next = function () {
        this.index = util_1.clamp(this.index + 1, 0, this.a.length - 1);
        return this.copy(this.a[this.index]);
    };
    History.prototype.copy = function (data) {
        return data ? JSON.parse(JSON.stringify(data)) : [];
    };
    return History;
}());
exports.History = History;

"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function Loop() {
    this.is_active = false;
    this.x = 0;
    this.width = 0;
    this.y = 0;
    this.height = 0;
    this.reset = function () {
        this.x = 0;
        this.width = 15;
        this.y = marabu.selection.track;
        this.height = 0;
    };
    this.start = function () {
        marabu.cheatcode.stop();
        this.is_active = true;
        this.reset();
        marabu.update();
        marabu.controller.set("loop");
    };
    this.stop = function () {
        this.is_active = false;
        marabu.stop();
        this.reset();
        marabu.update();
        marabu.controller.set("default");
    };
    this.mod = function (m) {
        this.height = clamp(this.height + m, 0, (marabu.song.length - this.y) + 3);
        marabu.update();
    };
    this.buffer = [];
    this.copy = function () {
        this.buffer = [];
        for (var i = 0; i < 16; i++) {
            this.buffer[i] = marabu.song.song().songData[i].p.slice(this.y, this.y + this.height + 1);
        }
        this.stop();
    };
    this.paste = function () {
        var _a;
        for (var i = 0; i < 16; i++) {
            (_a = marabu.song.song().songData[i].p).splice.apply(_a, __spreadArrays([this.y, 0], this.buffer[i]));
        }
        marabu.history.push(marabu.song.song());
        this.stop();
    };
    this.cut = function () {
        // Copy
        this.buffer = [];
        for (var i = 0; i < 16; i++) {
            this.buffer[i] = marabu.song.song().songData[i].p.slice(this.y, this.y + this.height + 1);
        }
        // Erase
        for (var y = this.y; y < this.y + (this.height + 1); y++) {
            for (var i = 0; i < 16; i++) {
                marabu.song.song().songData[i].p[y] = 0;
            }
        }
        marabu.history.push(marabu.song.song());
        this.stop();
    };
    this.erase = function () {
        for (var i = 0; i < 16; i++) {
            marabu.song.song().songData[i].p.splice(this.y, this.height + 1);
        }
        marabu.history.push(marabu.song.song());
        this.stop();
    };
    this.solo = function () {
        this.x = marabu.selection.instrument;
        this.width = 0;
        this.y = marabu.selection.track;
        this.height = 0;
        marabu.update();
    };
    this.play = function () {
        this.is_active = false;
        marabu.song.play_loop(this.range());
    };
    this.range = function () {
        return {
            firstCol: this.x,
            lastCol: this.x + this.width,
            firstRow: this.y,
            lastRow: this.y + this.height
        };
    };
    this.render = function () {
        this.stop();
        marabu.song.export_wav(this.range());
    };
    this.set_height = function (mod) {
        this.height = mod;
        marabu.update();
    };
}
module.exports = Loop;

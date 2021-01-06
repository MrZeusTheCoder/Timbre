"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_json = exports.to_hex_val = exports.to_hex = exports.hex_to_int = exports.prepend_to_length = exports.parse_note = exports.clamp = exports.calcSamplesPerRow = void 0;
function calcSamplesPerRow(bpm) {
    return Math.round((60 * 44100 / 4) / bpm);
}
exports.calcSamplesPerRow = calcSamplesPerRow;
;
function clamp(val, min, max) {
    val = val < min ? min : val;
    val = val > max ? max : val;
    return val;
}
exports.clamp = clamp;
function parse_note(val) {
    val -= 87;
    if (val < 0) {
        val += 87;
    }
    var keyboard = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var notes = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
    var octave = Math.floor((val) / 12);
    var key = notes[(val) % 12];
    var key_sharp = key.substr(1, 1) == "#" ? true : false;
    var key_note = key.substr(0, 1);
    var offset = keyboard.indexOf(key_note);
    var distance = (keyboard.length * octave) + offset;
    return { id: val, octave: octave, sharp: key_sharp, note: key_note, offset: offset, distance: distance };
}
exports.parse_note = parse_note;
function prepend_to_length(str, length, fill) {
    if (length === void 0) { length = 4; }
    if (fill === void 0) { fill = "0"; }
    var str = str + "";
    var offset = length - str.length;
    if (offset == 1) {
        return fill + str;
    }
    else if (offset == 2) {
        return fill + fill + str;
    }
    else if (offset == 3) {
        return fill + fill + fill + str;
    }
    else if (offset == 4) {
        return fill + fill + fill + fill + str;
    }
    return str;
}
exports.prepend_to_length = prepend_to_length;
function hex_to_int(hex) {
    var hex = hex.toLowerCase();
    if (parseInt(hex) > 0) {
        return parseInt(hex);
    }
    if (hex == "a") {
        return 10;
    }
    if (hex == "b") {
        return 11;
    }
    if (hex == "c") {
        return 12;
    }
    if (hex == "d") {
        return 13;
    }
    if (hex == "e") {
        return 14;
    }
    if (hex == "f") {
        return 15;
    }
    return 0;
}
exports.hex_to_int = hex_to_int;
function to_hex(num, count) {
    if (count === void 0) { count = 1; }
    var s = num.toString(16).toUpperCase();
    for (var i = 0; i < (count - s.length); ++i) {
        s = "0" + s;
    }
    return s;
}
exports.to_hex = to_hex;
;
function to_hex_val(num) {
    if (num < 10) {
        return "" + num;
    }
    var l = ["a", "b", "c", "d", "e", "f"];
    return l[(num - 10) % l.length];
}
exports.to_hex_val = to_hex_val;
function is_json(text) {
    try {
        JSON.parse(text);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.is_json = is_json;

import { stringify } from "querystring";

export function calcSamplesPerRow(bpm) {
    return Math.round((60 * 44100 / 4) / bpm);
};

export function clamp(val: number, min: number, max: number) {
    val = val < min ? min : val;
    val = val > max ? max : val;
    return val;
}

export function parse_note(val: string) {
    val -= 87;
    if (val < 0) { val += 87; }
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

export function prepend_to_length(str: string, length: number = 4, fill: string = "0") {
    var str = str + "";

    var offset = length - str.length;

    if (offset == 1) { return fill + str; }
    else if (offset == 2) { return fill + fill + str; }
    else if (offset == 3) { return fill + fill + fill + str; }
    else if (offset == 4) { return fill + fill + fill + fill + str; }

    return str
}

export function hex_to_int(hex: string) {
    var hex = hex.toLowerCase();
    if (parseInt(hex) > 0) { return parseInt(hex); }
    if (hex == "a") { return 10; }
    if (hex == "b") { return 11; }
    if (hex == "c") { return 12; }
    if (hex == "d") { return 13; }
    if (hex == "e") { return 14; }
    if (hex == "f") { return 15; }
    return 0;
}

export function to_hex(num: number, count: number = 1) {
    var s = num.toString(16).toUpperCase();
    for (var i = 0; i < (count - s.length); ++i) {
        s = "0" + s;
    }
    return s;
};

export function to_hex_val(num: number) {
    if (num < 10) { return "" + num; }
    var l = ["a", "b", "c", "d", "e", "f"];
    return l[(num - 10) % l.length];
}

export function is_json(text: string) {
    try {
        JSON.parse(text);
        return true;
    }
    catch (error) {
        return false;
    }
}

export function last_non_zero_index(array: number[]): number {
    for(var i = array.length - 1; i >= 0; i--){
        if(array[i] != 0){
            return i;
        } else {
            continue;
        }
    }
    return -1;
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Theme = void 0;
var electron_1 = require("electron");
var util_1 = require("./util");
var Theme = /** @class */ (function () {
    function Theme() {
        this.active_theme = Theme.default_theme;
        el = document.createElement("style");
    }
    Theme.prototype.start = function () {
        this.load(localStorage.theme ? localStorage.theme : this.default, this.default);
        window.addEventListener('dragover', this.drag_enter);
        window.addEventListener('drop', this.drag);
        document.head.appendChild(this.el);
    };
    Theme.prototype.load = function (t, fall_back) {
        var theme = util_1.is_json(t) ? JSON.parse(t).data : t.data;
        if (!theme || !theme.background) {
            if (fall_back) {
                theme = fall_back.data;
            }
            else {
                return;
            }
        }
        var css = "\n    :root {\n      --background: " + theme.background + ";\n      --f_high: " + theme.f_high + ";\n      --f_med: " + theme.f_med + ";\n      --f_low: " + theme.f_low + ";\n      --f_inv: " + theme.f_inv + ";\n      --b_high: " + theme.b_high + ";\n      --b_med: " + theme.b_med + ";\n      --b_low: " + theme.b_low + ";\n      --b_inv: " + theme.b_inv + ";\n    }";
        this.active = theme;
        this.el.textContent = css;
        localStorage.setItem("theme", JSON.stringify({ data: theme }));
    };
    Theme.prototype.reset = function () {
        this.load(this.default);
    };
    Theme.prototype.drag_enter = function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };
    Theme.prototype.drag = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var file = e.dataTransfer.files[0];
        if (!file.name || !file.name.indexOf(".thm") < 0) {
            console.log("Theme", "Not a theme");
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            electron_1.app.load(e.target.result);
        };
        reader.readAsText(file);
    };
    Theme.default_theme = { meta: {}, data: { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#000", b_high: "#000", b_med: "#affec7", b_low: "#000", b_inv: "#affec7" } };
    return Theme;
}());
exports.Theme = Theme;
module.exports = Theme;

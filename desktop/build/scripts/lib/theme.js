"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Theme = void 0;
var util_1 = require("./util");
var Theme = /** @class */ (function () {
    function Theme() {
        this.active_theme = Theme.default_theme;
        this.el = document.createElement("style");
    }
    Theme.prototype.start = function () {
        this.load(localStorage.theme ? localStorage.theme : Theme.default_theme);
        window.addEventListener('dragover', this.drag_enter);
        window.addEventListener('drop', this.drag);
        document.head.appendChild(this.el);
    };
    Theme.prototype.load_theme = function (theme) {
        var t = theme.data;
        var css = "\n        :root {\n        --background: " + t.background + ";\n        --f_high: " + t.f_high + ";\n        --f_med: " + t.f_med + ";\n        --f_low: " + t.f_low + ";\n        --f_inv: " + t.f_inv + ";\n        --b_high: " + t.b_high + ";\n        --b_med: " + t.b_med + ";\n        --b_low: " + t.b_low + ";\n        --b_inv: " + t.b_inv + ";\n        }";
        this.active_theme = theme;
        this.el.textContent = css;
        localStorage.setItem("theme", JSON.stringify(theme));
    };
    Theme.prototype.load = function (theme) {
        var t = null;
        if (util_1.is_json(theme)) {
            t = JSON.parse(theme);
        }
        else {
            console.error("Error loading theme: ", theme);
            return;
        }
        var json_valid = this.json_is_theme(t);
        if (!json_valid[0]) {
            console.error("Theme missing: ", json_valid[1]);
            return;
        }
        else {
            this.load_theme(t);
        }
    };
    Theme.prototype.reset = function () {
        this.load_theme(Theme.default_theme);
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
        if (!file.name || !(file.name.indexOf(".thm") < 0)) {
            console.log("Theme", "Not a theme");
            return;
        }
        var reader = new FileReader();
        var this_theme = this;
        reader.onload = function (e) {
            var _a;
            var result = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            if (result == null) {
                return;
            }
            if (result instanceof ArrayBuffer) {
                return;
            }
            this_theme.load(result);
        };
        reader.readAsText(file);
    };
    Theme.prototype.json_is_theme = function (t) {
        if (!("background" in t)) {
            return [false, "background"];
        }
        var colour_depths = [
            "high",
            "med",
            "low",
            "inv"
        ];
        for (var x in colour_depths) {
            if (!("f_" + x in t)) {
                return [false, "f_" + x];
            }
            else if (!("b_" + x in t)) {
                return [false, "f_" + x];
            }
            else {
                continue;
            }
        }
        return [true, "clean"];
    };
    Theme.default_theme = { meta: {}, data: { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#000", b_high: "#000", b_med: "#affec7", b_low: "#000", b_inv: "#affec7" } };
    return Theme;
}());
exports.Theme = Theme;

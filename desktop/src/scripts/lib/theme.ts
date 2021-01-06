import { app } from "electron";
import { is_json } from "./util";

export interface ThemeMetadata {
    author?: string;
    version?: number;
    revision?: number;
}

export interface ThemeData {
    background?: string;
    f_high?: string;
    f_med?: string;
    f_low?: string;
    f_inv?: string;
    b_high?: string;
    b_med?: string;
    b_low?: string;
    b_inv?: string;
}

export interface ThemeJSON {
    meta?: ThemeMetadata;
    data: ThemeData;
}

export class Theme {
    static readonly default_theme: ThemeJSON = { meta: {}, data: { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#000", b_high: "#000", b_med: "#affec7", b_low: "#000", b_inv: "#affec7" } };
    el: any;
    active_theme: ThemeJSON;

    constructor() {
        this.active_theme = Theme.default_theme;
        el = document.createElement("style");
    }

    start() {
        this.load(localStorage.theme ? localStorage.theme : this.default, this.default);
        window.addEventListener('dragover', this.drag_enter);
        window.addEventListener('drop', this.drag);
        document.head.appendChild(this.el)
    }

    load(t, fall_back) {
        var theme = is_json(t) ? JSON.parse(t).data : t.data;

        if (!theme || !theme.background) {
            if (fall_back) {
                theme = fall_back.data;
            } else {
                return;
            }
        }

        var css = `
    :root {
      --background: ${theme.background};
      --f_high: ${theme.f_high};
      --f_med: ${theme.f_med};
      --f_low: ${theme.f_low};
      --f_inv: ${theme.f_inv};
      --b_high: ${theme.b_high};
      --b_med: ${theme.b_med};
      --b_low: ${theme.b_low};
      --b_inv: ${theme.b_inv};
    }`;

        this.active = theme;
        this.el.textContent = css;
        localStorage.setItem("theme", JSON.stringify({ data: theme }));
    }

    reset() {
        this.load(this.default);
    }

    drag_enter(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    drag(e) {
        e.preventDefault();
        e.stopPropagation();

        var file = e.dataTransfer.files[0];

        if (!file.name || !file.name.indexOf(".thm") < 0) { console.log("Theme", "Not a theme"); return; }

        var reader = new FileReader();
        reader.onload = function (e) {
            app.load(e.target.result);
        };
        reader.readAsText(file);
    }
}

module.exports = Theme;
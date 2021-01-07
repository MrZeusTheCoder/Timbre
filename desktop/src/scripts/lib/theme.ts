import { app, Event } from "electron";
import { TextEncoder } from "util";
import { is_json } from "./util";

export interface ThemeMetadata {
    author?: string;
    version?: number;
    revision?: number;
}

export interface ThemeData {
    background: string;
    f_high: string;
    f_med: string;
    f_low: string;
    f_inv: string;
    b_high: string;
    b_med: string;
    b_low: string;
    b_inv: string;
}

export interface ThemeJSON {
    meta?: ThemeMetadata;
    data: ThemeData;
}

export class Theme {
    static readonly default_theme_json: ThemeJSON = { meta: {}, data: { background: "#222", f_high: "#fff", f_med: "#777", f_low: "#444", f_inv: "#000", b_high: "#000", b_med: "#affec7", b_low: "#000", b_inv: "#affec7" } };
    static readonly default_theme: Theme = new Theme(Theme.default_theme_json);
    el: HTMLStyleElement;
    active_theme: ThemeJSON;

    constructor(t?: ThemeJSON) {
        this.active_theme = Theme.default_theme_json;
        this.el = document.createElement("style");
        
        if(t){
            this.load_theme(t);
        }
    }

    start() {
        this.load(localStorage.theme ? localStorage.theme : Theme.default_theme_json);
        window.addEventListener('dragover', this.drag_enter);
        window.addEventListener('drop', this.drag);
        document.head.appendChild(this.el)
    }

    load_theme(theme: ThemeJSON) {
        var t: ThemeData = theme.data;
        var css = `
        :root {
        --background: ${t.background};
        --f_high: ${t.f_high};
        --f_med: ${t.f_med};
        --f_low: ${t.f_low};
        --f_inv: ${t.f_inv};
        --b_high: ${t.b_high};
        --b_med: ${t.b_med};
        --b_low: ${t.b_low};
        --b_inv: ${t.b_inv};
        }`;

        this.active_theme = theme;
        this.el.textContent = css;
        localStorage.setItem("theme", JSON.stringify(theme));
    }

    load(theme: string){
        var t = null;
        if(is_json(theme)){
            t = JSON.parse(theme);
        } else {
            console.error("Error loading theme: ", theme);
            return;
        }

        var json_valid: [boolean, string] = this.json_is_theme(t);
        if(!json_valid[0]){
            console.error("Theme missing: ", json_valid[1]);
            return;
        } else {
            this.load_theme(t as ThemeJSON);
        }
    }

    reset() {
        this.load_theme(Theme.default_theme_json);
    }

    drag_enter(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'copy';
    }

    drag(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();

        var file = e.dataTransfer!.files[0];

        if (!file.name || !(file.name.indexOf(".thm") < 0)) {
            console.log("Theme", "Not a theme");
            return;
        }

        var reader = new FileReader();
        var this_theme = this;
        reader.onload = function (e) {
            let result = e.target?.result;
            if (result == null) { return; }
            if (result instanceof ArrayBuffer) { return; }
            this_theme.load(result);
        };
        reader.readAsText(file);
    }

    json_is_theme(t: any): [boolean, string] {
        if (!("background" in t)) {
            return [false, "background"];
        }

        var colour_depths: string[] = [
            "high",
            "med",
            "low",
            "inv"
        ]

        for (var x in colour_depths) {
            if (!(`f_${x}` in t)) {
                return [false, `f_${x}`];
            } else if (!(`b_${x}` in t)) {
                return [false, `f_${x}`];
            } else {
                continue;
            }
        }

        return [true, "clean"];
    }
}
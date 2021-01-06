function UI_Switch(data) {
    var app = marabu;
    var self = this;

    this.family = null;
    this.id = data.id;
    this.storage = 0;

    this.name_left = data.name_left;
    this.name_right = data.name_right;

    this.control = 0;
    this.percent = data.percent;

    this.value = false;

    this.el = document.createElement("div");
    this.name_left_el = document.createElement("t");
    this.name_right_el = document.createElement("t");
    //Left, right; On, off; Mono, poly; etc. Thus, selection.
    this.selection_el = document.createElement("div"); this.selection_el.className = "slide";

    this.install = function (parent) {
        this.el.className = "control slider";

        // Name Left Span
        this.name_left_el.className = "name";
        this.name_left_el.innerHTML = this.name_left;

        // Name Right Input
        this.name_right_el.className = "name";
        this.name_right_el.textContent = this.name_right;

        this.el.appendChild(this.name_left_el);
        this.el.appendChild(this.selection_el);
        this.el.appendChild(this.name_right_el);

        this.el.addEventListener("mousedown", this.mouse_down, false);

        parent.appendChild(this.el);
        this.storage = marabu.instrument.get_storage(this.family + "_" + this.id);
    }

    this.set_value = function (v) {
        if (v == null) {
            console.log("Missing control value for ", this.family + "." + this.id);
            return;
        }

        this.value = v;
        this.update();
    }

    this.save = function () {
        marabu.song.inject_control(marabu.selection.instrument, this.storage, this.value);
    }

    this.last_keyframe = function () {
        var i = app.selection.instrument;
        var f = this.storage;
        for (let t = app.selection.track; t >= 0; t--) {
            //var r = app.selection.track == t ? app.selection.row : 32;
            for (let r = app.selection.row; r >= 0; r--) {
                var cmd = app.song.effect_at(i, t, r)
                if (cmd == f + 1) {
                    return app.song.effect_value_at(i, t, r);
                }
            }
        }

        return null;
    }

    this.update = function () {
        var keyframe = this.last_keyframe();

        var c = ""
        c = 'slider control '
        c += app.selection.control == this.control ? 'selected ' : '';
        c += keyframe ? 'keyframed ' : '';
        c += this.value == this.min ? 'min ' : ''
        c += this.value == this.max ? 'max ' : ''

        this.el.className = c;
        this.selection_el.textContent = "-- --";
        this.update_display(perc);
    }

    this.update_display = function (perc) {
        var html = ""
        var c = 0;
        while (c < perc * 80) {
            html += "-"
            c += 10;
        }
        html = `<t class='fg'>${html}</t>`
        while (c < 80) {
            html += "-"
            c += 10
        }
        this.selection_el.innerHTML = `${html}`
    }

    this.mouse_down = function (e) {
        app.selection.control = self.control;
        app.update();
    }
}

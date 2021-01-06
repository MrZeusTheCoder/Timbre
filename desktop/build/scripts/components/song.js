"use strict";
var CAudioTimer = require('../lib/audio/timer.js');
var CJammer = require('../lib/audio/jammer.js');
var CPlayer = require('../lib/audio/player.js');
var Track = require('./track.js');
function Song() {
    var MAX_SONG_ROWS = 32, MAX_PATTERNS = 32;
    // Resources
    var mSong = {};
    var mAudio = null;
    var mAudioTimer = new CAudioTimer();
    var mPlayer = new CPlayer();
    var mJammer = new CJammer();
    this.mAudio = function () { return mAudio; };
    this.mAudio_timer = function () { return mAudioTimer; };
    this.mJammer = mJammer;
    var mPreload = [];
    //--------------------------------------------------------------------------
    // Song import/export functions
    //--------------------------------------------------------------------------
    this.player = function () {
        return mPlayer;
    };
    this.get_bpm = function () {
        return Math.round((60 * 44100 / 4) / mSong.rowLen);
    };
    this.update_bpm = function (bpm) {
        console.log(bpm);
        mSong.rowLen = calcSamplesPerRow(bpm);
        mJammer.updateRowLen(mSong.rowLen);
    };
    this.update_rpp = function (rpp) {
        setPatternLength(rpp);
        marabu.update();
    };
    this.play_note = function (note) {
        mJammer.addNote(note + 87);
    };
    this.song = function () {
        return mSong;
    };
    this.to_string = function () {
        return JSON.stringify(this.song());
    };
    this.replace_song = function (new_song) {
        if (!new_song.name) {
            return;
        }
        stopAudio();
        mSong = new_song;
        this.update_bpm(mSong.bpm ? mSong.bpm : 120);
        this.update_rpp(32);
        // Inject names
        for (id in this.song().songData) {
            var ins = this.song().songData[id];
            ins.name = ins.name && ins.name.length > 3 ? ins.name.substr(0, 4) : "INS" + to_hex_val(id).toUpperCase();
        }
        updateSongRanges();
    };
    this.mJammer_update = function () {
        return mJammer.updateInstr(this.instrument().i);
    };
    this.instrument = function (id) {
        if (id === void 0) { id = marabu.selection.instrument; }
        return this.song().songData[id];
    };
    //
    this.pattern_at = function (i, t) {
        return this.song().songData[i].p[t];
    };
    this.inject_pattern_at = function (i, t, v) {
        this.song().songData[i].p[t] = v;
        this.update_ranges();
        marabu.update();
    };
    this.note_at = function (i, t, n) {
        var c = this.pattern_at(i, t) - 1;
        if (c == -1) {
            return;
        }
        return this.song().songData[i].c[c].n[n];
    };
    this.inject_note_at = function (i, t, n, v) {
        var c = this.pattern_at(i, t) - 1;
        if (c == -1) {
            return;
        }
        this.song().songData[i].c[c].n[n] = (v == -87 ? 0 : clamp(v, 36, 107) + 87);
    };
    this.effect_at = function (i, t, f) {
        var c = this.pattern_at(i, t) - 1;
        if (c == -1) {
            return;
        }
        return this.song().songData[i].c[c].f[f];
    };
    this.effect_value_at = function (i, t, f) {
        var c = this.pattern_at(i, t) - 1;
        if (c == -1) {
            return;
        }
        return this.song().songData[i].c[c].f[f + 32];
    };
    this.inject_effect_at = function (i, t, f, cmd, val) {
        if (!cmd || val === undefined) {
            return;
        }
        var c = this.pattern_at(i, t) - 1;
        if (c == -1) {
            return;
        }
        this.song().songData[i].c[c].f[f] = cmd;
        this.song().songData[i].c[c].f[f + 32] = val;
    };
    this.erase_effect_at = function (i, t, f) {
        var c = this.pattern_at(i, t) - 1;
        if (c == -1) {
            return;
        }
        this.song().songData[i].c[c].f[f] = 0;
        this.song().songData[i].c[c].f[f + 32] = 0;
    };
    this.control_at = function (i, s) {
        return this.song().songData[i].i[s];
    };
    this.inject_control = function (i, s, v) {
        this.song().songData[i].i[s] = v;
        this.mJammer_update();
    };
    function setPatternLength(length) {
        if (mSong.patternLen === length)
            return;
        stopAudio();
        var i, j, k, col, notes, fx;
        for (i = 0; i < 8; i++) {
            for (j = 0; j < MAX_PATTERNS; j++) {
                col = mSong.songData[i].c[j];
                notes = [];
                fx = [];
                for (k = 0; k < 4 * length; k++)
                    notes[k] = 0;
                for (k = 0; k < 2 * length; k++)
                    fx[k] = 0;
                for (k = 0; k < Math.min(mSong.patternLen, length); k++) {
                    notes[k] = col.n[k];
                    notes[k + length] = col.n[k + mSong.patternLen];
                    notes[k + 2 * length] = col.n[k + 2 * mSong.patternLen];
                    notes[k + 3 * length] = col.n[k + 3 * mSong.patternLen];
                    fx[k] = col.f[k];
                    fx[k + length] = col.f[k + mSong.patternLen];
                }
                col.n = notes;
                col.f = fx;
            }
        }
        // Update pattern length
        mSong.patternLen = length;
    }
    ;
    this.update_ranges = function () {
        updateSongRanges();
    };
    function updateSongRanges() {
        var i, j, emptyRow;
        // Determine the last song pattern
        mSong.endPattern = marabu.sequencer.length + 1;
        for (i = marabu.sequencer.length; i >= 0; --i) {
            emptyRow = true;
            for (j = 0; j < 16; ++j) {
                if (mSong.songData[j].p[i] > 0) {
                    emptyRow = false;
                    break;
                }
            }
            if (!emptyRow)
                break;
            mSong.endPattern--;
        }
    }
    ;
    this.export_wav = function (opts) {
        if (opts === void 0) { opts = null; }
        updateSongRanges();
        function doneFun(wave) {
            var fileName = dialog.showSaveDialog({ filters: [{ name: 'Audio File', extensions: ['wav'] }] });
            if (fileName === undefined) {
                return;
            }
            fs.writeFile("" + (fileName.substr(-4, 4) != ".wav" ? fileName + ".wav" : fileName), new Buffer(wave), function (err) {
                if (err) {
                    alert("An error ocurred creating the file " + err.message);
                    return;
                }
            });
        }
        ;
        generateAudio(doneFun, opts);
    };
    //Only used by export_wav. Multi-tracking is wayyy diff.
    function generateAudio(doneFun, opts) {
        var display_progress_el = document.getElementById("fxr31");
        var song = mSong;
        mPlayer = new CPlayer();
        mPlayer.generate(song, opts, function (progress, player) {
            if (progress >= 1) {
                var wave = player.createWave();
                doneFun(wave);
                display_progress_el.className = "fl";
            }
            else {
                display_progress_el.className = "b_inv f_inv";
                display_progress_el.textContent = prepend_to_length(parseInt(progress * 100), 4, "0");
            }
        });
    }
    ;
    this.export_multi_wav = function (fileName) {
        stopAudio();
        updateSongRanges();
        var currentTrack = 0;
        //.generate is an async function. Unique players are required for each track.
        var trackPlayers = new Array(16);
        for (var i = 0; i < 16; i++) {
            trackPlayers[i] = new CPlayer();
        }
        var display_progress_el = document.getElementById("fxr31");
        for (var currentTrack_1 = 0; currentTrack_1 < 16; currentTrack_1++) {
            var opts = {
                firstRow: 0,
                lastRow: mSong.endPattern - 1,
                firstCol: currentTrack_1,
                lastCol: currentTrack_1
            };
            trackPlayers[currentTrack_1].trackID = currentTrack_1;
            trackPlayers[currentTrack_1].generate(mSong, opts, function (progress, player, trackID) {
                if (progress >= 1) {
                    var wave = player.createWave();
                    display_progress_el.className = "fl";
                    fs.writeFile(fileName + "." + player.trackID + ".wav", new Buffer(wave), function (err) {
                        if (err)
                            alert("An error ocurred creating the file " + err.message);
                    });
                }
                else {
                    display_progress_el.className = "b_inv f_inv";
                    display_progress_el.textContent = "WRKN";
                }
            });
        }
    };
    this.calculate_time = function (pos) {
        if (pos === void 0) { pos = (8 * (marabu.song.length + 1)); }
        var bpm = parseFloat(marabu.song.song().bpm);
        var beats = pos;
        var minutes = beats / bpm;
        var seconds = minutes * 60;
        return seconds;
    };
    function stopAudio() {
        marabu.sequencer.follower.stop();
        if (mAudio) {
            mAudio.pause();
            mAudioTimer.reset();
        }
    }
    ;
    this.stop_song = function () {
        stopAudio();
        marabu.selection.row = 0;
        marabu.update();
    };
    this.start_over = function () {
        this.currentTime = 0;
        this.play();
    };
    this.play_song = function () {
        mAudio.removeEventListener('ended', marabu.song.start_over, false);
        this.update();
        this.update_bpm(this.song().bpm);
        this.update_rpp(32);
        stopAudio();
        updateSongRanges();
        function doneFun(wave) {
            console.log("playing..");
            marabu.sequencer.follower.start();
            mAudio.src = URL.createObjectURL(new Blob([wave], { type: "audio/wav" }));
            mAudioTimer.reset();
            mAudio.play();
        }
        ;
        generateAudio(doneFun);
    };
    this.play_loop = function (opts, looped_song) {
        mAudio.addEventListener('ended', marabu.song.start_over, false);
        this.update_bpm(this.song().bpm);
        this.update_rpp(32);
        this.stop_song();
        updateSongRanges();
        var offset = opts.firstRow;
        function doneFun(wave) {
            console.log("playing..", offset);
            marabu.sequencer.follower.start(offset);
            mAudio.src = URL.createObjectURL(new Blob([wave], { type: "audio/wav" }));
            mAudioTimer.reset();
            mAudio.play();
        }
        ;
        generateAudio(doneFun, opts, looped_song);
    };
    this.length = 0;
    this.is_looping = false;
    this.update = function () {
        this.validate();
        this.update_length();
    };
    this.validate = function () {
        for (var i = 0; i < 16; ++i) {
            var offset = (this.length + 34) - mSong.songData[i].p.length;
            if (offset < 0) {
                continue;
            }
            // Fill
            for (var fill = 0; fill < offset; ++fill) {
                mSong.songData[i].p.push(0);
            }
        }
    };
    this.update_length = function () {
        var l = 0;
        for (var i = 0; i < 16; ++i) {
            for (var p = 0; p < mSong.songData[i].p.length; ++p) {
                if (mSong.songData[i].p[p] > 0 && p > l) {
                    l = p;
                }
            }
        }
        this.length = l;
    };
    //--------------------------------------------------------------------------
    // Initialization
    //--------------------------------------------------------------------------
    this.init = function () {
        var i, j, o;
        // Create audio element, and always play the audio as soon as it's ready
        mAudio = new Audio();
        mAudioTimer.setAudioElement(mAudio);
        mAudio.addEventListener("canplay", function () { this.play(); }, true);
        mSong = new Track();
        mJammer.start();
        mJammer.updateRowLen(mSong.rowLen);
    };
}
;
module.exports = Song;

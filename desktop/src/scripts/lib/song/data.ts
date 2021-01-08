import { Theme } from "../theme";
import { Track } from "./track";

var { calcSamplesPerRow } = require('../lib/util.js');

export class SongData {
    static readonly MAX_SONG_ROWS: number = 32;
    static readonly MAX_PATTERNS: number = 32;
    static readonly MAX_INSTRUMENTS: number = 16;

    // Metadata  
    artist: string;
    bpm: number;
    name: string;
    //This is the theme that is saved along side the song,
    //so on load it loads the same theme as was used when making it.
    theme: Theme;

    patternLen: number;

    //Tracks
    tracks: Track[];

    constructor() {
        this.artist = "Unknown";
        this.name = "Untitled";
        this.bpm = 120;
        this.theme = Theme.default_theme;
        this.patternLen = 32;
        this.tracks = Array<Track>();
        this.tracks.fill(new Track());
    }

    get_samplesPerRow(): number {
        return calcSamplesPerRow(this.bpm);
    }

    get_endPattern(): number {
        var last_pattern: number = 1;
        for(let x in this.tracks){
            let x_last_pattern = x.get_endPattern();
            last_pattern = (x_last_pattern > last_pattern) ? x_last_pattern : last_pattern;
        }
        return last_pattern;
    }
};
import { Theme } from "../theme";
import { PatternMatrix } from "./pattern_matrix";
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

    //Pattern Matrix
    matrix: PatternMatrix;

    constructor() {
        this.artist = "Unknown";
        this.name = "Untitled";
        this.bpm = 120;
        this.theme = Theme.default_theme;
        this.patternLen = 32;
        this.tracks = Array<Track>(SongData.MAX_INSTRUMENTS);
        this.tracks.fill(new Track());
        this.matrix = new PatternMatrix();
    }

    //Samples as in sample rate samples.
    get_samples_per_row(): number {
        return calcSamplesPerRow(this.bpm);
    }

    get_last_filled_row(): number {
        var last_pattern: number = 1;
        for(let x of this.tracks){
            let x_last_pattern = x.pattern_bank.last_valid_pattern();
            last_pattern = (x_last_pattern > last_pattern) ? x_last_pattern : last_pattern;
        }
        return last_pattern;
    }
};
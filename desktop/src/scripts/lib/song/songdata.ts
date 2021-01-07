import { Theme } from "../theme";
import { Track } from "./track";

var { calcSamplesPerRow } = require('../lib/util.js');

export class SongData {
    static readonly MAX_SONG_ROWS: number = 32;
    static readonly MAX_PATTERNS: number = 32;
    static readonly MAX_INSTRUMENTS: number = 16;

    // Metadata  
    artist: string;
    name: string;
    bpm: number;
    theme: Theme;


    // Automated
    samplesPerRow: number;
    endPattern: number;
    patternLen: number;

    //Tracks
    tracks: Track[];

    constructor() {
        this.artist = "Unknown";
        this.name = "Untitled";
        this.bpm = 120;
        this.theme = Theme.default_theme;
        this.samplesPerRow = calcSamplesPerRow(this.bpm);
        this.endPattern = 2;
        this.patternLen = 32;
        this.tracks = [];
    }
};
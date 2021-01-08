import { InstrumentData } from "../instrument/data";
import { TrackPattern } from "./pattern";

export class Track {
    static readonly MAX_PATTERNS = 32;
    static readonly MAX_ROWS = 32;
    private name: string;
    current_pattern: number;
    pattern: TrackPattern;

    instrument_data: InstrumentData;

    constructor() {
        this.name = ">---";
        this.current_pattern = 0;
        this.pattern = new TrackPattern();
        this.instrument_data = InstrumentData.default;
    }

    set_name(track_name: string) {
        this.name = track_name.length <= 4 ? track_name : track_name.substr(0, 4);
        this.name = this.name.toUpperCase();
    }

    get_name(): string {
        return this.name;
    }
}
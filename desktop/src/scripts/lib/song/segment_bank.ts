import { PatternSegment } from "./segment";
import { Track } from "./track";

export class PatternSegmentBank {
    static readonly MAX_SEGMENTS = 32;
    patterns: PatternSegment[];

    constructor(){
        this.patterns = new Array<PatternSegment>(PatternSegmentBank.MAX_SEGMENTS);
        this.patterns.fill(new PatternSegment());
    }

    last_valid_pattern(){
        for(var i = this.patterns.length - 1; i >= 0; i--){
            if(this.patterns[i].empty()){
                return i;
            }
        }
        return -1;
    }
}
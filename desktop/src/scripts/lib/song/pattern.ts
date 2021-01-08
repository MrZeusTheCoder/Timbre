import { Song } from "../../components/song";
import { Track } from "./track";

class PatternSegment {
    //Two columns for each note.
    notes_c1: number[];
    notes_c2: number[];

    //The first is the effect being keyframed, the second
    // is the set value of the effect at that keyframe.
    effect_commands: number[]; 
    effect_values: number[];
    
    constructor(){
        this.notes_c1 = [];
        this.notes_c2 = [];
        this.effect_commands = [];
        this.effect_values = [];
    }

    empty(): boolean {
        for(let x in [this.notes_c1, this.notes_c2, this.effect_commands, this.effect_values]){
            if(!x.length){
                return false;
            }
        }
        return true;
    }
}

export class TrackPattern {

    patterns: PatternSegment[];

    constructor(){
        this.patterns = new Array<PatternSegment>(Track.MAX_PATTERNS);
        this.patterns.fill(new PatternSegment());
    }

    get_endPattern(){
        var last_pattern: number = 0;
        while(!this.patterns[last_pattern].empty()){
            last_pattern++;
        }
        return last_pattern;
    }
}
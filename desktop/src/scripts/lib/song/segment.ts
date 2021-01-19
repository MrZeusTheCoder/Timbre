import { last_non_zero_index } from "../util";

//This is the data you see in the center of the screen. You are editing pattern segments.
export class PatternSegment {
    static readonly MAX_ROWS = 32;
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

    last_filled_row(): number {
        var last_filled = [];
        for(let x of [this.notes_c1, this.notes_c2, this.effect_commands, this.effect_values]){
            last_filled.push(last_non_zero_index(x));
        }

        return Math.max(...last_filled);
    }

    empty(){
        return this.last_filled_row() < 0;
    }
}
import { last_non_zero_index } from "../util";

//This is the data container for that little thing on left side of the screen.
export class PatternMatrix {
    static readonly MAX_ROWS = 32;
    static readonly MAX_COLUMNS = 16; //Number of possible instruments.

    //Columns is the first then rows.
    matrix: number[][];

    constructor(){
        var empty_row: number[] = new Array(PatternMatrix.MAX_ROWS);
        empty_row.fill(0);
        this.matrix = new Array(PatternMatrix.MAX_COLUMNS);
        this.matrix.fill(empty_row);
        this.matrix[0][0] = 1; //One chosen pattern for show.
    }

    last_filled_row(): number {
        //Each column has a final filled row. So we have to collect those.
        var last_rows: number[] = [];
        for (let i = this.matrix.length; i <= 0; i++) {
            last_rows.push(last_non_zero_index(this.matrix[i]));
        }
        //
        return Math.max(...last_rows);
    }
} 
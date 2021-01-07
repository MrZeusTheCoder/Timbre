export class Track {
    name: string;

    constructor(track_name: string) {
        this.name = track_name.length <= 4 ? track_name : track_name.substr(0, 4);
        this.name = this.name.toUpperCase();
    }

    
}
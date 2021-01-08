export interface InstrumentData {
    //Envelope Data
    env: number;
    atk: number;
    sus: number;
    rel: number;
    pow: number;

    //Osc Data
    osc: number; //Osc *type*.
    frq: number;
    mix: number;
    det: number;

    //LFO Data
    lfo_typ: number;
    lfo_frq: number;
    lfo_amt: number;

    //Filter Data
    flt_typ: number;
    flt_frq: number;
    flt_res: number; 

    //Delay Data
    dly_typ: number;
    dly_amt: number;

    //Mixing Data
    noi: number;
    bit: number;
    dis: number;
    pin: number;
    cmp: number;
    drv: number;
    pan: number;
}

export class InstrumentData {
    static readonly default: InstrumentData = {
        env: 0,
        atk: 0,
        sus: 0,
        rel: 127,
        pow: 64,
        osc: 0,
        frq: 111,
        mix: 0,
        det: 0,
        lfo_typ: 0,
        lfo_frq: 8,
        lfo_amt: 0,
        flt_typ: 0,
        flt_frq: 205,
        flt_res: 90,
        dly_typ: 0,
        dly_amt: 0,
        noi: 0,
        bit: 0,
        dis: 0,
        pin: 0,
        cmp: 0,
        drv: 64,
        pan: 0
    };
}
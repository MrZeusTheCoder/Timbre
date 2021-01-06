"use strict";
function CAudioTimer() {
    var mAudioElement = null;
    var mStartT = 0;
    var mErrHist = [0, 0, 0, 0, 0, 0];
    var mErrHistPos = 0;
    this.setAudioElement = function (audioElement) {
        mAudioElement = audioElement;
    };
    this.currentTime = function () {
        if (!mAudioElement)
            return 0;
        // Calculate current time according to Date()
        var t = (new Date()).getTime() * 0.001;
        var currentTime = t - mStartT;
        // Get current time according to the audio element
        var audioCurrentTime = mAudioElement.currentTime;
        // Check if we are off by too much - in which case we will use the time
        // from the audio element
        var err = audioCurrentTime - currentTime;
        if (audioCurrentTime < 0.01 || err > 0.2 || err < -0.2) {
            currentTime = audioCurrentTime;
            mStartT = t - currentTime;
            for (var i = 0; i < mErrHist.length; i++)
                mErrHist[i] = 0;
        }
        // Error compensation (this should fix the problem when we're constantly
        // slightly off)
        var comp = 0;
        for (var i = 0; i < mErrHist.length; i++)
            comp += mErrHist[i];
        comp /= mErrHist.length;
        mErrHist[mErrHistPos] = err;
        mErrHistPos = (mErrHistPos + 1) % mErrHist.length;
        return currentTime + comp;
    };
    this.reset = function () {
        mStartT = (new Date()).getTime() * 0.001;
        for (var i = 0; i < mErrHist.length; i++) {
            mErrHist[i] = 0;
        }
    };
}
;
module.exports = CAudioTimer;

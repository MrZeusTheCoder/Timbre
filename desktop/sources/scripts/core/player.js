/* -*- mode: javascript; tab-width: 2; indent-tabs-mode: nil; -*-
*
* Copyright (c) 2011-2013 Marcus Geelnard
*
* This file is part of SoundBox.
*
* SoundBox is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* SoundBox is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with SoundBox.  If not, see <http://www.gnu.org/licenses/>.
*
*/

"use strict";

var CPlayer = function ()
{
  //Optional trackID for use with multi-tracked output.
  var trackID = 0;
  var mParent = this;
  var mProgressCallback;

  var mGeneratedBuffer;

  var mWorker = new Worker("scripts/core/player-worker.js");

  mWorker.onmessage = function (event) {
    if (event.data.cmd === "progress") {
      mGeneratedBuffer = event.data.buffer;
      if (mProgressCallback) {
        mProgressCallback(event.data.progress, mParent, trackID);
      }
    }
  };


  //--------------------------------------------------------------------------
  // Public methods
  //--------------------------------------------------------------------------

  // Generate the audio data (done in worker).
  this.generate = function(song, opts, progressCallback)
  {
    mProgressCallback = progressCallback;
    mWorker.postMessage({
      cmd: "generate",
      song: song,
      opts: opts
    });
  };

  function int32ToUint8Array(int){
    return new Uint8Array([int & 255, (int >> 8) & 255, (int >> 16) & 255, (int >> 24) & 255]);
  }


  //Super useful resources: http://www.topherlee.com/software/pcm-tut-wavformat.html
  //http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
  //Not included in original Marabu source. This is part of upgrades.
  function createWaveHeader(waveWords, sampleRate, bitSize){
    const headerLen = 44;
    const RIFF = new Uint8Array([82,73,70,70]);
    const WAVE = new Uint8Array([87,65,86,69]);
    //Format Chunk Identifier.
    const fmtI = new Uint8Array([102,109,116,32]);
    //Length of the format data (16 for PCM). 
    const fmtL = 16;
    //PCM use Identifier.
    const PCMI = int32ToUint8Array(0x000001);
    const channels = 2; //Stereo
    const sampleRateArray = int32ToUint8Array(sampleRate);
    //I don't know what this is, tbf.
    const something = int32ToUint8Array((sampleRate * bitSize * channels) / 8); 
    const anotherSomething = new Uint8Array([(bitSize * channels) / 8, 0]);
    const bitDepth = new Uint8Array([bitSize, 0]);
    const dataHeader = new Uint8Array([100,97,116,97])
    
    const fullFileLength = headerLen + (waveWords * channels);
    const fileSize = int32ToUint8Array(fullFileLength - 8);
    const dataSize = int32ToUint8Array(fullFileLength - 44);

    var waveHeader = new Uint8Array(headerLen);
    //Second argument dictates offset.
    waveHeader.set(RIFF);
    waveHeader.set(fileSize, 4);
    waveHeader.set(WAVE, 8);
    waveHeader.set(fmtI, 12);
    waveHeader.set([fmtL], 16);
    waveHeader.set(PCMI, 20);
    waveHeader.set([channels], 22);
    waveHeader.set(sampleRateArray, 24);
    waveHeader.set(something, 28);
    waveHeader.set(anotherSomething, 32);
    waveHeader.set(bitDepth, 34);
    waveHeader.set(dataHeader, 36);
    waveHeader.set(dataSize, 40);

    return waveHeader;
  }

  // Create a WAVE formatted Uint8Array from the generated audio data.
  this.createWave = function()
  {
    // Turn critical object properties into local variables (performance)
    var mixBuf = mGeneratedBuffer;
    var waveWords = mixBuf.length;
    
    var headerLen = 44;
    var wave = new Uint8Array(headerLen + waveWords * 2);
    wave.set(createWaveHeader(waveWords, 44100, 16));

    // Append actual wave data
    for(var i = 0, idx = headerLen; i < waveWords; ++i){
      // Note: We clamp here
      var y = mixBuf[i];
      y = y < -32767 ? -32767 : (y > 32767 ? 32767 : y);
      wave[idx++] = y & 255;
      wave[idx++] = (y >> 8) & 255;
    }

    // Return the WAVE formatted typed array
    return wave;
  };

  // Get n samples of wave data at time t [s]. Wave data in range [-2,2].
  this.getData = function(t, n)
  {
    var i = 2 * Math.floor(t * 44100);
    var d = new Array(n);
    var b = mGeneratedBuffer;
    for (var j = 0; j < 2*n; j += 1) {
        var k = i + j;
        d[j] = t > 0 && k < b.length ? b[k] / 32768 : 0;
    }
    return d;
  };
};

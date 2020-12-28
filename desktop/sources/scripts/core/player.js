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

  //Only shifting, not scaling.
  function shiftTo8_4Array(int){
    return new Uint8Array([int & 255, (int >> 8) & 255, (int >> 16) & 255, (int >> 24) & 255]);
  }

  //64-bit ("number" type) to Uint8[4] (32-bit) array. 
  function convertTo8_4Array(number){
    return shiftTo8_4Array(number);
  }

  //Same as above just to 16-bit.
  function convertTo8_2Array(number){
    const INT16_MAX = 32767;
    // Note: taken from old. Once the player-worker is fixed, this code will change.
    if(number < -INT16_MAX){
      number = -INT16_MAX;
    } else if(number > INT16_MAX){
      number = INT16_MAX;
    }

    return [number & 255, (number >> 8) & 255];
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
    const PCMI = shiftTo8_4Array(0x000001);
    const channels = 2; //Stereo
    const sampleRateArray = shiftTo8_4Array(sampleRate);
    //I don't know what this is, tbf.
    const something = shiftTo8_4Array((sampleRate * bitSize * channels) / 8); 
    const anotherSomething = new Uint8Array([(bitSize * channels) / 8, 0]);
    const bitDepth = new Uint8Array([bitSize, 0]);
    const dataHeader = new Uint8Array([100,97,116,97])
    
    const fullFileLength = headerLen + (waveWords * channels);
    const fileSize = shiftTo8_4Array(fullFileLength - 8);
    const dataSize = shiftTo8_4Array(fullFileLength - 44);

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
  this.createWave = function(bitDepth=16)
  {
    if(bitDepth != 32 && bitDepth != 16){
      throw 'No other bit depth except 32 or 16 is support (right now).';
    }
    
    const channels = 2;
   
    // Turn critical object properties into local variables (performance)
    var mixBuf = mGeneratedBuffer;
    var waveWords = mixBuf.length;
    
    //---------------MAKE_WAVE_HEADER---------------//
    var headerLen = 44;
    var Uint8sInBitWord = bitDepth / 8;
    var wave = new Uint8Array(headerLen + waveWords * Uint8sInBitWord);
    wave.set(createWaveHeader(waveWords, 44100, bitDepth));

    //---------------APPEND_WAVE_DATA---------------//
    var waveBufIndex = headerLen; //Where we are writing into the WAVE buffer.
    for(var i = 0; i < waveWords; ++i){
      var sample = mixBuf[i];

      if(bitDepth == 32){
        wave.set(convertTo8_4Array(sample), waveBufIndex);
      } else {
        wave.set(convertTo8_2Array(sample), waveBufIndex);
      }

      waveBufIndex += Uint8sInBitWord;
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

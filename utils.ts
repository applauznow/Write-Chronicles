import { Blob as GenAIBlob } from '@google/genai';

// Convert Float32Array from AudioBuffer to PCM Int16 Array required by Gemini
export function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

// Create a GenAI compatible Blob from raw PCM data
export function createAudioBlob(inputData: Float32Array): GenAIBlob {
  const int16Data = float32ToInt16(inputData);
  const byteArray = new Uint8Array(int16Data.buffer);
  
  let binary = '';
  const len = byteArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(byteArray[i]);
  }
  const base64Data = btoa(binary);

  return {
    data: base64Data,
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Decode base64 raw PCM from Gemini to AudioBuffer
export async function decodeAudioData(
  base64String: string,
  audioContext: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  // Gemini output is mono (1 channel)
  const buffer = audioContext.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
}
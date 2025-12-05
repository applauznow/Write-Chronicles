import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { Mic, MicOff, Radio, X, MessageSquare, Loader2 } from 'lucide-react';
import { createAudioBlob, decodeAudioData } from '../utils';
import { AgentStatus, ServiceType } from '../types';

interface VoiceAgentProps {
  onOpenForm: (service?: ServiceType) => void;
}

// Function declaration for the tool
const openRequestFormDeclaration: FunctionDeclaration = {
  name: 'openRequestForm',
  parameters: {
    type: Type.OBJECT,
    description: 'Opens the service request form for the user, optionally pre-selecting a specific service.',
    properties: {
      serviceType: {
        type: Type.STRING,
        description: 'The specific service the user is interested in (e.g., Ghostwriting, Cover Design).',
        enum: Object.values(ServiceType)
      },
    },
    required: [],
  },
};

const VoiceAgent: React.FC<VoiceAgentProps> = ({ onOpenForm }) => {
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.Disconnected);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0); // For visualization
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs for Audio Contexts and Processing
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null); // To store the active session

  // Cleanup function
  const stopAgent = useCallback(() => {
    // Stop audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect audio nodes
    if (sourceRef.current) sourceRef.current.disconnect();
    if (processorRef.current) processorRef.current.disconnect();

    // Close contexts
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    
    // Stop playing audio
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();

    // Reset refs
    inputContextRef.current = null;
    outputContextRef.current = null;
    sessionRef.current = null; // We can't explicitly close the session object from the API, just drop ref

    setStatus(AgentStatus.Disconnected);
    setVolume(0);
  }, []);

  const startAgent = async () => {
    try {
      setStatus(AgentStatus.Connecting);
      
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      nextStartTimeRef.current = outputContextRef.current.currentTime;

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setStatus(AgentStatus.Connected);

            // Start Input Streaming
            if (!inputContextRef.current || !streamRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            // Use ScriptProcessor for raw PCM access (AudioWorklet is better for prod, but this is standard for this API demo)
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (isMuted) return; // Don't send data if muted locally
              
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume meter
              let sum = 0;
              for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1)); // Scale for UI

              const pcmBlob = createAudioBlob(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'openRequestForm') {
                    const requestedService = fc.args.serviceType as ServiceType | undefined;
                    onOpenForm(requestedService);
                    
                    sessionPromise.then(session => {
                      session.sendToolResponse({
                        functionResponses: {
                          id: fc.id,
                          name: fc.name,
                          response: { result: 'OK, form opened.' }
                        }
                      });
                    });
                }
              }
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current) {
               // Calculate volume for "Agent Speaking" visualization
               // (Simplified: just setting a random activity level when receiving audio)
               setVolume(0.5 + Math.random() * 0.5);

               const audioBuffer = await decodeAudioData(
                 base64Audio, 
                 outputContextRef.current,
                 24000
               );

               const source = outputContextRef.current.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputContextRef.current.destination);
               
               // Schedule seamless playback
               const currentTime = outputContextRef.current.currentTime;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               
               audioSourcesRef.current.add(source);
               source.onended = () => {
                 audioSourcesRef.current.delete(source);
                 if (audioSourcesRef.current.size === 0) setVolume(0); // Reset visualizer
               };
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            stopAgent();
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setStatus(AgentStatus.Error);
            stopAgent();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
          },
          systemInstruction: `You are 'Page', the senior literary consultant for Write Chronicles. 
          Your goal is to be professional, warm, and highly knowledgeable about the publishing industry.
          Briefly answer questions about our services: 
          - Ghostwriting (we write your story)
          - Editorial Assessment (expert feedback)
          - Copy Editing (polishing grammar/style)
          - Cover Design (market-ready visuals)
          - Book Marketing (launch strategies)
          - Audiobooks.
          
          If a user expresses strong interest or asks to sign up, use the 'openRequestForm' tool immediately.
          Keep answers concise and conversational.`,
          tools: [{ functionDeclarations: [openRequestFormDeclaration] }]
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      setStatus(AgentStatus.Error);
    }
  };

  useEffect(() => {
    return () => stopAgent();
  }, [stopAgent]);


  // UI Renders
  if (!isExpanded && status === AgentStatus.Disconnected) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 bg-brand-800 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-all hover:scale-105 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
          Talk to Page
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-100 w-80 overflow-hidden">
        {/* Header */}
        <div className="bg-brand-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === AgentStatus.Connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-serif font-medium">Page AI Consultant</span>
          </div>
          <button onClick={() => { stopAgent(); setIsExpanded(false); }} className="text-brand-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer / Body */}
        <div className="h-48 bg-stone-50 flex flex-col items-center justify-center relative">
          
          {status === AgentStatus.Error && (
             <div className="text-red-500 text-sm px-6 text-center">Connection Error. Please try again.</div>
          )}

          {status === AgentStatus.Connecting && (
             <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          )}

          {status === AgentStatus.Connected && (
            <div className="relative flex items-center justify-center">
              {/* Ripple Effect based on volume */}
              <div 
                className="absolute bg-brand-200 rounded-full opacity-30 transition-all duration-75"
                style={{ width: `${100 + volume * 150}px`, height: `${100 + volume * 150}px` }}
              />
              <div 
                className="absolute bg-brand-300 rounded-full opacity-40 transition-all duration-75"
                style={{ width: `${80 + volume * 100}px`, height: `${80 + volume * 100}px` }}
              />
              {/* Main Orb */}
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full shadow-lg flex items-center justify-center relative z-10">
                 <Radio className={`w-8 h-8 text-white ${volume > 0.1 ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          )}

          {status === AgentStatus.Disconnected && (
            <div className="text-center p-4">
              <p className="text-stone-600 mb-4 text-sm">
                Have questions about publishing? I can explain our services and guide you to the right choice.
              </p>
              <button 
                onClick={startAgent}
                className="bg-brand-600 text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-brand-500 transition-colors shadow-md"
              >
                Start Conversation
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        {status === AgentStatus.Connected && (
          <div className="p-4 bg-white border-t border-stone-100 flex justify-center gap-4">
            <button 
              onClick={() => {
                setIsMuted(!isMuted);
                // Note: Actual stream muting logic would go here if using tracks, 
                // but we handle it in onaudioprocess for this demo
              }}
              className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={stopAgent}
              className="p-3 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAgent;
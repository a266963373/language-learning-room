// Explicit device reading for newly composed passages. Never replaces course MP3s.
export class DeviceSpeech {
  constructor(synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance){this.synth=synth;this.Utterance=Utterance;this.token=0;}
  voice(id,online=globalThis.navigator?.onLine!==false){return this.synth?.getVoices().filter(voice=>voice.lang.toLowerCase().split(/[-_]/)[0]===id&&(online||voice.localService)).sort((a,b)=>Number(b.localService)-Number(a.localService))[0]??null;}
  stop(){this.token++;if(this.utterance){this.synth?.cancel();this.utterance=null;}}
  speak(text,id,status){
    const voice=this.voice(id);if(!voice||!this.Utterance)return false;this.stop();
    const token=this.token,utterance=new this.Utterance(text);utterance.lang=voice.lang;utterance.voice=voice;utterance.rate=.9;
    utterance.onstart=()=>{if(token===this.token)status('playing',voice);};
    utterance.onend=()=>{if(token===this.token){this.utterance=null;status('ended',voice);}};
    utterance.onerror=()=>{if(token===this.token){this.utterance=null;status('error',voice);}};
    this.utterance=utterance;try{this.synth.speak(utterance);return true;}catch{this.utterance=null;status('error',voice);return false;}
  }
}

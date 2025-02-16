export const convertAudioToBase64 = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      const base64Data = base64Audio.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
};

export const createAudioRecorder = async (): Promise<MediaRecorder> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 48000,
    }
  });

  return new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
};

// Utility for handling audio playback
export const playAudio = async (audioBuffer: ArrayBuffer): Promise<void> => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioSource = audioContext.createBufferSource();
  
  const buffer = await audioContext.decodeAudioData(audioBuffer);
  audioSource.buffer = buffer;
  audioSource.connect(audioContext.destination);
  
  return new Promise((resolve) => {
    audioSource.onended = () => {
      audioContext.close();
      resolve();
    };
    audioSource.start(0);
  });
};
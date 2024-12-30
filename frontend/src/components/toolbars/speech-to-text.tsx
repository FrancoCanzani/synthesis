import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AutomaticSpeechRecognitionPipeline,
  pipeline,
} from "@xenova/transformers";
import { Loader2, Mic, Square } from "lucide-react";
import { useRef, useState } from "react";

interface SpeechToTextProps {
  onTranscriptionComplete?: (text: string) => void;
  className?: string;
}

const SpeechToText = ({ onTranscriptionComplete }: SpeechToTextProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const transcriber = useRef<AutomaticSpeechRecognitionPipeline | null>(null);

  const initializeTranscriber = async () => {
    setModelLoading(true);
    try {
      transcriber.current = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny",
      );
    } catch (error) {
      console.error("Error loading model:", error);
    }
    setModelLoading(false);
  };

  const startRecording = async () => {
    try {
      if (!transcriber.current) {
        await initializeTranscriber();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioChunks.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        await processAudio(audioBlob);
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioData = await audioContext.decodeAudioData(arrayBuffer);
      const float32Array = audioData.getChannelData(0);

      // Transcribe the audio
      const result = await transcriber.current(float32Array);
      if (onTranscriptionComplete) {
        onTranscriptionComplete(result.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClick}
          disabled={isTranscribing || modelLoading}
        >
          {isTranscribing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isRecording ? (
            <Square className="h-4 w-4 text-red-500" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>
          {modelLoading
            ? "Loading model..."
            : isTranscribing
              ? "Transcribing..."
              : isRecording
                ? "Stop Recording"
                : "Start Recording"}
        </span>
      </TooltipContent>
    </Tooltip>
  );
};

export default SpeechToText;

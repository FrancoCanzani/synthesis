import { useState, useEffect } from 'react';
import { Volume2Icon, PauseIcon, PlayIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolbar } from './toolbar-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TextToSpeechToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const { editor } = useToolbar();

  const text = editor.getText();

  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    const loadVoices = () => {
      if (synth) {
        const voices = synth.getVoices();
        setAvailableVoices(voices);
        setSelectedVoice(
          voices.find((voice) => voice.lang === selectedLanguage) || null
        );
      }
    };

    if (synth) {
      loadVoices();
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth) {
        synth.onvoiceschanged = null;
      }
    };
  }, [synth, selectedLanguage]);

  const filteredVoices = availableVoices.filter((voice) =>
    voice.lang.startsWith(selectedLanguage)
  );

  const handleSpeak = () => {
    if (!text || !synth) return;

    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = selectedLanguage;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  };

  const handleStop = () => {
    if (synth && synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handlePauseResume = () => {
    if (synth) {
      if (synth.speaking) {
        if (synth.paused) {
          synth.resume();
          setIsPaused(false);
        } else {
          synth.pause();
          setIsPaused(true);
        }
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => setIsOpen(true)}
              >
                <Volume2Icon className='h-4 w-4' />
                <span className='sr-only'>Text-to-Speech</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent className='w-80 bg-background'>
            <div className='flex flex-col space-y-2.5'>
              <Select
                onValueChange={setSelectedLanguage}
                value={selectedLanguage}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Language' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='en-US'>English (US)</SelectItem>
                  <SelectItem value='es-ES'>Spanish (Spain)</SelectItem>
                  <SelectItem value='fr-FR'>French (France)</SelectItem>
                  <SelectItem value='de-DE'>German (Germany)</SelectItem>
                  <SelectItem value='ja-JP'>Japanese (Japan)</SelectItem>
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) =>
                  setSelectedVoice(
                    filteredVoices.find((voice) => voice.name === value) || null
                  )
                }
                value={selectedVoice?.name}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Voice' />
                </SelectTrigger>
                <SelectContent>
                  {filteredVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full'
                  onClick={handleSpeak}
                  disabled={isSpeaking || !text}
                >
                  Play
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 w-full'
                  onClick={handleStop}
                  disabled={!isSpeaking}
                >
                  Stop
                </Button>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-full'
                onClick={handlePauseResume}
                disabled={!isSpeaking}
              >
                {isPaused ? (
                  <PlayIcon className='h-4 w-4 mr-2' />
                ) : (
                  <PauseIcon className='h-4 w-4 mr-2' />
                )}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent>
          <span>Text-to-Speech</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

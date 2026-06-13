import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import api from "../api/axios";

interface Track {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string;
}

const LofiPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await api.get('/music/lofi');
        if (response.data && response.data.results) {
          setTracks(response.data.results);
        }
      } catch (error) {
        console.error("Failed to fetch lofi music", error);
      }
    };
    fetchMusic();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleNext = () => {
    if (tracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (tracks.length === 0) return null;

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-4 mt-6 border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-auto">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.audio} 
        onEnded={handleNext}
      />

      {/* Album Art / Icon */}
      <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {currentTrack.image ? (
          <img src={currentTrack.image} alt="album art" className="w-full h-full object-cover" />
        ) : (
          <Music className="w-6 h-6 text-indigo-500" />
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {currentTrack.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {currentTrack.artist_name}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <button onClick={toggleMute} className="p-1 hover:text-indigo-500 transition-colors">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button onClick={togglePlay} className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>
        <button onClick={handleNext} className="p-1 hover:text-indigo-500 transition-colors">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LofiPlayer;

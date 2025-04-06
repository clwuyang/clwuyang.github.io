import { useState, useRef, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  url: string;
  coverUrl?: string;
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const playlist: Song[] = [
    {
      id: 1,
      title: "Minecraft Volume Alpha",
      artist: "Motohiro Hata",
      url: "/public/music/C418  - Sweden - Minecraft Volume Alpha.mp3",
      coverUrl: "/public/music/sweeden.jpg"
    },
    {
      id: 2,
      title: "PS4 Menu",
      artist: "Artist Name",
      url: "public/music/PlayStation 4 System Music - OFFICIAL Home Menu (HIGH QUALITY).mp3",
      coverUrl: "public/music/default.png"
    }
  ];

  const currentSong = playlist[currentSongIndex];
  const defaultCoverUrl = "/public/music/default.jpg";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [currentSongIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
  };

  const handleSongEnd = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      playNext();
    }
  };

  const playNext = () => {
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * playlist.length);
      setCurrentSongIndex(nextIndex);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      setCurrentSongIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 z-50 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 group cursor-pointer hover:h-2 transition-all duration-200">
        <div 
          className="h-full bg-green-500 group-hover:bg-green-400 transition-all duration-300 ease-out"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto group cursor-pointer">
          <img 
            src={currentSong.coverUrl || defaultCoverUrl}
            alt={currentSong.title} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = defaultCoverUrl;
            }}
          />
          <div className="min-w-0 flex-1 sm:flex-initial group-hover:translate-x-1 transition-transform duration-300">
            <h3 className="text-sm font-medium dark:text-white truncate group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-300">{currentSong.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{currentSong.artist}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center flex-1 w-full sm:w-auto max-w-xl">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 w-full">
            <button
              onClick={toggleShuffle}
              className={`group relative p-1 sm:p-2 ${isShuffle ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'} hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3v2m-2 0h2v-2M3 7h3m10 0h5M3 12h13m4 0h1M3 17h3m10 0h5m-2 3v-2m-2 0h2v2" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:mb-3">
                Shuffle Play
              </span>
            </button>
            
            <button
              onClick={playPrevious}
              className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            <button 
              onClick={togglePlay}
              className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-125"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1 sm:p-2 ${isRepeat ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'} hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          <div className="w-full flex items-center space-x-2 px-2 sm:px-4 group">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 sm:w-12 text-right group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 hover:h-2 transition-all duration-200
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 
                [&::-webkit-slider-thumb]:hover:w-4 [&::-webkit-slider-thumb]:hover:h-4 
                [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                hover:bg-gray-300 dark:hover:bg-gray-600"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 sm:w-12 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 w-32 sm:w-40 group">
          <button
            onClick={() => setIsVolumeVisible(!isVolumeVisible)}
            className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {volume === 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : volume < 0.5 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM15.536 8.464a5 5 0 010 7.072" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 8.464v7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 hover:h-2 transition-all duration-200
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 
                [&::-webkit-slider-thumb]:hover:w-4 [&::-webkit-slider-thumb]:hover:h-4 
                [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                hover:bg-gray-300 dark:hover:bg-gray-600"
            />
          </div>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        src={currentSong.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleSongEnd}
      />
    </div>
  );
} 
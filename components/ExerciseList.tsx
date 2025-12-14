import React, { useState, useMemo, useEffect } from "react";
import Buttons from "./buttons";
import { Exercise } from "../utils/exercises";

interface ExerciseListProps {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  onSelect: (exercise: Exercise) => void;
  exerciseResults?: {[key: string]: {completed: number, attempted: number}};
  onFilteredExercisesChange?: (filteredExercises: Exercise[]) => void;
}

// Funkcja pomocnicza do sprawdzania czy ćwiczenie jest z exercises.json
const isFromExercisesJson = (exerciseId: string): boolean => {
  // Ćwiczenia z exercises.json mają ID jak "KIA1", "KIA2", itd.
  // Customowe mają prefix "custom-", backendowe mają prefix "backend-"
  return !exerciseId.startsWith("custom-") && !exerciseId.startsWith("backend-");
};

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, currentExercise, onSelect, exerciseResults = {}, onFilteredExercisesChange }) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [colorFilter, setColorFilter] = useState<"all" | "white" | "black">("all");
  const [excludeJsonExercises, setExcludeJsonExercises] = useState(false);
  const [exerciseStats, setExerciseStats] = useState<{ [id: string]: { total: number; perfect: number } }>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("exerciseStats") || "{}") || {};
      } catch {
        return {};
      }
    }
    return {};
  });

  // Filtrowanie i sortowanie
  const filteredSortedExercises = useMemo(() => {

    
    let filtered = exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    
    // Filtrowanie po kolorze
    if (colorFilter !== "all") {
      filtered = filtered.filter(e => e.color === colorFilter);
    }
    
    // Filtrowanie - wyklucz ćwiczenia z exercises.json jeśli opcja jest włączona
    if (excludeJsonExercises) {
      filtered = filtered.filter(e => !isFromExercisesJson(e.id));
    }
    
    switch (sort) {
      case "name-asc":
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "played-desc":
        filtered = filtered.sort((a, b) => (exerciseStats[b.id]?.total || 0) - (exerciseStats[a.id]?.total || 0));
        break;
      case "played-asc":
        filtered = filtered.sort((a, b) => (exerciseStats[a.id]?.total || 0) - (exerciseStats[b.id]?.total || 0));
        break;
      case "won-desc":
        filtered = filtered.sort((a, b) => (exerciseStats[b.id]?.perfect || 0) - (exerciseStats[a.id]?.perfect || 0));
        break;
      case "won-asc":
        filtered = filtered.sort((a, b) => (exerciseStats[a.id]?.perfect || 0) - (exerciseStats[b.id]?.perfect || 0));
        break;
    }
    

    
    return filtered;
  }, [exercises, search, sort, colorFilter, exerciseStats, excludeJsonExercises]);

  // Przekaż przefiltrowane ćwiczenia do rodzica
  useEffect(() => {
    if (onFilteredExercisesChange) {
      onFilteredExercisesChange(filteredSortedExercises);
    }
  }, [filteredSortedExercises, onFilteredExercisesChange]);

  // Ustal kolor tła kółka (czarne/białe) i kolor liczb
  const getCircleStyle = (exercise: Exercise) => {
    const isBlack = exercise.color === 'black';
    return {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: isBlack ? "#111" : "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      border: "2px solid var(--blue-84)",
      fontSize: 14,
      gap: 2,
    } as React.CSSProperties;
  };

  // Funkcja do aktualizacji statystyk (możesz wywołać ją z rodzica przez ref lub callback, lub przez event)
  const updateStats = (exerciseId: string, wasPerfect: boolean) => {
    setExerciseStats(prev => {
      const prevStats = prev[exerciseId] || { total: 0, perfect: 0 };
      const newStats = {
        total: prevStats.total + 1,
        perfect: wasPerfect ? prevStats.perfect + 1 : prevStats.perfect
      };
      const updated = { ...prev, [exerciseId]: newStats };
      if (typeof window !== "undefined") {
        localStorage.setItem("exerciseStats", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="glass-panel w-[300px] rounded-lg p-3 pt-0.5 flex flex-col font-['Russo_One']" style={{ height: 722, minWidth: 280, marginTop: 0, alignSelf: 'flex-start', justifyContent: 'flex-start', overflow: 'hidden' }}>
      <div className="mb-3">
        <h3 className="text-xl text-center mb-4" style={{ color: 'var(--blue-84)' }}>Exercises</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Buttons
            bUTTON={`Private Only: ${excludeJsonExercises ? 'ON' : 'OFF'}`}
            onLogInButtonContainerClick={() => {
              setExcludeJsonExercises(!excludeJsonExercises);
            }}
            className={`!py-1 !px-6 !rounded-xl font-['Russo_One'] min-w-[110px] h-10 flex items-center justify-center border shadow-md text-base text-white transition-all duration-150 focus:outline-none ${
              excludeJsonExercises 
                ? 'bg-[rgba(36,245,228,0.20)] border-[var(--blue-84)] hover:bg-[rgba(36,245,228,0.30)]' 
                : 'bg-[rgba(255,255,255,0.08)] border-[var(--blue-84)] hover:bg-[rgba(36,245,228,0.10)]'
            }`}
          />
          <Buttons
            bUTTON="Random"
            onLogInButtonContainerClick={() => {
              if (filteredSortedExercises.length > 0) {
                // Deterministic random selection based on current time (rounded to seconds)
                const timeBasedIndex = Math.floor(Date.now() / 1000) % filteredSortedExercises.length;
                onSelect(filteredSortedExercises[timeBasedIndex]);
              }
            }}
            className="!py-1 !px-6 !rounded-xl font-['Russo_One'] min-w-[110px] h-10 flex items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[var(--blue-84)] shadow-md text-base text-white hover:bg-[rgba(36,245,228,0.10)] transition-all duration-150 focus:outline-none"
          />
        </div>
        <div className="text-xs text-white/60 text-center">
          {filteredSortedExercises.filter(e => e.color === 'white').length} white, {filteredSortedExercises.filter(e => e.color === 'black').length} black
        </div>
      </div>
      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="h-[2.125rem] rounded-xl bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full px-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none"
          style={{ borderColor: 'rgba(255,255,255,0.4)', outline: '1px solid rgba(255,255,255,0.4)', outlineOffset: 1 }}
        />
      </div>
      
      {/* Filters */}
      <div className="mb-3 space-y-2">
        <select
          value={colorFilter}
          onChange={e => setColorFilter(e.target.value as "all" | "white" | "black")}
          className="h-[2.125rem] rounded-xl bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full pr-8 pl-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none appearance-none"
          style={{ borderColor: 'rgba(255,255,255,0.4)', outline: '1px solid rgba(255,255,255,0.4)', outlineOffset: 1, background: '#181c1f', color: '#fff' }}
          tabIndex={0}
        >
          <option value="all">All colors</option>
          <option value="white">White only</option>
          <option value="black">Black only</option>
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-[2.125rem] rounded-xl bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full pr-8 pl-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none appearance-none"
          style={{ borderColor: 'rgba(255,255,255,0.4)', outline: '1px solid rgba(255,255,255,0.4)', outlineOffset: 1, background: '#181c1f', color: '#fff' }}
          tabIndex={0}
        >
          <option value="name-asc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Name A-Z</option>
          <option value="name-desc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Name Z-A</option>
          <option value="played-desc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Most played</option>
          <option value="played-asc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Least played</option>
          <option value="won-desc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Most won</option>
          <option value="won-asc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Least won</option>
        </select>
      </div>
      <div 
        className="space-y-2 overflow-y-auto exercise-list-scroll flex-1"
        style={{ minHeight: 0 }}
      >
        <div>
          {filteredSortedExercises.map((exercise) => {
            const stats = exerciseStats[exercise.id] || { total: 0, perfect: 0 };
            const isBlack = exercise.color === 'black';
            

            
            return (
              <div
                key={exercise.id}
                className={`p-2 pr-6 rounded cursor-pointer transition-colors flex items-center justify-between font-['Russo_One']`}
                style={currentExercise?.id === exercise.id
                  ? { background: 'rgba(36,245,228,0.30)', border: '1.5px solid var(--blue-84)' }
                  : { background: 'rgba(255,255,255,0.1)' }}
                onClick={() => onSelect(exercise)}
                onWheel={(e) => {
                  const scrollContainer = e.currentTarget.closest('.exercise-list-scroll') as HTMLElement;
                  if (scrollContainer) {
                    e.preventDefault();
                    scrollContainer.scrollTop += e.deltaY;
                  }
                }}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(exercise);
                  }
                }}
              >
                <div className="flex-1">
                  <div className="text-sm font-bold">
                    {exercise.name}
                  </div>
                  {exercise.maxMoves && (
                    <div className="text-xs" style={{ color: 'var(--blue-84)' }}>max moves: {exercise.maxMoves}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-white/70">
                      {Math.floor(exercise.analysis.length / 2)} moves
                    </div>
                    <div className="text-xs text-white/60">
                      {new Date(exercise.createdAt).toLocaleDateString()}
                    </div>
                    {isBlack ? (
                      <span 
                        className="text-[0.64rem] px-1.5 py-0.5 rounded-full bg-gray-800 text-white border border-gray-600 flex items-center gap-0.5"
                        style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}
                        title="Black perspective - graj jako czarne"
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-sm"></span>
                        BLACK
                      </span>
                    ) : (
                      <span 
                        className="text-[0.64rem] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-800 border border-gray-400 flex items-center gap-0.5"
                        style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}
                        title="White perspective - graj jako białe"
                      >
                        <span className="w-1.5 h-1.5 bg-black rounded-sm"></span>
                        WHITE
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {exerciseResults[exercise.id] ? (
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Russo One, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        border: `2.2px solid ${exerciseResults[exercise.id].completed > 0 ? '#00ff00' : '#ffaa00'}`,
                        boxShadow: `0 2px 8px ${exerciseResults[exercise.id].completed > 0 ? 'rgba(0,255,0,0.3)' : 'rgba(255,170,0,0.3)'}`,
                        gap: 1,
                      }}
                    >
                      <span style={{ color: exerciseResults[exercise.id].completed > 0 ? '#00ff00' : '#ffaa00', fontWeight: 600 }}>
                        {exerciseResults[exercise.id].completed}
                      </span>
                      <span style={{ color: '#fff', marginLeft: 2, fontWeight: 600 }}>
                        / {exerciseResults[exercise.id].attempted}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Russo One, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        border: '2.2px solid var(--blue-84)',
                        boxShadow: '0 2px 8px rgba(36,245,228,0.13)',
                        gap: 1,
                      }}
                    >
                      <span style={{ color: '#fff', fontWeight: 600 }}>{stats.perfect}</span>
                      <span style={{ color: '#fff', marginLeft: 2, fontWeight: 600 }}>/ {stats.total}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredSortedExercises.length === 0 && (
            <div className="text-white/50 text-sm font-['Russo_One']">No exercises available</div>
          )}
          

        </div>
      </div>

    </div>
  );
};

export default ExerciseList; 
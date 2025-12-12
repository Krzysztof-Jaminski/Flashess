import React, { useState, useMemo } from "react";
import Buttons from "./buttons";
import { Exercise } from "../utils/exercises";

interface ExerciseListProps {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  onSelect: (exercise: Exercise) => void;
  exerciseResults?: {[key: string]: {completed: number, attempted: number}};
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, currentExercise, onSelect, exerciseResults = {} }) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [colorFilter, setColorFilter] = useState<"all" | "white" | "black">("all");
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
  }, [exercises, search, sort, colorFilter, exerciseStats]);

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
    <div className="glass-panel w-[300px] rounded-lg p-3 pt-2 flex flex-col font-['Russo_One']" style={{ minHeight: 705, maxHeight: 715, marginTop: 0, alignSelf: 'flex-start', justifyContent: 'flex-start' }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg" style={{ color: '#fff' }}>Exercises</h3>
          <div className="text-xs text-white/60">
            {exercises.filter(e => e.color === 'white').length} white, {exercises.filter(e => e.color === 'black').length} black
          </div>
        </div>
        <Buttons
          bUTTON="Random"
          onLogInButtonContainerClick={() => {
            if (filteredSortedExercises.length > 0) {
              // Deterministic random selection based on current time (rounded to seconds)
              const timeBasedIndex = Math.floor(Date.now() / 1000) % filteredSortedExercises.length;
              onSelect(filteredSortedExercises[timeBasedIndex]);
            }
          }}
          className="!py-1 !px-6 !rounded-xl font-['Russo_One'] min-w-[110px] h-10 flex items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[var(--blue-84)] shadow-md text-base text-white hover:bg-[rgba(36,245,228,0.10)] transition-all duration-150"
        />
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
        className="space-y-2 overflow-y-scroll exercise-list-scroll"
        style={{ maxHeight: '792px' }}
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
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    {exercise.name}
                    {isBlack ? (
                      <span 
                        className="text-xs px-2 py-1 rounded-full bg-gray-800 text-white border border-gray-600 flex items-center gap-1"
                        title="Black perspective - graj jako czarne"
                      >
                        <span className="w-2 h-2 bg-white rounded-sm"></span>
                        BLACK
                      </span>
                    ) : (
                      <span 
                        className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 border border-gray-400 flex items-center gap-1"
                        title="White perspective - graj jako białe"
                      >
                        <span className="w-2 h-2 bg-black rounded-sm"></span>
                        WHITE
                      </span>
                    )}
                  </div>
                  {exercise.maxMoves && (
                    <div className="text-xs" style={{ color: 'var(--blue-84)' }}>max moves: {exercise.maxMoves}</div>
                  )}
                  <div className="text-xs text-white/70">
                    {Math.floor(exercise.analysis.length / 2)} moves
                  </div>
                  <div className="text-xs text-white/60">
                    {new Date(exercise.createdAt).toLocaleDateString()}
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
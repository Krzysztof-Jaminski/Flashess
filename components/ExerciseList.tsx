import React, { useState, useMemo } from "react";
import Buttons from "./buttons";
import { Exercise } from "../utils/exercises";

interface ExerciseListProps {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  onSelect: (exercise: Exercise) => void;
  onRandom: () => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, currentExercise, onSelect, onRandom }) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
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
  }, [exercises, search, sort, exerciseStats]);

  // Ustal kolor tła kółka (czarne/białe) i kolor liczb
  const getCircleStyle = (exercise: Exercise) => {
    const isBlack = true;
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
    <div className="w-[300px] h-full border rounded-lg p-3 pt-2 flex flex-col font-['Russo_One']" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.3)', marginTop: '0.5rem', marginBottom: '0.5rem', justifyContent: 'flex-start' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg" style={{ color: '#fff' }}>Exercises</h3>
        <Buttons
          bUTTON="Random"
          onLogInButtonContainerClick={onRandom}
          className="!py-1 !px-6 !rounded-xl font-['Russo_One'] min-w-[110px] h-10 flex items-center justify-center bg-[rgba(255,255,255,0.08)] border border-[var(--blue-84)] shadow-md text-base text-white hover:bg-[rgba(36,245,228,0.10)] transition-all duration-150"
        />
      </div>
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="h-[2.125rem] rounded-xl bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full px-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none"
          style={{ borderColor: 'rgba(255,255,255,0.4)', outline: '1px solid rgba(255,255,255,0.4)', outlineOffset: 1 }}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-[2.125rem] mt-2 rounded-xl bg-[rgba(255,255,255,0.05)] border-solid border-[1.5px] box-border w-full pr-8 pl-4 text-[0.938rem] text-white font-['Russo_One'] transition-all duration-150 focus:border-[rgba(36,245,228,0.84)] focus:shadow-[0_0_0_2px_rgba(36,245,228,0.18)] focus:outline-none appearance-none"
          style={{ borderColor: 'rgba(255,255,255,0.4)', outline: '1px solid rgba(255,255,255,0.4)', outlineOffset: 1, background: '#181c1f', color: '#fff' }}
        >
          <option value="name-asc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Name A-Z</option>
          <option value="name-desc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Name Z-A</option>
          <option value="played-desc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Most played</option>
          <option value="played-asc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Least played</option>
          <option value="won-desc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Most won</option>
          <option value="won-asc" style={{ background: '#181c1f', color: '#fff', padding: '0.5rem 1.5rem' }}>Least won</option>
        </select>
      </div>
      <div className="space-y-2 max-h-[507px] overflow-y-auto custom-scrollbar">
        <div className="custom-scrollbar">
          {filteredSortedExercises.map((exercise) => {
            const stats = exerciseStats[exercise.id] || { total: 0, perfect: 0 };
            const isBlack = true;
            return (
              <div
                key={exercise.id}
                className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between font-['Russo_One']`}
                style={currentExercise?.id === exercise.id
                  ? { background: 'rgba(36,245,228,0.30)', border: '1.5px solid var(--blue-84)' }
                  : { background: 'rgba(255,255,255,0.1)' }}
                onClick={() => onSelect(exercise)}
              >
                <div>
                  <div className="text-sm font-bold">{exercise.name}</div>
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
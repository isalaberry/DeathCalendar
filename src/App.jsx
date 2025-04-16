import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

const BIRTH_DATE = new Date(2004, 4, 16);
const TOTAL_YEARS_LIFE = 80;
const STORAGE_KEY = 'semanasDaMinhaVida_clicked';

const calculateLifeInfo = (birthDate, totalYears) => {
  const startDate = new Date(birthDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + totalYears);
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((endDate - startDate) / msPerDay);
  const totalWeeks = Math.ceil(totalDays / 7);

  const yearStartWeekIndices = {};
  yearStartWeekIndices[0] = 1;

  for (let year = 1; year < totalYears; year++) {
    const yearStartDate = new Date(birthDate);
    yearStartDate.setFullYear(birthDate.getFullYear() + year);
    const daysPassed = Math.floor((yearStartDate - birthDate) / msPerDay);
    const startWeekIndex = Math.floor(daysPassed / 7);
    yearStartWeekIndices[startWeekIndex] = year + 1;
  }
  return { totalWeeks, yearStartWeekIndices };
};

function App() {
  const [clickedWeeks, setClickedWeeks] = useState({});

  const lifeInfo = useMemo(() => calculateLifeInfo(BIRTH_DATE, TOTAL_YEARS_LIFE), []);
  const { totalWeeks, yearStartWeekIndices } = lifeInfo;

  useEffect(() => {
    try {
      const storedWeeks = localStorage.getItem(STORAGE_KEY);
      if (storedWeeks) {
        setClickedWeeks(JSON.parse(storedWeeks));
      }
    } catch (error) {
      console.error("Erro ao carregar semanas do localStorage:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
       if (Object.keys(clickedWeeks).length > 0) {
           localStorage.setItem(STORAGE_KEY, JSON.stringify(clickedWeeks));
       } else {
           localStorage.removeItem(STORAGE_KEY);
       }
    } catch (error) {
        console.error("Erro ao salvar semanas no localStorage:", error);
    }
  }, [clickedWeeks]);

  const handleWeekClick = useCallback((weekIndex) => {
    setClickedWeeks(prev => {
      const newClickedWeeks = { ...prev };
      if (newClickedWeeks[weekIndex]) {
        delete newClickedWeeks[weekIndex];
      } else {
        newClickedWeeks[weekIndex] = true;
      }
      return newClickedWeeks;
    });
  }, []);

  const today = new Date();
  const diffTime = today - BIRTH_DATE;
  const daysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const fullWeeksPassed = Math.floor(daysLived / 7);
  const currentWeekNumber = fullWeeksPassed + 1;
  const progressPercentage = totalWeeks > 0 ? (fullWeeksPassed / totalWeeks) * 100 : 0;


  const renderWeeksGrid = () => {
    const gridElements = [];
    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const isClicked = !!clickedWeeks[weekIndex];
      const yearStartingThisWeek = yearStartWeekIndices[weekIndex];
      const weekNumber = weekIndex + 1;

      gridElements.push(
        <div
          key={weekIndex}
          className={`week-square ${isClicked ? 'clicked' : ''} ${yearStartingThisWeek ? 'new-year-marker' : ''}`}
          onClick={() => handleWeekClick(weekIndex)}
          title={`Semana ${weekNumber}${yearStartingThisWeek ? ` (Início Ano ${yearStartingThisWeek})` : ''}`}
          {...(yearStartingThisWeek && { 'data-year': yearStartingThisWeek })}
        ></div>
      );
    }
    return gridElements;
  };

  return (
    <div className="app-container">
      <h1>SEMANAS DA MINHA VIDA</h1>
      <p>Nascimento: {BIRTH_DATE.toLocaleDateString('pt-PT')}</p>
      <p>Expectativa: {TOTAL_YEARS_LIFE} anos ({totalWeeks} semanas calculadas)</p>
      <p>Semana atual da vida ({today.toLocaleDateString('pt-PT')}): {currentWeekNumber}</p>

      {/* --- BARRA DE PROGRESSO --- */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <div
            className="progress-bar-filled"
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <span className="progress-bar-text">
            {progressPercentage.toFixed(2)}%
          </span>
        </div>
        <p className="progress-label">Progresso da vida (baseado em {totalWeeks} semanas)</p>
      </div>
      {/* --- FIM BARRA DE PROGRESSO --- */}

      <p className="instruction-text">Clique num quadrado para marcá-lo. Um marcador indica o início aproximado de um novo ano.</p>

      <div className="weeks-grid-container">
         {renderWeeksGrid()}
      </div>
    </div>
  );
}

export default App;
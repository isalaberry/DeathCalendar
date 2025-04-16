import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BIRTH_DATE = new Date(2004, 4, 16); 
const TOTAL_YEARS_LIFE = 80;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = TOTAL_YEARS_LIFE * WEEKS_PER_YEAR;
const STORAGE_KEY = 'semanasDaMinhaVida_clicked';
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
// --- Fim Configurações ---

function App() {
  const [clickedWeeks, setClickedWeeks] = useState({});

  // Carregar estado do localStorage (sem alterações)
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

  // Salvar estado no localStorage (sem alterações)
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

  // Função para lidar com o clique numa semana (sem alterações)
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

  // --- Renderização ---

  // Função para renderizar os rótulos dos meses (aproximado)
  const renderMonthLabels = () => {
    // Estima a posição de cada mês (cada mês ~ 4.33 semanas)
    // Colocamos o rótulo mais ou menos no meio do período do mês
    const weeksPerMonthApprox = WEEKS_PER_YEAR / 12;
    return (
      <div className="month-labels-container">
        {/* Espaço vazio para alinhar com a coluna dos anos */}
        <div className="month-label-spacer"></div>
        {MONTHS.map((month, index) => (
          <div key={month} className="month-label">
            {month}
          </div>
        ))}
      </div>
    );
  };

  // Modificado para incluir rótulos de ano
  const renderWeeksGrid = () => {
    const gridElements = [];
    for (let year = 0; year < TOTAL_YEARS_LIFE; year++) {
      // Adiciona o rótulo do ano no início de cada linha (ano de vida)
      gridElements.push(
        <div key={`year-label-${year}`} className="year-label">
          {year + 1} {/* Mostra Ano 1, Ano 2, ... */}
        </div>
      );

      // Adiciona os quadrados das semanas para este ano
      for (let weekInYear = 0; weekInYear < WEEKS_PER_YEAR; weekInYear++) {
        const globalWeekIndex = year * WEEKS_PER_YEAR + weekInYear;
        const isClicked = !!clickedWeeks[globalWeekIndex];

        gridElements.push(
          <div
            key={globalWeekIndex}
            className={`week-square ${isClicked ? 'clicked' : ''}`}
            onClick={() => handleWeekClick(globalWeekIndex)}
            title={`Ano ${year + 1}, Semana ${weekInYear + 1} (Total: ${globalWeekIndex + 1})`}
          ></div>
        );
      }
    }
    return gridElements;
  };

  const today = new Date();
  const diffTime = Math.abs(today - BIRTH_DATE);
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

  return (
    <div className="app-container">
      <h1>SEMANAS DA MINHA VIDA</h1>
      <p>Nascimento: {BIRTH_DATE.toLocaleDateString('pt-PT')}</p>
      <p>Expectativa: {TOTAL_YEARS_LIFE} anos ({TOTAL_WEEKS} semanas)</p>
      <p>Semanas vividas até hoje ({today.toLocaleDateString('pt-PT')}): ~{diffWeeks}</p>
      <p>Clique num quadrado para marcá-lo.</p>

      {/* Renderiza os rótulos dos meses acima da grelha */}
      {renderMonthLabels()}

      {/* Container da Grelha Principal (anos + semanas) */}
      <div className="weeks-grid-container">
         {renderWeeksGrid()}
      </div>
    </div>
  );
}

export default App;
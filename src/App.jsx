import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
const DEFAULT_BIRTH_DATE_STR = '2004-05-16';
const TOTAL_YEARS_LIFE = 80;
const STORAGE_KEY_PREFIX = 'semanasDaMinhaVida_';

const calculateLifeInfo = (birthDate, totalYears) => {
  if (!birthDate || isNaN(birthDate.getTime())) {
      return { totalWeeks: 0, yearStartWeekIndices: {} };
  }
  const startDate = new Date(birthDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + totalYears);
  const msPerDay = 1000 * 60 * 60 * 24; //milisseconds per day

  if (endDate <= startDate) return { totalWeeks: 0, yearStartWeekIndices: {} };

  const totalDays = Math.floor((endDate - startDate) / msPerDay);//(endDate - startDate) returns milliseconds/day
  const totalWeeks = Math.ceil(totalDays / 7);

  const yearStartWeekIndices = {};
  yearStartWeekIndices[0] = 1;

  for (let year = 1; year < totalYears; year++) { //percorre todos os anos começando do nascimento
    const yearStartDate = new Date(birthDate);
    yearStartDate.setFullYear(birthDate.getFullYear() + year);

    if (isNaN(yearStartDate.getTime()) || yearStartDate <= startDate) continue;
    const daysPassed = Math.floor((yearStartDate - birthDate) / msPerDay); //calculate the days passed since birth in ach year
    const startWeekIndex = Math.floor(daysPassed / 7); //quantas semanas desde birth de cada ano
    if (startWeekIndex >= 0) { //avoid ind negativos caso o ano de nascimento seja 0 por exemplo
        yearStartWeekIndices[startWeekIndex] = year + 1;
    }
  }
  return { totalWeeks, yearStartWeekIndices };
};

function App() {
  const [userBirthDate, setUserBirthDate] = useState(() => new Date(DEFAULT_BIRTH_DATE_STR + 'T00:00:00'));
  const [dateInput, setDateInput] = useState(DEFAULT_BIRTH_DATE_STR);
  const [storageKey, setStorageKey] = useState(STORAGE_KEY_PREFIX + DEFAULT_BIRTH_DATE_STR);
  const [clickedWeeks, setClickedWeeks] = useState({});

  const lifeInfo = useMemo(() => {
      console.log("Recalculando lifeInfo para:", userBirthDate);
      return calculateLifeInfo(userBirthDate, TOTAL_YEARS_LIFE);
  }, [userBirthDate]);  // chama a funcao que retorna as infos quando userBirthDate muda

  const { totalWeeks, yearStartWeekIndices } = lifeInfo;

  useEffect(() => {
    setClickedWeeks({});
    if (!storageKey) return;
    console.log("Tentando carregar do localStorage com chave:", storageKey);
    try {
      const storedWeeks = localStorage.getItem(storageKey);
      if (storedWeeks) {
        console.log("Dados encontrados, carregando.");
        setClickedWeeks(JSON.parse(storedWeeks));
      } else {
        console.log("Nenhum dado encontrado para esta chave."); 
  
        const todayForInit = new Date();
        const diffTimeForInit = todayForInit - userBirthDate;
        if (diffTimeForInit > 0) { //valid?
            const daysLivedForInit = Math.floor(diffTimeForInit / (1000 * 60 * 60 * 24));//dias ate hj
            const fullWeeksPassedForInit = Math.floor(daysLivedForInit / 7);
            const initialState = {};
            for (let i = 0; i < fullWeeksPassedForInit; i++) {
                initialState[i] = true;//seta week passada on
            }
            setClickedWeeks(initialState);
            console.log(`Pré-preenchidas ${fullWeeksPassedForInit} semanas para nova data.`);
        }
      
      }
    } catch (error) {
      console.error("Erro ao carregar semanas do localStorage:", error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, userBirthDate]); //carregar dados quando a key muda

  useEffect(() => {
    if (!storageKey) return;

    try {
       if (Object.keys(clickedWeeks).length > 0) {
           localStorage.setItem(storageKey, JSON.stringify(clickedWeeks));
       } else {
           localStorage.removeItem(storageKey);
       }
    } catch (error) {
        console.error("Erro ao salvar semanas no localStorage:", error);
    }
  }, [clickedWeeks, storageKey]);

  // clique na semana
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

  const handleUpdateBirthDate = () => {
    const inputDate = new Date(dateInput + 'T00:00:00');

    if (isNaN(inputDate.getTime()) || dateInput === '') {
      alert("Por favor, insira uma data de nascimento válida.");
      return;
    }
    if (inputDate > new Date()) {
       alert("A data de nascimento não pode ser no futuro.");
       return;
    }

    setUserBirthDate(inputDate);
    setStorageKey(STORAGE_KEY_PREFIX + dateInput);
  };

  const today = new Date();
  let daysLived = 0;
  let fullWeeksPassed = 0;
  let currentWeekNumber = 0;
  let progressPercentage = 0;

  // Só calcula se a data for válida e no passado
  if (userBirthDate && !isNaN(userBirthDate.getTime()) && userBirthDate < today) {
      const diffTime = today - userBirthDate;
      daysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      fullWeeksPassed = Math.floor(daysLived / 7);
      currentWeekNumber = fullWeeksPassed + 1;
      progressPercentage = totalWeeks > 0 ? (fullWeeksPassed / totalWeeks) * 100 : 0;
  }

  const renderWeeksGrid = () => {
    const gridElements = [];
    if(totalWeeks <= 0) return <p>Insira uma data de nascimento válida para gerar o calendário.</p>;

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
    <div className="app-container"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleUpdateBirthDate();
        }
    }}>
      <h1 className="title">DEATH CALENDAR</h1>

      <div className="birthdate-input-section">
        <label htmlFor="birthdate">Sua Data de Nascimento:</label>
        <input
            type="date"
            id="birthdate"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
        />
        <button onClick={handleUpdateBirthDate}>Atualizar Calendário</button>
      </div>

      {userBirthDate && !isNaN(userBirthDate.getTime()) && (
          <>
              <p>Nascimento: {userBirthDate.toLocaleDateString('pt-PT')}</p>
              <p>Expectativa: {TOTAL_YEARS_LIFE} anos ({totalWeeks > 0 ? `${totalWeeks} semanas calculadas` : 'N/A'})</p>
              {currentWeekNumber > 0 && (
                <p>Semana atual da vida ({today.toLocaleDateString('pt-PT')}): {currentWeekNumber}</p>
              )}

              {totalWeeks > 0 && (
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
              )}
          </>
      )}
      <p className='instruction-text'> Viva a sua vida como se fosse morrer. <strong>Porque você vai.</strong></p>

      <div className="weeks-grid-container">
         {renderWeeksGrid()}
      </div>

    <p className="github-link">
        Follow me on   GitHub! <a href="https://github.com/isalaberry" target="_blank" rel="noopener noreferrer">
        isalaberry
      </a>
    </p>
    </div>
  );
}

export default App;
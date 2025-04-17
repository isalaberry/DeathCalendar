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

  const msPerDay = 1000 * 60 * 60 * 24;

  if (endDate <= startDate) return { totalWeeks: 0, yearStartWeekIndices: {} };

  const totalDays = Math.floor((endDate - startDate) / msPerDay);
  const totalWeeks = Math.ceil(totalDays / 7);

  const yearStartWeekIndices = {};
  yearStartWeekIndices[0] = 1;

  for (let year = 1; year < totalYears; year++) {
    const yearStartDate = new Date(birthDate);
    yearStartDate.setFullYear(birthDate.getFullYear() + year);

    if (isNaN(yearStartDate.getTime()) || yearStartDate <= startDate) continue;

    const daysPassed = Math.floor((yearStartDate - birthDate) / msPerDay);
    const startWeekIndex = Math.floor(daysPassed / 7);

    if (startWeekIndex >= 0 && startWeekIndex < totalWeeks) {
        yearStartWeekIndices[startWeekIndex] = year + 1;
    }
  }

  const finalIndices = {};
  for(const idx in yearStartWeekIndices){
    if(parseInt(idx) < totalWeeks){
        finalIndices[idx] = yearStartWeekIndices[idx];
    }
  }

  return { totalWeeks, yearStartWeekIndices: finalIndices };
};

function App() {
  const [userBirthDate, setUserBirthDate] = useState(() => new Date(DEFAULT_BIRTH_DATE_STR + 'T00:00:00'));
  const [dateInput, setDateInput] = useState(DEFAULT_BIRTH_DATE_STR);
  const [storageKey, setStorageKey] = useState(STORAGE_KEY_PREFIX + DEFAULT_BIRTH_DATE_STR);
  const [clickedWeeks, setClickedWeeks] = useState({});

  const lifeInfo = useMemo(() => {
      return calculateLifeInfo(userBirthDate, TOTAL_YEARS_LIFE);
  }, [userBirthDate]);

  const { totalWeeks, yearStartWeekIndices } = lifeInfo;

  useEffect(() => {
    if (!storageKey || !userBirthDate || isNaN(userBirthDate.getTime()) || totalWeeks <= 0) {
      setClickedWeeks({});
      return;
    }

    const today = new Date();
    let currentWeekIndex = -1;

    if (userBirthDate < today) {
        const diffTime = today.getTime() - userBirthDate.getTime();
        const daysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        currentWeekIndex = Math.floor(daysLived / 7);
        if (currentWeekIndex >= totalWeeks) {
            currentWeekIndex = totalWeeks - 1;
        }
         if (currentWeekIndex < 0) {
            currentWeekIndex = -1;
         }
    }

    try {
      const storedWeeks = localStorage.getItem(storageKey);

      if (storedWeeks) {
        const loadedWeeks = JSON.parse(storedWeeks);
        const filteredLoadedWeeks = {};

        for (const weekIndexStr in loadedWeeks) {
          const weekIndex = parseInt(weekIndexStr, 10);
          if (!isNaN(weekIndex) && weekIndex >= 0 && weekIndex <= currentWeekIndex) {
            filteredLoadedWeeks[weekIndex] = true;
          }
        }
        setClickedWeeks(filteredLoadedWeeks);

      } else {
        const initialState = {};
        if (currentWeekIndex >= 0) {
            for (let i = 0; i <= currentWeekIndex; i++) {
                 if (i < totalWeeks) {
                    initialState[i] = true;
                 }
            }
        }
        setClickedWeeks(initialState);
      }
    } catch (error) {
      localStorage.removeItem(storageKey);
      setClickedWeeks({});
    }
  }, [storageKey, userBirthDate, totalWeeks]);

  useEffect(() => {
    if (!storageKey) return;
    try {
       if (Object.keys(clickedWeeks).length > 0) {
           localStorage.setItem(storageKey, JSON.stringify(clickedWeeks));
       } else {
           localStorage.removeItem(storageKey);
       }
    } catch (error) {}
  }, [clickedWeeks, storageKey]);

  const handleWeekClick = useCallback((clickedIndex) => {
    setClickedWeeks(() => {
      const newClickedWeeks = {};
      for (let i = 0; i <= clickedIndex; i++) {
        if (i < totalWeeks) {
          newClickedWeeks[i] = true;
        }
      }
      return newClickedWeeks;
    });
  }, [totalWeeks]);

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

  const progressInfo = useMemo(() => {
    const filledIndices = Object.keys(clickedWeeks).map(Number);

    if (filledIndices.length === 0 || !userBirthDate || isNaN(userBirthDate.getTime())) {
      return {
        filledWeeksCount: 0, percentage: 0, lastFilledWeekIndex: -1,
        ageString: "Nenhuma semana selecionada"
      };
    }

    const lastFilledWeekIndex = Math.max(...filledIndices);
    const filledWeeksCount = lastFilledWeekIndex + 1;
    const percentage = totalWeeks > 0 ? (filledWeeksCount / totalWeeks) * 100 : 0;

    let ageString = "Calculando idade...";
    try {
        const daysPassed = filledWeeksCount * 7;
        const msPassed = daysPassed * (1000 * 60 * 60 * 24);
        const endDateOfSelectedWeek = new Date(userBirthDate.getTime() + msPassed);
        const ageDiffMs = endDateOfSelectedWeek.getTime() - userBirthDate.getTime();

        if (ageDiffMs >= 0) {
            const totalDaysDiff = Math.max(0, Math.floor(ageDiffMs / (1000 * 60 * 60 * 24)));

            let completedYears = 0;
            let daysInYears = 0;
            let currentYear = userBirthDate.getFullYear();

            while (true) {
                let daysInCurrentYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 366 : 365;
                if (daysInYears + daysInCurrentYear > totalDaysDiff) {
                    break;
                }
                daysInYears += daysInCurrentYear;
                completedYears++;
                currentYear++;
            }

            const remainingDays = totalDaysDiff - daysInYears;

            const yearText = completedYears === 1 ? 'ano' : 'anos';
            const dayText = remainingDays === 1 ? 'dia' : 'dias';

            ageString = `${completedYears} ${yearText}, ${remainingDays} ${dayText}`;

        } else {
             ageString = "Data selecionada anterior ao nascimento";
        }
    } catch(e) {
        ageString = "Erro ao calcular idade";
    }

    return { filledWeeksCount, percentage, lastFilledWeekIndex, ageString };
  }, [clickedWeeks, totalWeeks, userBirthDate]);

  const today = new Date();
  let currentWeekNumberBasedOnDate = 0;
   if (userBirthDate && !isNaN(userBirthDate.getTime()) && userBirthDate < today) {
      const diffTime = today.getTime() - userBirthDate.getTime();
      const daysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const fullWeeksPassed = Math.floor(daysLived / 7);
      currentWeekNumberBasedOnDate = fullWeeksPassed + 1;
   }

  const renderWeeksGrid = () => {
    const gridElements = [];
    if (totalWeeks <= 0) return <p>Insira uma data de nascimento válida para gerar o calendário.</p>;

    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const isClicked = !!clickedWeeks[weekIndex];
      const yearStartingThisWeek = yearStartWeekIndices[weekIndex];
      const weekNumberForDisplay = weekIndex + 1;

      gridElements.push(
        <div
          key={weekIndex}
          className={`week-square ${isClicked ? 'clicked' : ''} ${yearStartingThisWeek ? 'new-year-marker' : ''}`}
          onClick={() => handleWeekClick(weekIndex)}
          title={`Semana ${weekNumberForDisplay}${yearStartingThisWeek ? ` (Início Ano ${yearStartingThisWeek})` : ''}`}
          {...(yearStartingThisWeek && { 'data-year': yearStartingThisWeek })}
        ></div>
      );
    }
    return gridElements;
  };

  return (
    <div className="app-container"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && document.activeElement?.id === 'birthdate') {
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
            {currentWeekNumberBasedOnDate > 0 && currentWeekNumberBasedOnDate <= totalWeeks && (
              <p>Semana atual da vida ({today.toLocaleDateString('pt-PT')}): {currentWeekNumberBasedOnDate}</p>
            )}
            <p className="age-display">
                Idade na semana selecionada: <strong>{progressInfo.ageString}</strong>
            </p>

            {totalWeeks > 0 && (
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-filled"
                    style={{ width: `${progressInfo.percentage}%` }}
                  ></div>
                  <span className="progress-bar-text">
                    {progressInfo.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="progress-label">
                    {progressInfo.filledWeeksCount} de {totalWeeks} semanas preenchidas
                </p>
              </div>
            )}
          </>
      )}
       <p className='instruction-text'> Viva a sua vida como se fosse morrer. <strong>Porque você vai.</strong></p>

      <div className="weeks-grid-container">
          {renderWeeksGrid()}
      </div>

      <p className="github-link">
        Follow me on GitHub! <a href="https://github.com/isalaberry" target="_blank" rel="noopener noreferrer">
          isalaberry
        </a>
      </p>
    </div>
  );
}

export default App;
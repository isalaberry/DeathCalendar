import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import BirthdateInput from './components/BirthdateInput';
import LifeInfoDisplay from './components/LifeInfoDisplay';
import ProgressBar from './components/ProgressBar';
import WeeksGrid from './components/WeeksGrid';
import { calculateLifeInfo } from './utils/lifeCalculations';

const DEFAULT_BIRTH_DATE_STR = '2004-05-16';
const TOTAL_YEARS_LIFE = 80;
const STORAGE_KEY_PREFIX = 'semanasDaMinhaVida_';

function App() {
  const [userBirthDate, setUserBirthDate] = useState(() => new Date(DEFAULT_BIRTH_DATE_STR + 'T00:00:00'));
  const [dateInput, setDateInput] = useState(DEFAULT_BIRTH_DATE_STR);
  const [storageKey, setStorageKey] = useState(STORAGE_KEY_PREFIX + DEFAULT_BIRTH_DATE_STR);
  const [clickedWeeks, setClickedWeeks] = useState({});

  const lifeInfo = useMemo(() => {
      return calculateLifeInfo(userBirthDate, TOTAL_YEARS_LIFE);
  }, [userBirthDate]);
  const { totalWeeks, yearStartWeekIndices } = lifeInfo;

  const progressInfo = useMemo(() => {
      // (Lógica de cálculo da idade e progresso)
      const filledIndices = Object.keys(clickedWeeks).map(Number);

      if (filledIndices.length === 0 || !userBirthDate || isNaN(userBirthDate.getTime())) {
          return { filledWeeksCount: 0, percentage: 0, lastFilledWeekIndex: -1, ageString: "Nenhuma semana selecionada" };
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
             if (currentWeekIndex >= totalWeeks) currentWeekIndex = totalWeeks - 1;
             if (currentWeekIndex < 0) currentWeekIndex = -1;
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
                      if (i < totalWeeks) initialState[i] = true;
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

  const handleDateInputChange = useCallback((event) => {
    setDateInput(event.target.value);
  }, []);

  const handleUpdateBirthDate = useCallback(() => {
      const inputDate = new Date(dateInput + 'T00:00:00');
        if (isNaN(inputDate.getTime()) || dateInput === '') {
          alert("Por favor, insira uma data de nascimento válida."); return;
        }
        if (inputDate > new Date()) {
           alert("A data de nascimento não pode ser no futuro."); return;
        }
        setUserBirthDate(inputDate);
        setStorageKey(STORAGE_KEY_PREFIX + dateInput);
  }, [dateInput]);
   const handleWeekClick = useCallback((clickedIndex) => {
       setClickedWeeks(() => {
           const newClickedWeeks = {};
           for (let i = 0; i <= clickedIndex; i++) {
              if (i < totalWeeks) newClickedWeeks[i] = true;
           }
           return newClickedWeeks;
       });
   }, [totalWeeks]);

   const today = new Date();
   let currentWeekNumberBasedOnDate = 0;
    if (userBirthDate && !isNaN(userBirthDate.getTime()) && userBirthDate < today) {
        const diffTime = today.getTime() - userBirthDate.getTime();
        const daysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const fullWeeksPassed = Math.floor(daysLived / 7);
        currentWeekNumberBasedOnDate = fullWeeksPassed + 1;
    }

  return (
    <div className="app-container">
      <h1 className="title">DEATH CALENDAR</h1>

      <BirthdateInput
          dateInput={dateInput}
          onDateChange={handleDateInputChange}
          onUpdateClick={handleUpdateBirthDate}
      />

      <LifeInfoDisplay
          userBirthDate={userBirthDate}
          totalYears={TOTAL_YEARS_LIFE}
          totalWeeks={totalWeeks}
          currentWeekNumber={currentWeekNumberBasedOnDate}
          ageString={progressInfo.ageString}
      />

      <ProgressBar
          percentage={progressInfo.percentage}
          filledWeeksCount={progressInfo.filledWeeksCount}
          totalWeeks={totalWeeks}
      />

      <p className='instruction-text'> Viva a sua vida como se fosse morrer. <strong>Porque você vai.</strong></p>

      <WeeksGrid
          totalWeeks={totalWeeks}
          yearStartWeekIndices={yearStartWeekIndices}
          clickedWeeks={clickedWeeks}
          onWeekClick={handleWeekClick}
      />

      <p className="github-link">
        Follow me on GitHub! <a href="https://github.com/isalaberry" target="_blank" rel="noopener noreferrer">
          isalaberry
        </a>
      </p>
    </div>
  );
}

export default App;
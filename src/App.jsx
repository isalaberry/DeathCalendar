import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import './App.css';
import LanguageSwitcher from './components/LanguageSwitcher';
import { calculateLifeInfo } from './utils/lifeCalculations';

const DEFAULT_BIRTH_DATE_STR = '2004-05-16';
const TOTAL_YEARS_LIFE = 80;
const STORAGE_KEY_PREFIX = 'semanasDaMinhaVida_';

function App() {
    const { t, i18n } = useTranslation();
    const [userBirthDate, setUserBirthDate] = useState(() => new Date(DEFAULT_BIRTH_DATE_STR + 'T00:00:00'));
    const [dateInput, setDateInput] = useState(DEFAULT_BIRTH_DATE_STR);
    const [storageKey, setStorageKey] = useState(STORAGE_KEY_PREFIX + DEFAULT_BIRTH_DATE_STR);
    const [clickedWeeks, setClickedWeeks] = useState({});

    const lifeInfo = useMemo(() => {
        return calculateLifeInfo(userBirthDate, TOTAL_YEARS_LIFE);
    }, [userBirthDate]);
    const { totalWeeks, yearStartWeekIndices } = lifeInfo;

    const progressInfo = useMemo(() => {
        const filledIndices = Object.keys(clickedWeeks).map(Number);
        const defaultReturn = { filledWeeksCount: 0, percentage: 0, lastFilledWeekIndex: -1, completedYears: undefined, remainingDays: undefined };

        if (filledIndices.length === 0 || !userBirthDate || isNaN(userBirthDate.getTime())) {
            return defaultReturn;
        }

        const lastFilledWeekIndex = Math.max(...filledIndices);
        const filledWeeksCount = lastFilledWeekIndex + 1;
        const percentage = totalWeeks > 0 ? (filledWeeksCount / totalWeeks) * 100 : 0;

        let completedYears, remainingDays;
        let calculationStatus = "ok";

        try {
            const daysPassed = filledWeeksCount * 7;
            const msPassed = daysPassed * (1000 * 60 * 60 * 24);
            const endDateOfSelectedWeek = new Date(userBirthDate.getTime() + msPassed);
            const ageDiffMs = endDateOfSelectedWeek.getTime() - userBirthDate.getTime();

            if (ageDiffMs >= 0) {
                const totalDaysDiff = Math.max(0, Math.floor(ageDiffMs / (1000 * 60 * 60 * 24)));
                let tempYears = 0;
                let daysInYears = 0;
                let currentYear = userBirthDate.getFullYear();
                while (true) {
                    let daysInCurrentYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 366 : 365;
                    if (daysInYears + daysInCurrentYear > totalDaysDiff) break;
                    daysInYears += daysInCurrentYear;
                    tempYears++;
                    currentYear++;
                }
                completedYears = tempYears;
                remainingDays = totalDaysDiff - daysInYears;
            } else {
                 calculationStatus = "selectedBeforeBirth";
            }
        } catch(e) {
            console.error("Erro no cálculo da idade:", e);
            calculationStatus = "errorCalculatingAge";
        }

        return { filledWeeksCount, percentage, lastFilledWeekIndex, completedYears, remainingDays, calculationStatus };
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
            alert(t('alertInvalidDate')); return;
        }
        if (inputDate > new Date()) {
            alert(t('alertFutureDate')); return;
        }
        setUserBirthDate(inputDate);
        setStorageKey(STORAGE_KEY_PREFIX + dateInput);
    }, [dateInput, t]);

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

    let ageDisplayString = t('noWeekSelected');
    if(progressInfo.calculationStatus === "selectedBeforeBirth") {
        ageDisplayString = t('selectedBeforeBirth');
    } else if (progressInfo.calculationStatus === "errorCalculatingAge") {
        ageDisplayString = t('errorCalculatingAge');
    } else if (progressInfo.completedYears !== undefined && progressInfo.remainingDays !== undefined) {
        const yearLabel = progressInfo.completedYears === 1 ? t('yearSingular') : t('yearPlural');
        const dayLabel = progressInfo.remainingDays === 1 ? t('daySingular') : t('dayPlural');
        ageDisplayString = `${progressInfo.completedYears} ${yearLabel}, ${progressInfo.remainingDays} ${dayLabel}`;
    } else if (progressInfo.filledWeeksCount > 0) {
        ageDisplayString = t('calculatingAge');
    }


    const renderWeeksGrid = () => {
        const gridElements = [];
        if (totalWeeks <= 0) return <p>{t('invalidDatePrompt')}</p>;

        const weekText = t('week');
        const yearStartText = t('startOfYear');

        for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
            const isClicked = !!clickedWeeks[weekIndex];
            const yearStartingThisWeek = yearStartWeekIndices[weekIndex];
            const weekNumberForDisplay = weekIndex + 1;
            const title = `${weekText} ${weekNumberForDisplay}${yearStartingThisWeek ? ` (${yearStartText} ${yearStartingThisWeek})` : ''}`;

            gridElements.push(
                <div
                    key={weekIndex}
                    className={`week-square ${isClicked ? 'clicked' : ''} ${yearStartingThisWeek ? 'new-year-marker' : ''}`}
                    onClick={() => handleWeekClick(weekIndex)}
                    title={title}
                    {...(yearStartingThisWeek && { 'data-year': yearStartingThisWeek })}
                ></div>
            );
        }
        return gridElements;
    };

    return (
        <div className="app-container" style={{ position: 'relative' }}>
            <LanguageSwitcher />

            <h1 className="title">{t('appTitle')}</h1>

            <div className="birthdate-input-section">
                <label htmlFor="birthdate">{t('birthDateLabel')}</label>
                <input
                    type="date"
                    id="birthdate"
                    value={dateInput}
                    onChange={handleDateInputChange}
                    max={new Date().toISOString().split('T')[0]}
                />
                <button onClick={handleUpdateBirthDate}>{t('updateButton')}</button>
            </div>

            {userBirthDate && !isNaN(userBirthDate.getTime()) && (
                <>
                    <p>{t('birthDateInfo')} {userBirthDate.toLocaleDateString(i18n.language)}</p>
                    <p>{t('expectancyInfo')} {TOTAL_YEARS_LIFE} {t('yearsSuffix')} ({totalWeeks > 0 ? `${totalWeeks} ${t('weeksCalculated')}` : t('notAvailable')})</p>
                    {currentWeekNumberBasedOnDate > 0 && currentWeekNumberBasedOnDate <= totalWeeks && (
                        <p>{t('currentWeekInfo')} ({today.toLocaleDateString(i18n.language)}): {currentWeekNumberBasedOnDate}</p>
                    )}
                    <p className="age-display">
                        {t('ageSelectedWeek')} <strong>{ageDisplayString}</strong>
                    </p>

                    {totalWeeks > 0 && (
                        <div className="progress-section">
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-filled"
                                    style={{ width: `${progressInfo.percentage}%` }}
                                ></div>
                                <span className="progress-bar-text">
                                    {progressInfo.percentage.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                </span>
                            </div>
                            <p className="progress-label">
                                {t('weeksFilled', { filledCount: progressInfo.filledWeeksCount, totalWeeks: totalWeeks })}
                            </p>
                        </div>
                    )}
                </>
            )}

            <p className='instruction-text'>
                <Trans i18nKey="instructionText">
                    Viva a sua vida como se fosse morrer. <strong>Porque você vai.</strong>
                </Trans>
            </p>

            <div className="weeks-grid-container">
                {renderWeeksGrid()}
            </div>

            <p className="github-link">
                {t('githubPrompt')} <a href="https://github.com/isalaberry" target="_blank" rel="noopener noreferrer">
                    isalaberry
                </a>
            </p>
        </div>
    );
}

export default App;
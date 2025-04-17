import React from 'react';
import WeekSquare from './WeekSquare';

function WeeksGrid({ totalWeeks, yearStartWeekIndices, clickedWeeks, onWeekClick }) {

  if (totalWeeks <= 0) {
    return <p>Insira uma data de nascimento válida para gerar o calendário.</p>;
  }

  const gridElements = [];
  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const isClicked = !!clickedWeeks[weekIndex];
    const yearStartingThisWeek = yearStartWeekIndices[weekIndex];
    const isNewYear = !!yearStartingThisWeek;
    const weekNumberForDisplay = weekIndex + 1;
    const title = `Semana ${weekNumberForDisplay}${isNewYear ? ` (Início Ano ${yearStartingThisWeek})` : ''}`;

    gridElements.push(
      <WeekSquare
        key={weekIndex}
        weekIndex={weekIndex}
        isClicked={isClicked}
        isNewYear={isNewYear}
        yearNumber={yearStartingThisWeek}
        title={title}
        onClick={onWeekClick}
      />
    );
  }

  return (
      <div className="weeks-grid-container">
          {gridElements}
      </div>
  );
}

export default WeeksGrid;
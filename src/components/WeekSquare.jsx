import React from 'react';

const WeekSquare = React.memo(({ weekIndex, isClicked, isNewYear, yearNumber, title, onClick }) => {
  const handleClick = () => {
    onClick(weekIndex);
  };

  const classNames = `week-square ${isClicked ? 'clicked' : ''} ${isNewYear ? 'new-year-marker' : ''}`;

  return (
    <div
      className={classNames}
      onClick={handleClick}
      title={title}
      {...(isNewYear && { 'data-year': yearNumber })}
    ></div>
  );
});

export default WeekSquare;
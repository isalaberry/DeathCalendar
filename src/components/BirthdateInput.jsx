import React from 'react';

function BirthdateInput({ dateInput, onDateChange, onUpdateClick }) {
  const maxDate = new Date().toISOString().split('T')[0];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onUpdateClick();
    }
  };

  return (
    <div className="birthdate-input-section">
      <label htmlFor="birthdate">Sua Data de Nascimento:</label>
      <input
        type="date"
        id="birthdate"
        value={dateInput}
        onChange={onDateChange}
        max={maxDate}
        onKeyDown={handleKeyDown}
      />
      <button onClick={onUpdateClick}>Atualizar Calendário</button>
    </div>
  );
}

export default BirthdateInput;
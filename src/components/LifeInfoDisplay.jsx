import React from 'react';

function LifeInfoDisplay({ userBirthDate, totalYears, totalWeeks, currentWeekNumber, ageString }) {
    const today = new Date();

    if (!userBirthDate || isNaN(userBirthDate.getTime())) {
        return null;
    }

    return (
        <>
            <p>Nascimento: {userBirthDate.toLocaleDateString('pt-PT')}</p>
            <p>Expectativa: {totalYears} anos ({totalWeeks > 0 ? `${totalWeeks} semanas calculadas` : 'N/A'})</p>
            {currentWeekNumber > 0 && currentWeekNumber <= totalWeeks && (
                <p>Semana atual da vida ({today.toLocaleDateString('pt-PT')}): {currentWeekNumber}</p>
            )}
            <p className="age-display">
                Idade na semana selecionada: <strong>{ageString}</strong>
            </p>
        </>
    );
}

export default LifeInfoDisplay;
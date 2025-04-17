import React from 'react';
import { useTranslation } from 'react-i18next';

function LifeInfoDisplay({ userBirthDate, totalYears, totalWeeks, currentWeekNumber, ageString }) {
    const { t, i18n } = useTranslation();
    const today = new Date();

    if (!userBirthDate || isNaN(userBirthDate.getTime())) {
        return null;
    }

     let ageDisplay = t('noWeekSelected');
     if (progressInfo.completedYears !== undefined && progressInfo.remainingDays !== undefined) {
          const yearLabel = progressInfo.completedYears === 1 ? t('yearSingular') : t('yearPlural');
          const dayLabel = progressInfo.remainingDays === 1 ? t('daySingular') : t('dayPlural');
          ageDisplay = `${progressInfo.completedYears} ${yearLabel}, ${progressInfo.remainingDays} ${dayLabel}`;
     } else if (progressInfo.ageString === "Calculando idade...") {
         ageDisplay = t('calculatingAge');
     } else if (progressInfo.ageString) {
          if (progressInfo.ageString === "Data selecionada anterior ao nascimento") ageDisplay = t('selectedBeforeBirth');
          else if (progressInfo.ageString === "Erro ao calcular idade") ageDisplay = t('errorCalculatingAge');
     }
 
 

    return (
        <>
            <p>{t('birthDateInfo')} {userBirthDate.toLocaleDateString(i18n.language)}</p>
            <p>{t('expectancyInfo')} {totalYears} {t('yearsSuffix')} ({totalWeeks > 0 ? `${totalWeeks} ${t('weeksCalculated')}` : t('notAvailable')})</p>
            {currentWeekNumber > 0 && currentWeekNumber <= totalWeeks && (
                <p>{t('currentWeekInfo')} ({today.toLocaleDateString(i18n.language)}): {currentWeekNumber}</p>
            )}
            <p className="age-display">
                {t('ageSelectedWeek')} <strong>{ageDisplay}</strong>
            </p>
        </>
    );
}

export default LifeInfoDisplay;
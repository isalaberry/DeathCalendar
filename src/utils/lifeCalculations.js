export const calculateLifeInfo = (birthDate, totalYears) => {
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
    yearStartWeekIndices[0] = 0; // Ano 1 começa na semana 0

    for (let year = 1; year < totalYears; year++) {
        const yearStartDate = new Date(birthDate);
        yearStartDate.setFullYear(birthDate.getFullYear() + year);

        if (isNaN(yearStartDate.getTime()) || yearStartDate <= startDate) continue;

        const daysPassed = Math.floor((yearStartDate - birthDate) / msPerDay);
        const startWeekIndex = Math.floor(daysPassed / 7);

        if (startWeekIndex >= 0 && startWeekIndex < totalWeeks) {
            yearStartWeekIndices[startWeekIndex] = year;
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


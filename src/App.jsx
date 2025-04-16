import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';

// Valor inicial como fallback ou default
const DEFAULT_BIRTH_DATE_STR = '2004-05-16';
const TOTAL_YEARS_LIFE = 80;
const STORAGE_KEY_PREFIX = 'semanasDaMinhaVida_'; // Prefixo para guardar por data

// Função de cálculo agora aceita a data como argumento
const calculateLifeInfo = (birthDate, totalYears) => {
  if (!birthDate || isNaN(birthDate.getTime())) {
      // Retorna valores padrão ou vazios se a data for inválida
      return { totalWeeks: 0, yearStartWeekIndices: {} };
  }

  const startDate = new Date(birthDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + totalYears);
  const msPerDay = 1000 * 60 * 60 * 24;

  // Garante que endDate é posterior a startDate
  if (endDate <= startDate) return { totalWeeks: 0, yearStartWeekIndices: {} };

  const totalDays = Math.floor((endDate - startDate) / msPerDay);
  const totalWeeks = Math.ceil(totalDays / 7);

  const yearStartWeekIndices = {};
  yearStartWeekIndices[0] = 1; // Ano 1 sempre começa na semana índice 0

  for (let year = 1; year < totalYears; year++) {
    const yearStartDate = new Date(birthDate);
    yearStartDate.setFullYear(birthDate.getFullYear() + year);
    // Garante que a data do próximo ano é válida e posterior
    if (isNaN(yearStartDate.getTime()) || yearStartDate <= startDate) continue;

    const daysPassed = Math.floor((yearStartDate - birthDate) / msPerDay);
    const startWeekIndex = Math.floor(daysPassed / 7);
    // Evita índices negativos ou inválidos se houver problema de data
    if (startWeekIndex >= 0) {
        yearStartWeekIndices[startWeekIndex] = year + 1;
    }
  }
  return { totalWeeks, yearStartWeekIndices };
};

function App() {
  // Estado para a data de nascimento usada nos cálculos
  const [userBirthDate, setUserBirthDate] = useState(() => new Date(DEFAULT_BIRTH_DATE_STR + 'T00:00:00'));
  // Estado para o valor do input (formato YYYY-MM-DD)
  const [dateInput, setDateInput] = useState(DEFAULT_BIRTH_DATE_STR);
  // Estado para os cliques (chave agora inclui data para evitar conflitos)
  const [storageKey, setStorageKey] = useState(STORAGE_KEY_PREFIX + DEFAULT_BIRTH_DATE_STR);
  const [clickedWeeks, setClickedWeeks] = useState({});

  // Recalcula informações quando userBirthDate muda
  const lifeInfo = useMemo(() => {
      console.log("Recalculando lifeInfo para:", userBirthDate); // Debug
      return calculateLifeInfo(userBirthDate, TOTAL_YEARS_LIFE);
  }, [userBirthDate]);

  const { totalWeeks, yearStartWeekIndices } = lifeInfo;

  // Efeito para carregar dados quando a CHAVE DE ARMAZENAMENTO (dependente da data) muda
  useEffect(() => {
    setClickedWeeks({}); // Limpa o estado atual antes de carregar o novo
    if (!storageKey) return; // Não carrega se não houver chave definida

    console.log("Tentando carregar do localStorage com chave:", storageKey); // Debug
    try {
      const storedWeeks = localStorage.getItem(storageKey);
      if (storedWeeks) {
        console.log("Dados encontrados, carregando."); // Debug
        setClickedWeeks(JSON.parse(storedWeeks));
      } else {
        console.log("Nenhum dado encontrado para esta chave."); 
  
        const todayForInit = new Date();
        const diffTimeForInit = todayForInit - userBirthDate;
        if (diffTimeForInit > 0) { // Só preenche se a data for no passado
            const daysLivedForInit = Math.floor(diffTimeForInit / (1000 * 60 * 60 * 24));
            const fullWeeksPassedForInit = Math.floor(daysLivedForInit / 7);
            const initialState = {};
            for (let i = 0; i < fullWeeksPassedForInit; i++) {
                initialState[i] = true;
            }
            setClickedWeeks(initialState);
            console.log(`Pré-preenchidas ${fullWeeksPassedForInit} semanas para nova data.`);
        }
      
      }
    } catch (error) {
      console.error("Erro ao carregar semanas do localStorage:", error);
      localStorage.removeItem(storageKey); // Remove dados corrompidos para essa chave
    }
  }, [storageKey, userBirthDate]); // Depende da chave (data)

  // Efeito para salvar dados quando os cliques mudam
  useEffect(() => {
    if (!storageKey) return; // Não salva se não houver chave

    try {
       // Só guarda se houver algo para guardar (evita guardar objeto vazio desnecessariamente)
       if (Object.keys(clickedWeeks).length > 0) {
           localStorage.setItem(storageKey, JSON.stringify(clickedWeeks));
       } else {
           // Remove a chave se o utilizador desmarcar tudo
           localStorage.removeItem(storageKey);
       }
    } catch (error) {
        console.error("Erro ao salvar semanas no localStorage:", error);
    }
  }, [clickedWeeks, storageKey]);

  // Handler para clique na semana (sem alterações na lógica interna)
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

  // Handler para atualizar a data de nascimento
  const handleUpdateBirthDate = () => {
    // Validação básica da data inserida
    const inputDate = new Date(dateInput + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário na conversão

    if (isNaN(inputDate.getTime()) || dateInput === '') {
      alert("Por favor, insira uma data de nascimento válida.");
      return;
    }
    if (inputDate > new Date()) {
       alert("A data de nascimento não pode ser no futuro.");
       return;
    }

    console.log("Atualizando data de nascimento para:", inputDate); // Debug
    setUserBirthDate(inputDate); // Atualiza a data principal
    // Define a nova chave para o localStorage baseada na nova data
    setStorageKey(STORAGE_KEY_PREFIX + dateInput);
    // O useEffect dependente de 'storageKey' / 'userBirthDate' tratará de limpar e carregar/preencher
  };

  // Cálculos de progresso baseados na data do utilizador
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
     // ... (lógica de renderização igual, já usa totalWeeks e yearStartWeekIndices recalculados) ...
    const gridElements = [];
    // Adiciona verificação para não renderizar se totalWeeks for 0
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
    <div className="app-container">
      <h1>SEMANAS DA MINHA VIDA</h1>

      {/* Secção de Input da Data de Nascimento */}
      <div className="birthdate-input-section">
        <label htmlFor="birthdate">Sua Data de Nascimento:</label>
        <input
            type="date"
            id="birthdate"
            value={dateInput} // Controlado pelo estado dateInput
            onChange={(e) => setDateInput(e.target.value)} // Atualiza estado do input
            // Define data máxima como hoje para evitar datas futuras
            max={new Date().toISOString().split('T')[0]}
        />
        <button onClick={handleUpdateBirthDate}>Atualizar Calendário</button>
      </div>

      {/* Informações e Barra de Progresso (só mostram valores válidos) */}
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

      <p className="instruction-text">Clique num quadrado para marcá-lo. Um marcador indica o início aproximado de um novo ano.</p>

      <div className="weeks-grid-container">
         {renderWeeksGrid()}
      </div>
    </div>
  );
}

export default App;
# 💀 Death Calendar 💀

**Visualize as Semanas da Sua Vida**

[![Screenshot da Aplicação](./death-calendar-three.vercel.app_.png)](https://death-calendar-three.vercel.app/)
*(Clique na imagem para ver a demo!)*

---

🚀 **Demo Online:** [**death-calendar-three.vercel.app**](https://death-calendar-three.vercel.app/) 🚀

---

## 📜 Conceito

Inspirado na filosofia *memento mori*, o Death Calendar é uma aplicação web interativa que o ajuda a visualizar o tempo. Ao inserir a sua data de nascimento, a aplicação gera uma grelha onde cada pequeno quadrado representa uma semana da sua vida, com base numa expectativa de vida padrão de 80 anos.

Marque as semanas que já passaram, veja o seu progresso através da vida numa barra percentual e reflita sobre a preciosidade e finitude do tempo.

> Viva a sua vida como se fosse morrer. **Porque você vai.**

## ✨ Funcionalidades

* **Grelha de Semanas Personalizada:** Insira a sua data de nascimento para gerar um calendário único.
* **Visualização Clara:** Cada quadrado representa uma semana (aprox. 4175 semanas para 80 anos).
* **Marcação Interativa:** Clique para marcar/desmarcar semanas individuais.
* **Persistência:** O estado das suas semanas marcadas é guardado no `localStorage` do seu navegador, específico para cada data de nascimento inserida.
* **Preenchimento Automático:** Ao inserir/atualizar a data de nascimento, as semanas passadas até à data atual são preenchidas automaticamente (se não houver dados guardados para essa data).
* **Marcadores de Ano:** Uma indicação visual (borda e número opcional) marca o início de cada novo ano de vida na grelha.
* **Barra de Progresso:** Veja visualmente a percentagem de semanas já vividas em relação ao total esperado.
* **Cálculo Preciso:** Leva em conta anos bissextos para calcular o número total de semanas.

## 💻 Tecnologias Utilizadas

* [React](https://reactjs.org/) (v19)
* [Vite](https://vitejs.dev/)
* JavaScript
* CSS Moderno (Flexbox, Grid)

## 🚀 Como Usar Online

Basta aceder ao link da demo: [**death-calendar-three.vercel.app**](https://death-calendar-three.vercel.app/)

1.  Insira a sua data de nascimento no campo indicado.
2.  Clique em "Atualizar Calendário".
3.  Explore a grelha e clique nas semanas para as marcar!

## ⚙️ Executar Localmente

Se quiser executar o projeto na sua máquina:

1.  **Clone o Repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT>
    cd death-calendar # Ou o nome da pasta do projeto
    ```
2.  **Instale as Dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
4.  Abra o seu navegador e aceda a `http://localhost:5173` (ou o URL fornecido).

## 🛠️ Comando de Build

Para gerar os ficheiros otimizados para produção (que são usados no deployment):

```bash
npm run build
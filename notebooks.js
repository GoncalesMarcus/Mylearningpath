/* =====================================================================
   CADERNOS — este é o único arquivo que você precisa editar no dia a dia.
   Tudo o que estiver aqui aparece no roadmap E na página inicial (Access Box).

   Estrutura de cada caderno:
     title  → nome do caderno
     intro  → texto de abertura do roadmap
     draft  → true mostra o aviso "estrutura em rascunho"
     steps  → etapas da espinha central, de cima para baixo

   Cada etapa (step) ou tópico (topic) aceita:
     title      → nome (obrigatório)
     number     → numeração exibida ("1", "2"...). Se omitir, nos tópicos
                  ela é gerada automaticamente (2.1, 2.2...)
     short      → nome curto para a página inicial (opcional)
     about      → frase que aparece abaixo da etapa e no painel
     status     → "studying" ou "recorded" (omita = não iniciado)
     video      → link do YouTube (não listado). Com vídeo, o status
                  vira "recorded" sozinho
     materials  → lista de materiais: { label: "Nome", url: "link" }
                  O link pode ser do Google Drive ou um arquivo da pasta
                  materials/, ex.: url: "materials/econ/notas-aula-1.pdf"
     topics     → tópicos laterais da etapa (só nas etapas)

   Dica: copie um bloco existente e altere. Cuidado com vírgulas e chaves.
   ===================================================================== */

window.NOTEBOOKS = {

  econ: {
    title: "Economic Science",
    intro: "First, map how the world works. Then build the analytical reasoning to think about it critically and testably. Then study economic theories, test them, and turn them into models. The path ends at econometrics and the frontier.",
    steps: [
      { title: "Introduction", number: "",
        about: "Why this path, and how it is organized." },

      { title: "The Object of Study", number: "1",
        about: "How Brazil and the world actually work: an institutional, accounting and flow-based reading of the economy. No economic theory yet." },

      { title: "Analytical Thinking", number: "2",
        about: "The tools to think about that system in a way that is critical, credible and testable.",
        topics: [
          { title: "Mathematics" },
          { title: "Statistics" },
          { title: "Data Science" }
        ] },

      { title: "Validating and Testing Economic Theories", number: "3", short: "Economic Theories",
        about: "Study the theories, test them with the tools from step 2, and build models whose aim is to model the world." },

      { title: "Econometrics", number: "4",
        about: "The culmination of economic science, reaching frontier models and tools such as machine learning and agent-based models." },

      { title: "The Final Report and Possible Specializations", number: "5", short: "Final Report",
        about: "Bringing the path together and choosing where to go deeper." },

      { title: "Conclusion", number: "",
        about: "Closing the path.",
        topics: [ { title: "References" } ] }
    ]
  },

  general: {
    title: "General Knowledge",
    draft: true,
    intro: "A broad education, deep enough to sit the FUVEST exam, though the exam is a checkpoint and not the goal.",
    steps: [
      { title: "Portuguese",  topics: [ { title: "Grammar in use" }, { title: "Text interpretation" } ] },
      { title: "Literature",  topics: [ { title: "Literary periods" }, { title: "Required readings" } ] },
      { title: "History",     topics: [ { title: "Ancient world" }, { title: "Colonial Brazil" }, { title: "Brazilian Republic" } ] },
      { title: "Geography",   topics: [ { title: "Physical geography" }, { title: "Brazil: industrialization" } ] },
      { title: "Physics",     topics: [ { title: "Kinematics" }, { title: "Dynamics" }, { title: "Electricity" } ] },
      { title: "Chemistry",   topics: [ { title: "Atomic structure" }, { title: "Stoichiometry" }, { title: "Organic chemistry" } ] },
      { title: "Biology",     topics: [ { title: "Cell biology" }, { title: "Genetics" }, { title: "Ecology" } ] },
      { title: "Philosophy",  topics: [ { title: "Ancient philosophy" }, { title: "Modern philosophy" } ] },
      { title: "Sociology",   topics: [ { title: "Durkheim" }, { title: "Weber" } ] },
      { title: "Arts",        topics: [ { title: "Art history" } ] }
    ]
  },

  lang: {
    title: "Foreign Language",
    draft: true,
    intro: "English toward proficiency, one level at a time. Each level opens into the skills it asks for.",
    steps: [
      { title: "A2 · Elementary",         topics: [ { title: "Past tenses" }, { title: "Everyday vocabulary" } ] },
      { title: "B1 · Intermediate",       topics: [ { title: "Present perfect" }, { title: "Conditionals" }, { title: "Listening: podcasts" } ] },
      { title: "B2 · Upper intermediate", topics: [ { title: "Passive voice" }, { title: "Reported speech" }, { title: "Essay structure" }, { title: "Phrasal verbs" } ] },
      { title: "C1 · Advanced",           topics: [ { title: "Academic writing" }, { title: "Hedging and nuance" }, { title: "Fluent discussion" } ] },
      { title: "C2 · Proficiency",        topics: [ { title: "Idiomatic range" }, { title: "Style and register" }, { title: "Pronunciation" } ] }
    ]
  }

};

/* Ligações pontilhadas entre cadernos na página inicial.
   Formato: ["caderno:Nome do tema", "caderno:Nome do tema"].
   Ligações cujo tema não existe são ignoradas. */
window.CONNECTIONS = [
  ["econ:Mathematics", "general:Physics"],
  ["econ:Economic Theories", "general:Philosophy"],
  ["econ:The Object of Study", "general:Geography"],
  ["econ:Statistics", "general:Biology"],
  ["lang:Academic writing", "general:Literary periods"]
];

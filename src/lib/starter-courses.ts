import type { HomeworkSection } from "@/types/database";

export interface StarterLesson {
  title: string;
  date: string;
  notes: string | null;
  order_index: number;
  sections?: HomeworkSection[];
  homework?: { title: string; sections: HomeworkSection[] }[];
}

export interface StarterCourse {
  id: string;
  title: string;
  description: string;
  lessons: StarterLesson[];
}

export const STARTER_COURSES: StarterCourse[] = [
  {
    id: "starter-polish-a1",
    title: "Польский язык A1",
    description: "Базовый курс польского языка: приветствия, знакомство, числа, покупки, повседневная жизнь. 12 уроков с домашками.",
    lessons: [
      {
        title: "Урок 1. Приветствия и знакомство",
        date: "", notes: "Cześć, dzień dobry, do widzenia. Jak masz na imię?",
        order_index: 0,
        sections: [
          { id: "s1", type: "text", title: "Диалог", content: { text: "— Cześć! Jak masz na imię?\n— Mam na imię Anna. A ty?\n— Jestem Marek. Miło mi!\n— Mnie też miło!" } },
          { id: "s2", type: "cards", title: "Словарь", content: { cards: [
            { front: "Cześć", back: "Привет" },
            { front: "Dzień dobry", back: "Добрый день" },
            { front: "Do widzenia", back: "До свидания" },
            { front: "Jak masz na imię?", back: "Как тебя зовут?" },
            { front: "Miło mi", back: "Приятно познакомиться" },
            { front: "Dziękuję", back: "Спасибо" },
            { front: "Proszę", back: "Пожалуйста" },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Приветствия",
          sections: [
            { id: "h1", type: "quiz", title: "Тест", content: [
              { question: "Как сказать 'Привет' по-польски?", options: ["Dzień dobry", "Cześć", "Do widzenia", "Proszę"], correct: 1 },
              { question: "Jak masz na imię? — это вопрос о...", options: ["возрасте", "имени", "профессии", "городе"], correct: 1 },
              { question: "'Miło mi' означает:", options: ["Спасибо", "Пожалуйста", "Приятно познакомиться", "До свидания"], correct: 2 },
            ] },
            { id: "h2", type: "fill_blanks", title: "Заполни пропуски", content: { text: "___ dobry! Jak masz na ___? Mam na imię Anna. ___ mi!", answers: ["Dzień", "imię", "Miło"] } },
          ],
        }],
      },
      {
        title: "Урок 2. Числа 1-20 и возраст",
        date: "", notes: "Jeden, dwa, trzy... Ile masz lat?",
        order_index: 1,
        sections: [
          { id: "s1", type: "text", title: "Числа 1-10", content: { text: "1 — jeden\n2 — dwa\n3 — trzy\n4 — cztery\n5 — pięć\n6 — sześć\n7 — siedem\n8 — osiem\n9 — dziewięć\n10 — dziesięć" } },
          { id: "s2", type: "text", title: "Числа 11-20", content: { text: "11 — jedenaście\n12 — dwanaście\n13 — trzynaście\n14 — czternaście\n15 — piętnaście\n16 — szesnaście\n17 — siedemnaście\n18 — osiemnaście\n19 — dziewiętnaście\n20 — dwadzieścia" } },
          { id: "s3", type: "cards", title: "Возраст", content: { cards: [
            { front: "Ile masz lat?", back: "Сколько тебе лет?" },
            { front: "Mam dwadzieścia lat", back: "Мне 20 лет" },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Числа",
          sections: [
            { id: "h1", type: "matching", title: "Соедини", content: { pairs: [
              { left: "trzy", right: "3" }, { left: "siedem", right: "7" },
              { left: "dziesięć", right: "10" }, { left: "piętnaście", right: "15" },
              { left: "dwadzieścia", right: "20" },
            ] } },
            { id: "h2", type: "ordering", title: "Расположи по порядку", content: { items: ["pięć", "jeden", "dziesięć", "trzy", "siedem"], correct_order: [1, 3, 0, 4, 2] } },
          ],
        }],
      },
      {
        title: "Урок 3. Представление и профессии",
        date: "", notes: "Kim jesteś? Jestem studentem/studentką.",
        order_index: 2,
        sections: [
          { id: "s1", type: "cards", title: "Профессии", content: { cards: [
            { front: "student / studentka", back: "студент / студентка" },
            { front: "nauczyciel / nauczycielka", back: "учитель / учительница" },
            { front: "lekarz / lekarka", back: "врач (м/ж)" },
            { front: "programista / programistka", back: "программист / программистка" },
            { front: "kelner / kelnerka", back: "официант / официантка" },
          ] } },
          { id: "s2", type: "text", title: "Диалог", content: { text: "— Kim jesteś?\n— Jestem programistą. A ty?\n— Jestem studentką. Studiuję na uniwersytecie." } },
        ],
        homework: [{
          title: "ДЗ: Профессии",
          sections: [
            { id: "h1", type: "true_false", title: "Правда или ложь", content: { questions: [
              { statement: "'Nauczyciel' означает 'учитель'", correct: true },
              { statement: "'Lekarz' означает 'программист'", correct: false },
              { statement: "'Kim jesteś?' — это вопрос о профессии", correct: true },
            ] } },
          ],
        }],
      },
      {
        title: "Урок 4. Семья",
        date: "", notes: "Mama, tata, brat, siostra. Moja rodzina.",
        order_index: 3,
        sections: [
          { id: "s1", type: "cards", title: "Члены семьи", content: { cards: [
            { front: "mama", back: "мама" }, { front: "tata", back: "папа" },
            { front: "brat", back: "брат" }, { front: "siostra", back: "сестра" },
            { front: "syn", back: "сын" }, { front: "córka", back: "дочь" },
            { front: "mąż", back: "муж" }, { front: "żona", back: "жена" },
            { front: "rodzina", back: "семья" },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Семья",
          sections: [
            { id: "h1", type: "quiz", title: "Тест", content: [
              { question: "Как сказать 'сестра'?", options: ["brat", "córka", "siostra", "mama"], correct: 2 },
              { question: "'Mąż' — это:", options: ["жена", "муж", "сын", "брат"], correct: 1 },
            ] },
            { id: "h2", type: "open_answer", title: "Расскажи о семье", content: { prompt: "Опиши свою семью по-польски (3-5 предложений). Используй: mam, moja/mój, rodzina.", placeholder: "Moja rodzina jest..." } },
          ],
        }],
      },
      {
        title: "Урок 5. Дни недели и время",
        date: "", notes: "Poniedziałek, wtorek... Która jest godzina?",
        order_index: 4,
        sections: [
          { id: "s1", type: "text", title: "Дни недели", content: { text: "poniedziałek — понедельник\nwtorek — вторник\nśroda — среда\nczwartek — четверг\npiątek — пятница\nsobota — суббота\nniedziela — воскресенье" } },
          { id: "s2", type: "cards", title: "Время", content: { cards: [
            { front: "Która jest godzina?", back: "Который час?" },
            { front: "Jest trzecia", back: "Сейчас три часа" },
            { front: "rano", back: "утром" }, { front: "wieczorem", back: "вечером" },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Дни и время",
          sections: [
            { id: "h1", type: "ordering", title: "Расположи дни по порядку", content: { items: ["środa", "poniedziałek", "piątek", "wtorek", "czwartek", "sobota", "niedziela"], correct_order: [1, 3, 0, 4, 2, 5, 6] } },
          ],
        }],
      },
      {
        title: "Урок 6. В магазине",
        date: "", notes: "Ile to kosztuje? Chciałbym/Chciałabym...",
        order_index: 5,
        sections: [
          { id: "s1", type: "text", title: "Диалог в магазине", content: { text: "— Dzień dobry! Chciałbym kupić chleb.\n— Proszę. Coś jeszcze?\n— Tak, poproszę mleko i masło.\n— Razem to piętnaście złotych.\n— Proszę. Dziękuję!\n— Dziękuję, do widzenia!" } },
          { id: "s2", type: "cards", title: "Продукты", content: { cards: [
            { front: "chleb", back: "хлеб" }, { front: "mleko", back: "молоко" },
            { front: "masło", back: "масло" }, { front: "ser", back: "сыр" },
            { front: "woda", back: "вода" }, { front: "kawa", back: "кофе" },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Покупки",
          sections: [
            { id: "h1", type: "fill_blanks", title: "Заполни пропуски", content: { text: "Dzień dobry! ___ kupić chleb. Ile to ___? Razem piętnaście ___.", answers: ["Chciałbym", "kosztuje", "złotych"] } },
          ],
        }],
      },
      { title: "Урок 7. Еда и ресторан", date: "", notes: "Poproszę menu. Smacznego!", order_index: 6, sections: [] },
      { title: "Урок 8. Город и транспорт", date: "", notes: "Gdzie jest przystanek? Jak dojechać do...?", order_index: 7, sections: [] },
      { title: "Урок 9. Погода и времена года", date: "", notes: "Jaka jest pogoda? Jest ciepło/zimno.", order_index: 8, sections: [] },
      { title: "Урок 10. Хобби и свободное время", date: "", notes: "Co lubisz robić? Lubię czytać, grać...", order_index: 9, sections: [] },
      { title: "Урок 11. Здоровье и врач", date: "", notes: "Boli mnie głowa. Muszę iść do lekarza.", order_index: 10, sections: [] },
      { title: "Урок 12. Итоговый урок", date: "", notes: "Повторение всех тем курса. Финальный тест.", order_index: 11, sections: [] },
    ],
  },
];

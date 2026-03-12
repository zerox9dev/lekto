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
      {
        title: "Урок 7. Еда и ресторан",
        date: "", notes: "Poproszę menu. Smacznego!",
        order_index: 6,
        sections: [
          { id: "s7-1", type: "text", title: "Диалог в ресторане", content: { text: "— Dzień dobry! Poproszę menu.\n— Proszę bardzo. Co podać do picia?\n— Poproszę wodę mineralną.\n— A co do jedzenia?\n— Poproszę zupę pomidorową i pierogi z mięsem.\n— Coś na deser?\n— Tak, szarlotkę z lodami.\n— Dziękuję. Smacznego!\n— Dziękuję!" } },
          { id: "s7-2", type: "cards", title: "Словарь: еда и напитки", content: { cards: [
            { front: "zupa", back: "суп" },
            { front: "pierogi", back: "вареники / пирожки" },
            { front: "mięso", back: "мясо" },
            { front: "ryba", back: "рыба" },
            { front: "sałatka", back: "салат" },
            { front: "deser", back: "десерт" },
            { front: "szarlotka", back: "шарлотка (яблочный пирог)" },
            { front: "lody", back: "мороженое" },
            { front: "herbata", back: "чай" },
            { front: "sok", back: "сок" },
            { front: "piwo", back: "пиво" },
            { front: "rachunek", back: "счёт" },
          ] } },
          { id: "s7-3", type: "quiz", title: "Что заказать?", content: [
            { question: "Как попросить меню?", options: ["Daj mi menu", "Poproszę menu", "Chcę menu", "Gdzie menu?"], correct: 1 },
            { question: "'Pierogi' — это:", options: ["суп", "вареники", "мороженое", "салат"], correct: 1 },
            { question: "Что говорят перед едой?", options: ["Dziękuję", "Proszę", "Smacznego", "Do widzenia"], correct: 2 },
          ] },
        ],
        homework: [{
          title: "ДЗ: Ресторан",
          sections: [
            { id: "h7-1", type: "fill_blanks", title: "Заполни пропуски", content: { text: "Dzień dobry! ___ menu. Co podać do ___? Poproszę ___. Smacznego!", answers: ["Poproszę", "picia", "zupę"] } },
            { id: "h7-2", type: "matching", title: "Соедини блюда с переводом", content: { pairs: [
              { left: "zupa pomidorowa", right: "томатный суп" },
              { left: "pierogi z mięsem", right: "вареники с мясом" },
              { left: "szarlotka z lodami", right: "шарлотка с мороженым" },
              { left: "herbata z cytryną", right: "чай с лимоном" },
              { left: "sok pomarańczowy", right: "апельсиновый сок" },
            ] } },
            { id: "h7-3", type: "open_answer", title: "Составь заказ", content: { prompt: "Напиши свой заказ в ресторане по-польски. Используй: Poproszę, do picia, do jedzenia, na deser.", placeholder: "Poproszę..." } },
          ],
        }],
      },
      {
        title: "Урок 8. Город и транспорт",
        date: "", notes: "Gdzie jest przystanek? Jak dojechać do...?",
        order_index: 7,
        sections: [
          { id: "s8-1", type: "text", title: "Диалог: как добраться?", content: { text: "— Przepraszam, gdzie jest przystanek autobusowy?\n— Proszę iść prosto, potem skręcić w prawo.\n— Dziękuję! A jak dojechać do centrum?\n— Tramwajem numer pięć, trzy przystanki.\n— Ile kosztuje bilet?\n— Trzy złote pięćdziesiąt groszy.\n— Dziękuję bardzo!" } },
          { id: "s8-2", type: "cards", title: "Словарь: город и транспорт", content: { cards: [
            { front: "przystanek", back: "остановка" },
            { front: "autobus", back: "автобус" },
            { front: "tramwaj", back: "трамвай" },
            { front: "pociąg", back: "поезд" },
            { front: "bilet", back: "билет" },
            { front: "dworzec", back: "вокзал" },
            { front: "ulica", back: "улица" },
            { front: "skrzyżowanie", back: "перекрёсток" },
            { front: "prosto", back: "прямо" },
            { front: "w prawo", back: "направо" },
            { front: "w lewo", back: "налево" },
          ] } },
          { id: "s8-3", type: "true_false", title: "Правда или ложь?", content: { questions: [
            { statement: "'Przystanek' означает 'остановка'", correct: true },
            { statement: "'W lewo' означает 'направо'", correct: false },
            { statement: "'Dworzec' — это вокзал", correct: true },
            { statement: "'Prosto' означает 'назад'", correct: false },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Город",
          sections: [
            { id: "h8-1", type: "quiz", title: "Тест: транспорт", content: [
              { question: "Как спросить 'Где остановка?'", options: ["Gdzie jest bilet?", "Gdzie jest przystanek?", "Gdzie jest tramwaj?", "Gdzie jest ulica?"], correct: 1 },
              { question: "'Skręcić w prawo' означает:", options: ["повернуть налево", "идти прямо", "повернуть направо", "вернуться назад"], correct: 2 },
              { question: "Как сказать 'поезд'?", options: ["autobus", "tramwaj", "pociąg", "bilet"], correct: 2 },
            ] },
            { id: "h8-2", type: "ordering", title: "Составь маршрут", content: { items: ["Skręcić w prawo", "Iść prosto", "Wysiąść na trzecim przystanku", "Wsiąść do tramwaju", "Kupić bilet"], correct_order: [1, 0, 4, 3, 2] } },
            { id: "h8-3", type: "fill_blanks", title: "Заполни пропуски", content: { text: "Przepraszam, ___ jest przystanek? Proszę iść ___, potem skręcić w ___.", answers: ["gdzie", "prosto", "prawo"] } },
          ],
        }],
      },
      {
        title: "Урок 9. Погода и времена года",
        date: "", notes: "Jaka jest pogoda? Jest ciepło/zimno.",
        order_index: 8,
        sections: [
          { id: "s9-1", type: "text", title: "Времена года", content: { text: "wiosna — весна \nlato — лето \njesień — осень \nzima — зима \n\nJaka jest pogoda?\nJest ciepło. — Тепло.\nJest zimno. — Холодно.\nPada deszcz. — Идёт дождь.\nPada śnieg. — Идёт снег.\nŚwieci słońce. — Светит солнце.\nJest wietrznie. — Ветрено." } },
          { id: "s9-2", type: "cards", title: "Словарь: погода", content: { cards: [
            { front: "pogoda", back: "погода" },
            { front: "deszcz", back: "дождь" },
            { front: "śnieg", back: "снег" },
            { front: "słońce", back: "солнце" },
            { front: "wiatr", back: "ветер" },
            { front: "chmura", back: "облако / туча" },
            { front: "ciepło", back: "тепло" },
            { front: "zimno", back: "холодно" },
            { front: "gorąco", back: "жарко" },
          ] } },
          { id: "s9-3", type: "matching", title: "Соедини сезон и описание", content: { pairs: [
            { left: "wiosna", right: "kwiaty i ciepło (цветы и тепло)" },
            { left: "lato", right: "gorąco i słońce (жарко и солнце)" },
            { left: "jesień", right: "deszcz i wiatr (дождь и ветер)" },
            { left: "zima", right: "śnieg i zimno (снег и холод)" },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Погода",
          sections: [
            { id: "h9-1", type: "quiz", title: "Тест: погода", content: [
              { question: "'Pada deszcz' означает:", options: ["Идёт снег", "Идёт дождь", "Светит солнце", "Дует ветер"], correct: 1 },
              { question: "Как сказать 'лето'?", options: ["wiosna", "jesień", "zima", "lato"], correct: 3 },
              { question: "'Jest gorąco' — это:", options: ["холодно", "тепло", "жарко", "ветрено"], correct: 2 },
            ] },
            { id: "h9-2", type: "true_false", title: "Правда или ложь?", content: { questions: [
              { statement: "'Jesień' — это весна", correct: false },
              { statement: "'Śnieg' — это снег", correct: true },
              { statement: "'Wiatr' означает 'солнце'", correct: false },
              { statement: "'Chmura' — это облако", correct: true },
            ] } },
            { id: "h9-3", type: "open_answer", title: "Опиши погоду", content: { prompt: "Опиши сегодняшнюю погоду по-польски (3-4 предложения). Используй: jest, pada, świeci, pogoda.", placeholder: "Dzisiaj pogoda jest..." } },
          ],
        }],
      },
      {
        title: "Урок 10. Хобби и свободное время",
        date: "", notes: "Co lubisz robić? Lubię czytać, grać...",
        order_index: 9,
        sections: [
          { id: "s10-1", type: "text", title: "Диалог о хобби", content: { text: "— Co lubisz robić w wolnym czasie?\n— Lubię czytać książki i słuchać muzyki. A ty?\n— Ja lubię grać w piłkę nożną i oglądać filmy.\n— Czy lubisz gotować?\n— Tak, bardzo! Lubię gotować polskie jedzenie.\n— Super! Ja też lubię jeść, ale nie lubię gotować!" } },
          { id: "s10-2", type: "cards", title: "Словарь: хобби", content: { cards: [
            { front: "czytać", back: "читать" },
            { front: "pisać", back: "писать" },
            { front: "słuchać muzyki", back: "слушать музыку" },
            { front: "oglądać filmy", back: "смотреть фильмы" },
            { front: "grać w piłkę", back: "играть в мяч / футбол" },
            { front: "gotować", back: "готовить" },
            { front: "rysować", back: "рисовать" },
            { front: "biegać", back: "бегать" },
            { front: "pływać", back: "плавать" },
            { front: "podróżować", back: "путешествовать" },
          ] } },
          { id: "s10-3", type: "quiz", title: "Тест: хобби", content: [
            { question: "Как сказать 'Я люблю читать'?", options: ["Lubię pisać", "Lubię czytać", "Lubię gotować", "Lubię grać"], correct: 1 },
            { question: "'Oglądać filmy' — это:", options: ["слушать музыку", "читать книги", "смотреть фильмы", "играть в игры"], correct: 2 },
            { question: "'Co lubisz robić?' — вопрос о:", options: ["погоде", "еде", "хобби", "семье"], correct: 2 },
            { question: "Как сказать 'путешествовать'?", options: ["pływać", "biegać", "podróżować", "rysować"], correct: 2 },
          ] },
        ],
        homework: [{
          title: "ДЗ: Хобби",
          sections: [
            { id: "h10-1", type: "matching", title: "Соедини хобби с переводом", content: { pairs: [
              { left: "czytać książki", right: "читать книги" },
              { left: "grać w piłkę nożną", right: "играть в футбол" },
              { left: "słuchać muzyki", right: "слушать музыку" },
              { left: "gotować jedzenie", right: "готовить еду" },
              { left: "pływać w basenie", right: "плавать в бассейне" },
            ] } },
            { id: "h10-2", type: "fill_blanks", title: "Заполни пропуски", content: { text: "Co ___ robić w wolnym czasie? ___ czytać książki i ___ muzyki.", answers: ["lubisz", "Lubię", "słuchać"] } },
            { id: "h10-3", type: "ordering", title: "Составь предложение", content: { items: ["lubię", "Ja", "filmy", "oglądać", "bardzo"], correct_order: [1, 4, 0, 3, 2] } },
          ],
        }],
      },
      {
        title: "Урок 11. Здоровье и врач",
        date: "", notes: "Boli mnie głowa. Muszę iść do lekarza.",
        order_index: 10,
        sections: [
          { id: "s11-1", type: "text", title: "Диалог у врача", content: { text: "— Dzień dobry, doktorze.\n— Dzień dobry. Co panu dolega?\n— Boli mnie głowa i gardło. Mam też kaszei.\n— Od kiedy?\n— Od trzech dni.\n— Proszę otworzyć usta. Hmm, to angina. Przepiszę panu leki.\n— Dziękuję, doktorze.\n— Proszę brać te tabletki trzy razy dziennie. I dużo pić!" } },
          { id: "s11-2", type: "cards", title: "Словарь: здоровье", content: { cards: [
            { front: "głowa", back: "голова" },
            { front: "gardło", back: "горло" },
            { front: "brzuch", back: "живот" },
            { front: "ręka", back: "рука" },
            { front: "noga", back: "нога" },
            { front: "kaszel", back: "кашель" },
            { front: "gorączka", back: "температура / жар" },
            { front: "leki / tabletki", back: "лекарства / таблетки" },
            { front: "apteka", back: "аптека" },
            { front: "Boli mnie...", back: "У меня болит..." },
          ] } },
          { id: "s11-3", type: "true_false", title: "Правда или ложь?", content: { questions: [
            { statement: "'Boli mnie głowa' значит 'У меня болит голова'", correct: true },
            { statement: "'Apteka' — это больница", correct: false },
            { statement: "'Gardło' — это горло", correct: true },
            { statement: "'Noga' означает 'рука'", correct: false },
            { statement: "'Gorączka' — это температура / жар", correct: true },
          ] } },
        ],
        homework: [{
          title: "ДЗ: Здоровье",
          sections: [
            { id: "h11-1", type: "quiz", title: "Тест: у врача", content: [
              { question: "Как сказать 'У меня болит живот'?", options: ["Boli mnie głowa", "Boli mnie gardło", "Boli mnie brzuch", "Boli mnie noga"], correct: 2 },
              { question: "'Co panu dolega?' — вопрос:", options: ["Как вас зовут?", "Что вас беспокоит?", "Сколько вам лет?", "Где вы живёте?"], correct: 1 },
              { question: "Где купить лекарства?", options: ["w sklepie", "w aptece", "w restauracji", "na dworcu"], correct: 1 },
              { question: "'Kaszel' — это:", options: ["насморк", "температура", "кашель", "головная боль"], correct: 2 },
            ] },
            { id: "h11-2", type: "fill_blanks", title: "Заполни пропуски", content: { text: "___ mnie głowa i ___. Mam ___. Muszę iść do ___.", answers: ["Boli", "gardło", "gorączkę", "lekarza"] } },
            { id: "h11-3", type: "matching", title: "Соедини части тела", content: { pairs: [
              { left: "głowa", right: "голова" },
              { left: "ręka", right: "рука" },
              { left: "noga", right: "нога" },
              { left: "brzuch", right: "живот" },
              { left: "gardło", right: "горло" },
            ] } },
          ],
        }],
      },
      {
        title: "Урок 12. Итоговый урок",
        date: "", notes: "Повторение всех тем курса. Финальный тест.",
        order_index: 11,
        sections: [
          { id: "s12-1", type: "text", title: "Повторение: все темы", content: { text: "Поздравляем! Вы прошли весь курс польского A1!\n\nВ этом уроке мы повторим все темы:\n1. Приветствия и знакомство\n2. Числа и возраст\n3. Профессии\n4. Семья\n5. Дни недели и время\n6. Покупки\n7. Еда и ресторан\n8. Город и транспорт\n9. Погода и времена года\n10. Хобби\n11. Здоровье\n\nPowodzenia! (Удачи!)" } },
          { id: "s12-2", type: "quiz", title: "Финальный тест — часть 1", content: [
            { question: "Как сказать 'Привет'?", options: ["Do widzenia", "Cześć", "Dziękuję", "Przepraszam"], correct: 1 },
            { question: "Число 15 по-польски:", options: ["pięć", "piętnaście", "pięćdziesiąt", "piętset"], correct: 1 },
            { question: "'Nauczycielka' — это:", options: ["врач", "студентка", "учительница", "официантка"], correct: 2 },
            { question: "Как сказать 'брат'?", options: ["siostra", "syn", "mąż", "brat"], correct: 3 },
            { question: "'Środa' — это:", options: ["понедельник", "вторник", "среда", "четверг"], correct: 2 },
          ] },
          { id: "s12-3", type: "quiz", title: "Финальный тест — часть 2", content: [
            { question: "'Ile to kosztuje?' — это вопрос о:", options: ["времени", "цене", "погоде", "дороге"], correct: 1 },
            { question: "Как попросить счёт в ресторане?", options: ["Poproszę menu", "Poproszę rachunek", "Poproszę wodę", "Poproszę deser"], correct: 1 },
            { question: "'Przystanek' означает:", options: ["вокзал", "билет", "остановка", "улица"], correct: 2 },
            { question: "'Pada śnieg' — это:", options: ["Идёт дождь", "Идёт снег", "Светит солнце", "Дует ветер"], correct: 1 },
            { question: "'Lubię pływać' означает:", options: ["Люблю бегать", "Люблю готовить", "Люблю плавать", "Люблю читать"], correct: 2 },
          ] },
        ],
        homework: [{
          title: "ДЗ: Итоговый тест",
          sections: [
            { id: "h12-1", type: "matching", title: "Соедини слова из разных тем", content: { pairs: [
              { left: "rodzina", right: "семья" },
              { left: "pogoda", right: "погода" },
              { left: "przystanek", right: "остановка" },
              { left: "pierogi", right: "вареники" },
              { left: "apteka", right: "аптека" },
              { left: "piątek", right: "пятница" },
            ] } },
            { id: "h12-2", type: "fill_blanks", title: "Заполни диалог", content: { text: "— Cześć! Jak masz na ___?\n— Mam na imię Anna. ___ dwadzieścia lat.\n— Co ___ robić?\n— ___ czytać i gotować.", answers: ["imię", "Mam", "lubisz", "Lubię"] } },
            { id: "h12-3", type: "true_false", title: "Правда или ложь? (повторение)", content: { questions: [
              { statement: "'Dzień dobry' значит 'Добрый день'", correct: true },
              { statement: "'Lekarz' — это учитель", correct: false },
              { statement: "'Tramwaj' — это трамвай", correct: true },
              { statement: "'Zima' — это лето", correct: false },
              { statement: "'Boli mnie' значит 'У меня болит'", correct: true },
              { statement: "'Córka' — это сын", correct: false },
            ] } },
            { id: "h12-4", type: "ordering", title: "Расположи числа по порядку", content: { items: ["dwanaście", "trzy", "dwadzieścia", "osiem", "piętnaście", "jeden"], correct_order: [5, 1, 3, 0, 4, 2] } },
            { id: "h12-5", type: "open_answer", title: "Расскажи о себе", content: { prompt: "Напиши мини-рассказ о себе по-польски (5-8 предложений). Используй темы: имя, возраст, профессия, семья, хобби, погода сегодня.", placeholder: "Cześć! Mam na imię..." } },
          ],
        }],
      },
    ],
  },
];

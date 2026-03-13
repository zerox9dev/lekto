import type { HomeworkSection } from "@/types/database";
import { QuizPlayer } from "./quiz-player";
import { FillBlanksPlayer } from "./fill-blanks-player";
import { MatchingPlayer } from "./matching-player";
import { WordOrderPlayer } from "./word-order-player";
import { CardsPlayer } from "./cards-player";
import { TrueFalsePlayer } from "./true-false-player";
import { OpenAnswerPlayer } from "./open-answer-player";
import { TextPlayer } from "./text-player";
import { MediaPlayer } from "./media-player";

const typeLabels: Record<string, string> = {
  quiz: "Тест", fill_blanks: "Вставить слово", matching: "Соединить пары",
  ordering: "Word order", cards: "Карточки", text: "Задание",
  true_false: "Верно / Неверно", open_answer: "Открытый ответ", media: "Медиа",
};

export function SectionPlayer({ section, onScore }: { section: HomeworkSection; onScore: (sectionId: string, score: number) => void }) {
  const handle = (score: number) => onScore(section.id, score);
  const handleOpenAnswer = (_sectionId: string, _answer: string) => {
    // Open answers are not auto-scored
  };
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
        <span className="text-[11px] md:text-[12px] font-medium text-[#888] bg-[#f0ede6] px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg">{typeLabels[section.type]}</span>
        <h3 className="text-[15px] md:text-[16px] font-semibold">{section.title}</h3>
      </div>
      {section.type === "quiz" && <QuizPlayer section={section} onScore={handle} />}
      {section.type === "fill_blanks" && <FillBlanksPlayer section={section} onScore={handle} />}
      {section.type === "matching" && <MatchingPlayer section={section} onScore={handle} />}
      {section.type === "ordering" && <WordOrderPlayer section={section} onScore={handle} />}
      {section.type === "cards" && <CardsPlayer section={section} />}
      {section.type === "true_false" && <TrueFalsePlayer section={section} onScore={handle} />}
      {section.type === "open_answer" && <OpenAnswerPlayer section={section} onSubmitAnswer={handleOpenAnswer} />}
      {section.type === "media" && <MediaPlayer section={section} />}
      {section.type === "text" && <TextPlayer section={section} />}
    </div>
  );
}

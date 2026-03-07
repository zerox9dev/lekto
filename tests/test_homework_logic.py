#!/usr/bin/env python3
"""
Lekto — полное тестирование логики store + homework + scoring.
Без зависимостей — чистый Python. Зеркалит логику из TypeScript.
"""

import uuid
import random
import math
import sys

PASSED = 0
FAILED = 0

def test(name, fn):
    global PASSED, FAILED
    try:
        fn()
        PASSED += 1
        print(f"  ✅ {name}")
    except AssertionError as e:
        FAILED += 1
        print(f"  ❌ {name}: {e}")
    except Exception as e:
        FAILED += 1
        print(f"  💥 {name}: {type(e).__name__}: {e}")

class AssertionError(Exception): pass

def eq(a, b, msg=""):
    if a != b:
        raise AssertionError(f"Expected {b!r}, got {a!r}. {msg}")

def is_true(v, msg=""):
    if not v:
        raise AssertionError(f"Expected truthy. {msg}")

def is_false(v, msg=""):
    if v:
        raise AssertionError(f"Expected falsy. {msg}")

def is_none(v, msg=""):
    if v is not None:
        raise AssertionError(f"Expected None, got {v!r}. {msg}")

# ══════════════════════════════════════════════════════
# Store (mirrors lekto/src/lib/store.ts)
# ══════════════════════════════════════════════════════

class Store:
    def __init__(self):
        self.students = []
        self.lessons = []
        self.homework = []

    def add_student(self, name, telegram=None):
        s = {"id": str(uuid.uuid4()), "name": name, "telegram": telegram,
             "share_id": uuid.uuid4().hex[:8], "tutor_id": "local", "created_at": "2026-03-07"}
        self.students.insert(0, s)
        return s

    def delete_student(self, sid):
        self.students = [s for s in self.students if s["id"] != sid]
        self.lessons = [l for l in self.lessons if l["student_id"] != sid]
        self.homework = [h for h in self.homework if h["student_id"] != sid]

    def add_lesson(self, student_id, title, date, notes=None):
        l = {"id": str(uuid.uuid4()), "student_id": student_id, "tutor_id": "local",
             "title": title, "date": date, "notes": notes, "materials_url": None, "created_at": "2026-03-07"}
        self.lessons.insert(0, l)
        return l

    def delete_lesson(self, lid):
        self.homework = [h for h in self.homework if h["lesson_id"] != lid]
        self.lessons = [l for l in self.lessons if l["id"] != lid]

    def add_homework(self, lesson_id, student_id, title, sections, tutor_id="local"):
        h = {"id": str(uuid.uuid4()), "lesson_id": lesson_id, "student_id": student_id,
             "tutor_id": tutor_id, "title": title, "sections": sections,
             "completed": False, "student_answers": None, "scores": None, "created_at": "2026-03-07"}
        self.homework.insert(0, h)
        return h

    def update_homework(self, hid, **kwargs):
        for h in self.homework:
            if h["id"] == hid:
                h.update(kwargs)
                return h
        return None

    def delete_homework(self, hid):
        self.homework = [h for h in self.homework if h["id"] != hid]


# ══════════════════════════════════════════════════════
# Scoring logic (mirrors student-view.tsx)
# ══════════════════════════════════════════════════════

def calc_quiz_score(content, answers):
    """content = [{"question": str, "options": list, "correct": int}], answers = [int]"""
    if len(answers) != len(content):
        return None
    correct = sum(1 for q, a in zip(content, answers) if a == q["correct"])
    return round(correct / len(content) * 100)

def calc_fill_blanks_score(content, answers):
    """content = {"text": str, "answers": [str]}, answers = [str]"""
    expected = content["answers"]
    if len(answers) != len(expected):
        return None
    correct = sum(1 for e, a in zip(expected, answers) if e.strip().lower() == a.strip().lower())
    return round(correct / len(expected) * 100)

def calc_matching_score(content, answers):
    """content = {"pairs": [{"left": str, "right": str}]}, answers = [{"left": str, "right": str}]"""
    pairs = content["pairs"]
    correct = 0
    for p in pairs:
        if any(a["left"] == p["left"] and a["right"] == p["right"] for a in answers):
            correct += 1
    return round(correct / len(pairs) * 100)

def calc_ordering_score(content, user_order):
    """content = {"items": [str], "correct_order": [int]}, user_order = [str]"""
    correct_items = [content["items"][i] for i in content["correct_order"]]
    correct = sum(1 for u, c in zip(user_order, correct_items) if u == c)
    return round(correct / len(content["items"]) * 100)

def calc_section_score(section, answers):
    t = section["type"]
    if t == "quiz":
        return calc_quiz_score(section["content"], answers)
    elif t == "fill_blanks":
        return calc_fill_blanks_score(section["content"], answers)
    elif t == "matching":
        return calc_matching_score(section["content"], answers)
    elif t == "ordering":
        return calc_ordering_score(section["content"], answers)
    elif t in ("cards", "text"):
        return None  # not gradable
    return None

def is_homework_completed(hw):
    """Completed when all gradable sections have scores."""
    sections = hw.get("sections") or []
    gradable = [s for s in sections if s["type"] not in ("text", "cards")]
    if not gradable:
        return False
    scores = hw.get("scores") or {}
    return all(s["id"] in scores for s in gradable)

def avg_score(hw):
    scores = hw.get("scores") or {}
    vals = list(scores.values())
    if not vals:
        return None
    return round(sum(vals) / len(vals))


# ══════════════════════════════════════════════════════
# TESTS
# ══════════════════════════════════════════════════════

print("\n🧪 STUDENT CRUD\n")

def test_create_student_with_telegram():
    s = Store()
    st = s.add_student("Иван Петров", "@ivan_p")
    eq(len(s.students), 1)
    eq(st["name"], "Иван Петров")
    eq(st["telegram"], "@ivan_p")
    is_true(st["share_id"])
    is_true(st["id"])
test("create student with telegram", test_create_student_with_telegram)

def test_create_student_no_telegram():
    s = Store()
    st = s.add_student("Мария")
    is_none(st["telegram"])
test("create student without telegram", test_create_student_no_telegram)

def test_delete_student_cascades():
    s = Store()
    st = s.add_student("Иван")
    l = s.add_lesson(st["id"], "Урок 1", "2026-03-07")
    s.add_homework(l["id"], st["id"], "ДЗ 1", [])
    eq(len(s.lessons), 1)
    eq(len(s.homework), 1)
    s.delete_student(st["id"])
    eq(len(s.students), 0)
    eq(len(s.lessons), 0)
    eq(len(s.homework), 0)
test("delete student cascades lessons + homework", test_delete_student_cascades)


print("\n🧪 LESSON CRUD\n")

def test_create_lesson():
    s = Store()
    st = s.add_student("Иван")
    l = s.add_lesson(st["id"], "Present Simple", "2026-03-07", "Правила")
    eq(l["student_id"], st["id"])
    eq(l["title"], "Present Simple")
    eq(l["notes"], "Правила")
test("create lesson tied to student", test_create_lesson)

def test_delete_lesson_cascades():
    s = Store()
    st = s.add_student("Иван")
    l = s.add_lesson(st["id"], "Урок 1", "2026-03-07")
    s.add_homework(l["id"], st["id"], "ДЗ", [])
    eq(len(s.homework), 1)
    s.delete_lesson(l["id"])
    eq(len(s.lessons), 0)
    eq(len(s.homework), 0)
test("delete lesson cascades homework", test_delete_lesson_cascades)


print("\n🧪 HOMEWORK CRUD\n")

def test_create_homework():
    s = Store()
    st = s.add_student("Иван")
    l = s.add_lesson(st["id"], "Урок", "2026-03-07")
    hw = s.add_homework(l["id"], st["id"], "ДЗ #1", [])
    eq(hw["lesson_id"], l["id"])
    eq(hw["student_id"], st["id"])
    eq(hw["completed"], False)
test("create homework tied to lesson", test_create_homework)

def test_homework_lesson_id_required():
    s = Store()
    st = s.add_student("Иван")
    l = s.add_lesson(st["id"], "Урок", "2026-03-07")
    hw = s.add_homework(l["id"], st["id"], "ДЗ", [])
    is_true(hw["lesson_id"])
    eq(type(hw["lesson_id"]), str)
test("homework always has lesson_id (string)", test_homework_lesson_id_required)


print("\n🧪 QUIZ SCORING\n")

quiz_section = {
    "id": "quiz-1", "type": "quiz", "title": "Тест",
    "content": [
        {"question": "I ___ a student", "options": ["am", "is", "are"], "correct": 0},
        {"question": "She ___ happy", "options": ["am", "is", "are"], "correct": 1},
        {"question": "They ___ friends", "options": ["am", "is", "are"], "correct": 2},
    ]
}

test("quiz: all correct → 100%", lambda: eq(calc_section_score(quiz_section, [0, 1, 2]), 100))
test("quiz: all wrong → 0%", lambda: eq(calc_section_score(quiz_section, [2, 2, 0]), 0))
test("quiz: 1/3 correct → 33%", lambda: eq(calc_section_score(quiz_section, [0, 0, 0]), 33))
test("quiz: 2/3 correct → 67%", lambda: eq(calc_section_score(quiz_section, [0, 1, 0]), 67))

test("quiz: single question, correct", lambda: eq(calc_section_score(
    {"id": "q", "type": "quiz", "title": "Q", "content": [{"question": "2+2?", "options": ["3", "4"], "correct": 1}]},
    [1]), 100))

test("quiz: single question, wrong", lambda: eq(calc_section_score(
    {"id": "q", "type": "quiz", "title": "Q", "content": [{"question": "2+2?", "options": ["3", "4"], "correct": 1}]},
    [0]), 0))


print("\n🧪 FILL BLANKS SCORING\n")

fb_section = {
    "id": "fb-1", "type": "fill_blanks", "title": "Вставь",
    "content": {"text": "The ___ is blue. The ___ is green.", "answers": ["sky", "grass"]}
}

test("fill_blanks: all correct → 100%", lambda: eq(calc_section_score(fb_section, ["sky", "grass"]), 100))
test("fill_blanks: case insensitive", lambda: eq(calc_section_score(fb_section, ["SKY", "Grass"]), 100))
test("fill_blanks: extra spaces → still correct", lambda: eq(calc_section_score(fb_section, [" sky ", " grass "]), 100))
test("fill_blanks: 1 wrong → 50%", lambda: eq(calc_section_score(fb_section, ["sky", "water"]), 50))
test("fill_blanks: all wrong → 0%", lambda: eq(calc_section_score(fb_section, ["water", "fire"]), 0))

test("fill_blanks: single blank correct", lambda: eq(calc_section_score(
    {"id": "f", "type": "fill_blanks", "title": "F", "content": {"text": "Hello ___", "answers": ["world"]}},
    ["world"]), 100))

test("fill_blanks: single blank wrong", lambda: eq(calc_section_score(
    {"id": "f", "type": "fill_blanks", "title": "F", "content": {"text": "Hello ___", "answers": ["world"]}},
    ["earth"]), 0))


print("\n🧪 MATCHING SCORING\n")

match_section = {
    "id": "m-1", "type": "matching", "title": "Соедини",
    "content": {"pairs": [
        {"left": "cat", "right": "кошка"},
        {"left": "dog", "right": "собака"},
        {"left": "bird", "right": "птица"},
    ]}
}

test("matching: all correct → 100%", lambda: eq(calc_section_score(match_section, [
    {"left": "cat", "right": "кошка"}, {"left": "dog", "right": "собака"}, {"left": "bird", "right": "птица"}
]), 100))

test("matching: all swapped → 0%", lambda: eq(calc_section_score(match_section, [
    {"left": "cat", "right": "собака"}, {"left": "dog", "right": "птица"}, {"left": "bird", "right": "кошка"}
]), 0))

test("matching: 1/3 correct → 33%", lambda: eq(calc_section_score(match_section, [
    {"left": "cat", "right": "кошка"}, {"left": "dog", "right": "птица"}, {"left": "bird", "right": "собака"}
]), 33))

test("matching: single pair correct", lambda: eq(calc_section_score(
    {"id": "m", "type": "matching", "title": "M", "content": {"pairs": [{"left": "A", "right": "1"}]}},
    [{"left": "A", "right": "1"}]), 100))

test("matching: single pair wrong", lambda: eq(calc_section_score(
    {"id": "m", "type": "matching", "title": "M", "content": {"pairs": [{"left": "A", "right": "1"}]}},
    [{"left": "A", "right": "2"}]), 0))


print("\n🧪 ORDERING SCORING\n")

order_section = {
    "id": "o-1", "type": "ordering", "title": "Порядок",
    "content": {"items": ["first", "second", "third", "fourth"], "correct_order": [0, 1, 2, 3]}
}

test("ordering: correct order → 100%", lambda: eq(calc_section_score(order_section, ["first", "second", "third", "fourth"]), 100))
test("ordering: reversed → 0%", lambda: eq(calc_section_score(order_section, ["fourth", "third", "second", "first"]), 0))
test("ordering: 1 swap → 50%", lambda: eq(calc_section_score(order_section, ["first", "third", "second", "fourth"]), 50))

test("ordering: 2 items correct", lambda: eq(calc_section_score(
    {"id": "o", "type": "ordering", "title": "O", "content": {"items": ["A", "B"], "correct_order": [0, 1]}},
    ["A", "B"]), 100))

test("ordering: 2 items swapped → 0%", lambda: eq(calc_section_score(
    {"id": "o", "type": "ordering", "title": "O", "content": {"items": ["A", "B"], "correct_order": [0, 1]}},
    ["B", "A"]), 0))


print("\n🧪 CARDS & TEXT (NOT GRADABLE)\n")

test("cards → None", lambda: is_none(calc_section_score(
    {"id": "c", "type": "cards", "title": "C", "content": {"cards": [{"front": "a", "back": "b"}]}}, None)))

test("text → None", lambda: is_none(calc_section_score(
    {"id": "t", "type": "text", "title": "T", "content": {"text": "Read this"}}, None)))


print("\n🧪 HOMEWORK COMPLETION LOGIC\n")

def test_completed_all_gradable():
    hw = {"sections": [
        {"id": "q1", "type": "quiz", "title": "T", "content": []},
        {"id": "fb1", "type": "fill_blanks", "title": "F", "content": {}},
        {"id": "t1", "type": "text", "title": "X", "content": {}},
        {"id": "c1", "type": "cards", "title": "C", "content": {}},
    ], "scores": {"q1": 100, "fb1": 50}}
    is_true(is_homework_completed(hw))
test("completed: all gradable sections scored", test_completed_all_gradable)

def test_not_completed_missing_score():
    hw = {"sections": [
        {"id": "q1", "type": "quiz", "title": "T", "content": []},
        {"id": "fb1", "type": "fill_blanks", "title": "F", "content": {}},
    ], "scores": {"q1": 100}}  # fb1 missing
    is_false(is_homework_completed(hw))
test("NOT completed: missing gradable score", test_not_completed_missing_score)

def test_only_nongradable():
    hw = {"sections": [
        {"id": "t1", "type": "text", "title": "X", "content": {}},
        {"id": "c1", "type": "cards", "title": "C", "content": {}},
    ], "scores": None}
    is_false(is_homework_completed(hw))
test("only text+cards → not auto-completed", test_only_nongradable)

def test_no_sections():
    hw = {"sections": [], "scores": None}
    is_false(is_homework_completed(hw))
test("empty sections → not completed", test_no_sections)


print("\n🧪 AVERAGE SCORE\n")

test("avg: 100+50+75 → 75", lambda: eq(avg_score({"scores": {"q": 100, "f": 50, "m": 75}}), 75))
test("avg: single score 67 → 67", lambda: eq(avg_score({"scores": {"q": 67}}), 67))
test("avg: null scores → None", lambda: is_none(avg_score({"scores": None})))
test("avg: empty scores → None", lambda: is_none(avg_score({"scores": {}})))
test("avg: 0+0 → 0", lambda: eq(avg_score({"scores": {"a": 0, "b": 0}}), 0))
test("avg: 100+0 → 50", lambda: eq(avg_score({"scores": {"a": 100, "b": 0}}), 50))


print("\n🧪 FULL FLOW: student → lesson → homework → answer → score\n")

def test_full_flow():
    s = Store()

    # 1. Create student
    student = s.add_student("Анна Иванова", "@anna_i")
    eq(len(s.students), 1)

    # 2. Create lesson
    lesson = s.add_lesson(student["id"], "Past Simple", "2026-03-07", "Правила Past Simple")
    eq(len(s.lessons), 1)
    eq(lesson["student_id"], student["id"])

    # 3. Create homework with 4 section types
    sections = [
        {"id": "sec-quiz", "type": "quiz", "title": "Тест по глаголам",
         "content": [
             {"question": "I ___ to school yesterday", "options": ["go", "went", "gone"], "correct": 1},
             {"question": "She ___ a book last night", "options": ["read", "reads", "reading"], "correct": 0},
         ]},
        {"id": "sec-fill", "type": "fill_blanks", "title": "Заполни пропуски",
         "content": {"text": "He ___ football. They ___ TV.", "answers": ["played", "watched"]}},
        {"id": "sec-match", "type": "matching", "title": "Соедини",
         "content": {"pairs": [{"left": "go", "right": "went"}, {"left": "see", "right": "saw"}]}},
        {"id": "sec-cards", "type": "cards", "title": "Карточки",
         "content": {"cards": [{"front": "go", "back": "went"}]}},
    ]

    hw = s.add_homework(lesson["id"], student["id"], "Домашка: Past Simple", sections)
    eq(len(s.homework), 1)
    eq(len(hw["sections"]), 4)
    eq(hw["lesson_id"], lesson["id"])

    # 4. Student answers quiz — all correct
    quiz_score = calc_section_score(sections[0], [1, 0])
    eq(quiz_score, 100)

    # 5. Student answers fill blanks — 1 wrong
    fill_score = calc_section_score(sections[1], ["played", "saw"])
    eq(fill_score, 50)

    # 6. Student answers matching — all correct
    match_score = calc_section_score(sections[2], [
        {"left": "go", "right": "went"}, {"left": "see", "right": "saw"}
    ])
    eq(match_score, 100)

    # 7. Update scores
    scores = {"sec-quiz": quiz_score, "sec-fill": fill_score, "sec-match": match_score}
    s.update_homework(hw["id"], scores=scores)

    updated = next(h for h in s.homework if h["id"] == hw["id"])
    eq(updated["scores"], {"sec-quiz": 100, "sec-fill": 50, "sec-match": 100})

    # 8. Check completion — all 3 gradable done (cards not gradable)
    is_true(is_homework_completed(updated))

    # 9. Mark completed
    s.update_homework(hw["id"], completed=True)
    final = next(h for h in s.homework if h["id"] == hw["id"])
    eq(final["completed"], True)

    # 10. Average score
    eq(avg_score(final), 83)  # (100+50+100)/3 = 83.33 → 83

test("full flow: create → answer → score → complete", test_full_flow)


def test_multiple_lessons_separate_homework():
    s = Store()
    st = s.add_student("Борис")
    l1 = s.add_lesson(st["id"], "Урок 1", "2026-03-01")
    l2 = s.add_lesson(st["id"], "Урок 2", "2026-03-07")

    s.add_homework(l1["id"], st["id"], "ДЗ 1a", [])
    s.add_homework(l1["id"], st["id"], "ДЗ 1b", [])
    s.add_homework(l2["id"], st["id"], "ДЗ 2", [])

    l1hw = [h for h in s.homework if h["lesson_id"] == l1["id"]]
    l2hw = [h for h in s.homework if h["lesson_id"] == l2["id"]]
    eq(len(l1hw), 2)
    eq(len(l2hw), 1)

    # Delete lesson 1 → cascades
    s.delete_lesson(l1["id"])
    eq(len(s.homework), 1)
    eq(s.homework[0]["lesson_id"], l2["id"])

test("multiple lessons with separate homework + cascade", test_multiple_lessons_separate_homework)


def test_delete_student_cascades_all():
    s = Store()
    st = s.add_student("Карина")
    l = s.add_lesson(st["id"], "Урок", "2026-03-07")
    s.add_homework(l["id"], st["id"], "ДЗ", [])
    s.delete_student(st["id"])
    eq(len(s.students), 0)
    eq(len(s.lessons), 0)
    eq(len(s.homework), 0)

test("delete student cascades everything", test_delete_student_cascades_all)


def test_mixed_sections_partial_completion():
    """Homework with 5 sections: quiz, fill, matching, text, cards.
    Student answers only quiz and matching → NOT completed (fill missing)."""
    s = Store()
    st = s.add_student("Тест")
    l = s.add_lesson(st["id"], "Урок", "2026-03-07")
    sections = [
        {"id": "q", "type": "quiz", "title": "Q", "content": [{"question": "?", "options": ["a", "b"], "correct": 0}]},
        {"id": "f", "type": "fill_blanks", "title": "F", "content": {"text": "___", "answers": ["x"]}},
        {"id": "m", "type": "matching", "title": "M", "content": {"pairs": [{"left": "a", "right": "1"}]}},
        {"id": "t", "type": "text", "title": "T", "content": {"text": "read"}},
        {"id": "c", "type": "cards", "title": "C", "content": {"cards": [{"front": "a", "back": "b"}]}},
    ]
    hw = s.add_homework(l["id"], st["id"], "ДЗ", sections)

    # Answer only quiz and matching
    s.update_homework(hw["id"], scores={"q": 100, "m": 100})
    updated = next(h for h in s.homework if h["id"] == hw["id"])

    # fill_blanks NOT answered → NOT completed
    is_false(is_homework_completed(updated), "should not be completed — fill_blanks missing")

    # Now answer fill too
    s.update_homework(hw["id"], scores={"q": 100, "m": 100, "f": 50})
    final = next(h for h in s.homework if h["id"] == hw["id"])
    is_true(is_homework_completed(final), "should be completed now")
    eq(avg_score(final), 83)  # (100+100+50)/3

test("mixed sections: partial → then complete", test_mixed_sections_partial_completion)


# ══════════════════════════════════════════════════════
# REPORT
# ══════════════════════════════════════════════════════

print(f"\n{'='*50}")
print(f"✅ Passed: {PASSED}")
if FAILED:
    print(f"❌ Failed: {FAILED}")
else:
    print("🎉 All tests passed!")
print(f"{'='*50}\n")

sys.exit(1 if FAILED else 0)

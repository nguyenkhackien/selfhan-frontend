import type {
  Flashcard,
  Goal,
  Note,
  WeeklyActivity,
  WritingPrompt,
} from "../types/learning";

export const initialGoals: Goal[] = [
  {
    id: 1,
    label: "Hoàn thành bài tập khởi động",
    detail: "5 phút · Buổi sáng",
    done: true,
  },
  {
    id: 2,
    label: "Ôn tập 20 flashcard cũ",
    detail: "10 phút · Vocabulary",
    done: true,
  },
  {
    id: 3,
    label: "Viết một đoạn ngắn về sở thích",
    detail: "10 phút · Writing",
    done: false,
  },
];

export const flashcards: Flashcard[] = [
  {
    id: 1,
    term: "serenity",
    phonetic: "/səˈren.ə.ti/",
    meaning: "Sự thanh bình",
    example: "The quiet garden gave her a sense of serenity.",
    topic: "Mindful travel",
  },
  {
    id: 2,
    term: "meander",
    phonetic: "/miˈæn.dər/",
    meaning: "Uốn lượn, đi thong thả",
    example: "We meandered through the old streets at sunset.",
    topic: "Travel",
  },
  {
    id: 3,
    term: "luminous",
    phonetic: "/ˈluː.mɪ.nəs/",
    meaning: "Rạng rỡ, phát sáng",
    example: "A luminous moon guided us home.",
    topic: "Nature",
  },
  {
    id: 4,
    term: "unwind",
    phonetic: "/ʌnˈwaɪnd/",
    meaning: "Thư giãn, thả lỏng",
    example: "I read a book to unwind after studying.",
    topic: "Wellbeing",
  },
];

export const initialNotes: Note[] = [
  {
    id: 1,
    title: "Mẹo nhớ cụm từ đi du lịch",
    content:
      "Pair “get around” with a mental map of the city. Review it with the flashcards tonight.",
    category: "Vocabulary",
    date: "Hôm nay",
  },
  {
    id: 2,
    title: "Ý tưởng cho bài viết thứ Sáu",
    content:
      "Write about a slow morning at a café. Use serene, aroma, and wander in one paragraph.",
    category: "Writing",
    date: "Hôm qua",
  },
  {
    id: 3,
    title: "Lỗi cần chú ý",
    content:
      "Remember: “interested in”, not “interested on”. Make one example sentence tomorrow.",
    category: "Grammar",
    date: "12 thg 8",
  },
];

export const writingPrompts: WritingPrompt[] = [
  {
    id: 1,
    tag: "Nhẹ nhàng",
    title: "Một buổi sáng chậm rãi",
    text: "Hãy miêu tả một buổi sáng hoàn hảo của bạn. Bạn ở đâu, nghe thấy gì, và điều gì khiến khoảnh khắc ấy đáng nhớ?",
  },
  {
    id: 2,
    tag: "Du lịch",
    title: "Một nơi muốn ghé thăm",
    text: "Viết về một thành phố bạn muốn khám phá. Hãy dùng ít nhất ba từ mới trong tuần này.",
  },
  {
    id: 3,
    tag: "Suy ngẫm",
    title: "Điều nhỏ bé làm bạn vui",
    text: "Kể lại một điều nhỏ đã khiến ngày hôm nay của bạn dễ chịu hơn.",
  },
];

export const weeklyActivity: WeeklyActivity[] = [
  { day: "T2", minutes: 28 },
  { day: "T3", minutes: 42 },
  { day: "T4", minutes: 18 },
  { day: "T5", minutes: 35 },
  { day: "T6", minutes: 40 },
  { day: "T7", minutes: 24 },
  { day: "CN", minutes: 30 },
];

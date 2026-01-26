export interface User {
  id: string
  email: string
  role: "user" | "admin"
  // Kept for backward compatibility, but no longer used for access control
  trial_end: string
  subscription_end: string | null
  created_at: string
  // New profile fields
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  // Single-device session fields
  active_device_id?: string | null
  last_login_at?: string | null
}

export interface Topic {
  id: string
  title: string
  is_public: boolean
  created_at: string
}

export interface Test {
  id: string
  topic_id: string
  image_url: string
  // Latin
  question: string
  answers: string[]
  explanation_title: string | null
  explanation_text: string | null
  audio_url: string | null
  // Cyrillic
  question_cyrl: string | null
  answers_cyrl: string[] | null
  explanation_title_cyrl: string | null
  explanation_text_cyrl: string | null
  audio_url_cyrl: string | null

  correct_answer: number
  time_limit: number
  category: string // Added category field
  created_at: string
}

export interface Ticket {
  id: string
  title: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface TicketTest {
  id: string
  ticket_id: string
  test_id: string
  order_index: number
  created_at: string
}

export interface TestResult {
  id: string
  user_id: string
  test_id: string
  score: number
  total_questions: number
  correct_answers: number
  wrong_answers: number
  created_at: string
}

export interface TopicStatistics {
  id: string
  user_id: string
  topic_id: string
  correct_count: number
  wrong_count: number
  unanswered_count: number
  percentage: number
  last_attempt_at: string
  created_at: string
  updated_at: string
}

export interface TicketStatistics {
  id: string
  user_id: string
  ticket_id: string
  correct_count: number
  wrong_count: number
  unanswered_count: number
  percentage: number
  last_attempt_at: string
  created_at: string
  updated_at: string
}

export interface ExamStatistics {
  id: string
  user_id: string
  exam_type: 20 | 50 | 100
  correct_count: number
  wrong_count: number
  unanswered_count: number
  percentage: number
  last_attempt_at: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  question_font_size: number
  answer_font_size: number
  language: "uz-lat" | "uz-cyr" | "ru"
  created_at: string
  updated_at: string
}

export type Language = "uz-lat" | "uz-cyr" | "ru"

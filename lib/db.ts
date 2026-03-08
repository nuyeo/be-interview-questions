import { supabase } from "./supabase";

export type StudyRecord = {
  question_id: number;
  answer: string;
  feedback: string;
  studied_at: string;
};

// ─── Study Records ───

export async function fetchStudyRecords(userId: string): Promise<StudyRecord[]> {
  const { data, error } = await supabase
    .from("study_records")
    .select("question_id, answer, feedback, studied_at")
    .eq("user_id", userId)
    .order("studied_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch study records:", error);
    return [];
  }
  return data || [];
}

export async function upsertStudyRecord(
  userId: string,
  questionId: number,
  answer: string,
  feedback: string
): Promise<boolean> {
  const { error } = await supabase
    .from("study_records")
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        answer,
        feedback,
        studied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,question_id" }
    );

  if (error) {
    console.error("Failed to upsert study record:", error);
    return false;
  }
  return true;
}

// ─── Bookmarks ───

export async function fetchBookmarks(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch bookmarks:", error);
    return [];
  }
  return data?.map((b) => b.question_id) || [];
}

export async function addBookmark(userId: string, questionId: number): Promise<boolean> {
  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: userId, question_id: questionId });

  if (error && error.code !== "23505") { // ignore duplicate
    console.error("Failed to add bookmark:", error);
    return false;
  }
  return true;
}

export async function removeBookmark(userId: string, questionId: number): Promise<boolean> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);

  if (error) {
    console.error("Failed to remove bookmark:", error);
    return false;
  }
  return true;
}

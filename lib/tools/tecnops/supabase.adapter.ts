import { supabase } from "@/lib/supabase"; // ajuste o path

export async function createWorkItem(data: {
  title: string;
  description?: string;
  type: string;
  priority: string;
  project_id: string;
  parent_id?: string | null;
  created_by: string;
}) {
  const { data: result, error } = await supabase
    .from("work_items")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
}

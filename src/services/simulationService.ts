import { supabase } from '../lib/supabase';

export interface SimulationData {
  id?: string;
  user_id: string;
  current_phase: number;
  quiz_score: number;
  english_score: number;
  completed: boolean;
  started_at?: string;
  last_updated?: string;
}

export interface AnswerData {
  id?: string;
  simulation_id: string;
  user_id: string;
  phase: number;
  question_id: string;
  selected_answer: string;
  correct: boolean;
}

export async function getOrCreateSimulation(userId: string): Promise<SimulationData | null> {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('open_day_simulations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      return existing;
    }

    const { data: newSim, error: createError } = await supabase
      .from('open_day_simulations')
      .insert({
        user_id: userId,
        current_phase: 1,
        quiz_score: 0,
        english_score: 0,
        completed: false
      })
      .select()
      .single();

    if (createError) throw createError;

    return newSim;
  } catch (error) {
    console.error('Error in getOrCreateSimulation:', error);
    return null;
  }
}

export async function updateSimulation(
  simulationId: string,
  updates: Partial<SimulationData>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('open_day_simulations')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', simulationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating simulation:', error);
    return false;
  }
}

export async function saveAnswers(answers: AnswerData[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('open_day_answers')
      .insert(answers);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving answers:', error);
    return false;
  }
}

export async function deleteSimulation(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('open_day_simulations')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return false;
  }
}

export async function getAllSimulations(): Promise<SimulationData[]> {
  try {
    const { data, error } = await supabase
      .from('open_day_simulations')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all simulations:', error);
    return [];
  }
}

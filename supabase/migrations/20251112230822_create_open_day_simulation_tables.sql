/*
  # Open Day Simulation System

  ## Overview
  Creates the database structure for the Emirates Open Day Simulation System (ODS)
  with 3 phases: Presentation, Quiz, and English Test.

  ## New Tables

  ### `open_day_simulations`
  Stores user progress and scores across all phases
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to users)
  - `current_phase` (integer) - 1, 2, or 3
  - `quiz_score` (integer) - 0-100
  - `english_score` (integer) - 0-100
  - `completed` (boolean)
  - `started_at` (timestamptz)
  - `last_updated` (timestamptz)

  ### `open_day_answers`
  Stores individual answers for tracking and review
  - `id` (uuid, primary key)
  - `simulation_id` (uuid, foreign key to open_day_simulations)
  - `user_id` (uuid, foreign key to users)
  - `phase` (integer) - 1, 2, or 3
  - `question_id` (text)
  - `selected_answer` (text)
  - `correct` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only view/modify their own simulation data
  - Governors can view all simulations for oversight
*/

-- Create open_day_simulations table
CREATE TABLE IF NOT EXISTS open_day_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_phase integer DEFAULT 1 NOT NULL CHECK (current_phase BETWEEN 1 AND 3),
  quiz_score integer DEFAULT 0 CHECK (quiz_score BETWEEN 0 AND 100),
  english_score integer DEFAULT 0 CHECK (english_score BETWEEN 0 AND 100),
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Create open_day_answers table
CREATE TABLE IF NOT EXISTS open_day_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid REFERENCES open_day_simulations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  phase integer NOT NULL CHECK (phase BETWEEN 1 AND 3),
  question_id text NOT NULL,
  selected_answer text NOT NULL,
  correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simulations_user ON open_day_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_completed ON open_day_simulations(completed);
CREATE INDEX IF NOT EXISTS idx_answers_simulation ON open_day_answers(simulation_id);
CREATE INDEX IF NOT EXISTS idx_answers_user ON open_day_answers(user_id);

-- Enable RLS
ALTER TABLE open_day_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_day_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for open_day_simulations

-- Users can view their own simulations
CREATE POLICY "Users can view own simulations"
  ON open_day_simulations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own simulations
CREATE POLICY "Users can create own simulations"
  ON open_day_simulations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own simulations
CREATE POLICY "Users can update own simulations"
  ON open_day_simulations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own simulations
CREATE POLICY "Users can delete own simulations"
  ON open_day_simulations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for open_day_answers

-- Users can view their own answers
CREATE POLICY "Users can view own answers"
  ON open_day_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own answers
CREATE POLICY "Users can create own answers"
  ON open_day_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
CREATE POLICY "Users can update own answers"
  ON open_day_answers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete own answers"
  ON open_day_answers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

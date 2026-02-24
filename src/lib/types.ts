export interface WikiCard {
  card_id: string;
  start_title: string;
  target_title: string;
  language: string;
  max_steps: number;
}

export interface StepObject {
  step: number;
  current_title: string;
  target_title: string;
  selected_link_text: string;
  reason_summary: string;
}

export interface RunResult {
  card_id: string;
  success: boolean;
  steps: StepObject[];
  path_titles: string[];
  total_steps: number;
}

export type PollOption = "1-3" | "4-6" | "7-9" | "10+";

export interface PollState {
  card_id: string;
  votes: Record<PollOption, number>;
  user_vote?: PollOption;
  total_votes: number;
}

export type CardPhase = "prediction" | "running" | "result";

export interface AgentAction {
  command: string;
  result_preview?: string;
  timestamp: number;
}

export interface CardState {
  card: WikiCard;
  phase: CardPhase;
  poll: PollState;
  run?: RunResult;
  current_step?: StepObject;
  session_id?: string;
  live_view_url?: string;
  agent_actions: AgentAction[];
}

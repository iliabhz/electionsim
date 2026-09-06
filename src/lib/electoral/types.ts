export type SystemId =
  | 'plurality'
  | 'runoff'
  | 'irv'
  | 'condorcet'
  | 'borda'
  | 'approval'
  | 'score';

export type Ballot =
  | { type: 'ranked'; ranking: string[] }
  | { type: 'cardinal'; scores: Record<string, number> }
  | { type: 'picks'; picks: string[] };

export type BallotType = Ballot['type'];

export interface Candidate {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
}

export interface VoterBloc {
  id: string;
  label: string;
  count: number;
  ballot: Ballot;
}

export interface ElectionOptions {
  maxScore?: number;
}

export interface ElectionInput {
  candidates: Candidate[];
  blocs: VoterBloc[];
  system: SystemId;
  seats: number;
  voterMode: 'individual' | 'blocs';
  options?: ElectionOptions;
}

export interface WeightedBallot {
  weight: number;
  ballot: Ballot;
}

export interface SeatResult {
  candidateId: string;
  seat: number;
}

export interface TallyRow {
  candidateId: string;
  value: number;
}

export type RoundNote =
  | 'majority_first_round'
  | 'final_round'
  | 'forced_winner'
  | 'last_remaining'
  | 'no_condorcet_winner'
  | 'condorcet_winner';

export interface TransferEdge {
  from: string;
  to: string | null;
  weight: number;
}

export interface RoundInfo {
  index: number;
  seat?: number;
  tallies: TallyRow[];
  eliminated?: string;
  qualified?: string[];
  seatWinner?: string;
  exhausted?: number;
  note?: RoundNote;
  transfers?: TransferEdge[];
}

interface ElectionResultBase {
  winners: SeatResult[];
  tieAtSeatBoundary?: boolean;
}

export type TallyResult = ElectionResultBase & {
  kind: 'tally';
  tallies: TallyRow[];
};

export type RoundsResult = ElectionResultBase & {
  kind: 'rounds';
  rounds: RoundInfo[];
  exhaustedTotal: number;
};

export type PairwiseResult = ElectionResultBase & {
  kind: 'pairwise';
  matrix: number[][];
  order: string[];
  cycle?: string[];
  smithSet?: string[];
};

export type ElectionResult = TallyResult | RoundsResult | PairwiseResult;

export class EngineError extends Error {
  constructor(
    public code: 'validation' | 'unsupported',
    message: string,
  ) {
    super(message);
    this.name = 'EngineError';
  }
}

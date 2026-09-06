import { ballotTypeFor, totalWeight } from './ballots';
import type { ElectionInput } from '../types';

export function validateInput(input: ElectionInput): string[] {
  const errors: string[] = [];
  const ids = new Set(input.candidates.map((c) => c.id));

  if (input.candidates.length < 3) {
    errors.push('at least 3 candidates required');
  }
  if (ids.size !== input.candidates.length) {
    errors.push('duplicate candidate ids');
  }
  if (!Number.isInteger(input.seats) || input.seats < 1) {
    errors.push('seats must be a positive integer');
  } else if (input.seats > input.candidates.length) {
    errors.push('seats cannot exceed the number of candidates');
  }
  if ((input.system === 'runoff' || input.system === 'condorcet') && input.seats > 1) {
    errors.push(`${input.system} does not support multi-winner elections`);
  }
  if (input.blocs.length === 0) {
    errors.push('no voter blocs defined');
  }

  const maxScore = input.options?.maxScore ?? 5;
  const expectedType = ballotTypeFor(input.system, input.seats);

  for (const bloc of input.blocs) {
    if (!Number.isInteger(bloc.count) || bloc.count < 0) {
      errors.push(`bloc ${bloc.id}: count must be a non-negative integer`);
      continue;
    }
    const b = bloc.ballot;
    if (b.type === 'ranked') {
      if (
        input.system !== 'plurality' &&
        b.type !== expectedType
      ) {
        errors.push(`bloc ${bloc.id}: expected ${expectedType} ballot`);
      }
      const seen = new Set<string>();
      for (const id of b.ranking) {
        if (!ids.has(id)) errors.push(`bloc ${bloc.id}: unknown candidate ${id}`);
        if (seen.has(id)) errors.push(`bloc ${bloc.id}: duplicate ranking for ${id}`);
        seen.add(id);
      }
    } else if (b.type === 'picks') {
      const allowed = input.system === 'plurality';
      if (!allowed) {
        errors.push(`bloc ${bloc.id}: picks ballots are only valid for plurality`);
      }
      const seen = new Set<string>();
      for (const id of b.picks) {
        if (!ids.has(id)) errors.push(`bloc ${bloc.id}: unknown candidate ${id}`);
        if (seen.has(id)) errors.push(`bloc ${bloc.id}: duplicate pick ${id}`);
        seen.add(id);
      }
      if (b.picks.length === 0) {
        errors.push(`bloc ${bloc.id}: empty picks`);
      }
      if (b.picks.length > input.seats) {
        errors.push(
          `bloc ${bloc.id}: picks (${b.picks.length}) exceed seats (${input.seats})`,
        );
      }
      if (input.seats === 1 && b.picks.length > 1) {
        errors.push(`bloc ${bloc.id}: single-winner plurality allows one pick`);
      }
    } else {
      if (input.system !== 'approval' && input.system !== 'score') {
        errors.push(`bloc ${bloc.id}: expected ${expectedType} ballot`);
      }
      for (const [id, v] of Object.entries(b.scores)) {
        if (!ids.has(id)) {
          errors.push(`bloc ${bloc.id}: unknown candidate ${id}`);
        }
        if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > maxScore) {
          errors.push(
            `bloc ${bloc.id}: score for ${id} outside 0..${maxScore}`,
          );
        } else if (input.system === 'approval' && v !== 0 && v !== 1) {
          errors.push(`bloc ${bloc.id}: approval scores must be 0 or 1 (${id})`);
        }
      }
    }
  }

  if (totalWeight(input.blocs.map((b) => ({ weight: b.count, ballot: b.ballot }))) <= 0) {
    errors.push('total voter count must be greater than zero');
  }

  return errors;
}

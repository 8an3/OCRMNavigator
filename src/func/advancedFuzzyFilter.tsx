


export function advancedFuzzyFilter<T>(
  items: T[],
  search: string,
  keys: (keyof T)[],
  options: {
    threshold?: number;
    weights?: Partial<Record<keyof T, number>>;
    maxEditDistance?: number;
    cacheResults?: boolean;
  } = {}
): Array<{ item: T, score: number }> {
  // Early return for empty search
  if (!search) return items.map(item => ({ item, score: 1 }));

  // Options with defaults
  const {
    threshold = 0,
    weights = {} as Partial<Record<keyof T, number>>,
    maxEditDistance = 2,
    cacheResults = true
  } = options;

  const searchLower = search.toLowerCase();
  const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);

  // Return all items with perfect score if no meaningful search terms
  if (searchTerms.length === 0) return items.map(item => ({ item, score: 1 }));

  // Setup memoization for performance
  const levenshteinCache: Record<string, number> = {};
  const textCache: Record<string, string> = {};

  // Calculate Levenshtein distance with memoization
  function levenshtein(a: string, b: string): number {
    // Ensure smaller string is first parameter for consistent caching
    if (b.length < a.length) [a, b] = [b, a];

    const cacheKey = `${a}|${b}`;
    if (cacheResults && levenshteinCache[cacheKey] !== undefined) {
      return levenshteinCache[cacheKey];
    }

    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const result = matrix[b.length][a.length];
    if (cacheResults) {
      levenshteinCache[cacheKey] = result;
    }
    return result;
  }

  // Get key text with caching
  function getItemText(item: T, key: keyof T): string {
    const cacheKey = item + '|' + String(key);
    if (cacheResults && textCache[cacheKey] !== undefined) {
      return textCache[cacheKey];
    }

    const value = item[key];
    const text = typeof value === 'string' ? value.toLowerCase() : '';

    if (cacheResults) {
      textCache[cacheKey] = text;
    }
    return text;
  }

  const results = items
    .map(item => {
      // Calculate the max possible score based on weights
      let maxPossibleScore = 0;
      keys.forEach(key => {
        maxPossibleScore += weights[key] || 1;
      });

      // Calculate score for each search term against each weighted key
      let totalScore = 0;

      for (const term of searchTerms) {
        let termMaxScore = 0;

        for (const key of keys) {
          const text = getItemText(item, key);
          const keyWeight = weights[key] || 1;

          // Early return for exact matches (maximum possible score)
          if (text === term) {
            termMaxScore = keyWeight;
            break; // No need to check other keys, this is the best match
          }

          // Try containing match (high score)
          if (text.includes(term)) {
            const contextScore = keyWeight * 0.9; // Slightly reduced for non-exact match
            termMaxScore = Math.max(termMaxScore, contextScore);
            continue; // Check other keys in case there's a better match
          }

          // Try partial word matching
          const words = text.split(/\s+/);
          let bestPartialScore = 0;

          for (const word of words) {
            // Exact word match
            if (word === term) {
              bestPartialScore = keyWeight * 0.9;
              break;
            }

            // Partial match (word contains term or term contains word)
            if (word.includes(term) || term.includes(word)) {
              // Score based on how much of the term matches
              const matchRatio = Math.min(term.length, word.length) /
                Math.max(term.length, word.length);
              const partialScore = keyWeight * matchRatio * 0.8;
              bestPartialScore = Math.max(bestPartialScore, partialScore);
            }
          }

          if (bestPartialScore > 0) {
            termMaxScore = Math.max(termMaxScore, bestPartialScore);
            continue; // Check other keys in case there's a better match
          }

          // Try edit distance for typo tolerance
          let bestDistanceScore = 0;

          for (const word of words) {
            // Only check words of similar length to save computation
            if (Math.abs(word.length - term.length) <= maxEditDistance) {
              const distance = levenshtein(term, word);
              if (distance <= maxEditDistance) {
                // Score based on edit distance (lower distance = higher score)
                const similarityScore = 1 - (distance / Math.max(maxEditDistance + 1, term.length));
                const distanceScore = keyWeight * similarityScore * 0.6; // Lower score for typo matches
                bestDistanceScore = Math.max(bestDistanceScore, distanceScore);
              }
            }
          }

          termMaxScore = Math.max(termMaxScore, bestDistanceScore);
        }

        totalScore += termMaxScore;
      }

      // Normalize score between 0 and 1
      const normalizedScore = maxPossibleScore > 0 ?
        totalScore / (searchTerms.length * maxPossibleScore / keys.length) : 0;

      return {
        item,
        score: normalizedScore
      };
    })
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score);
  console.log('results', results)
  return results;
}
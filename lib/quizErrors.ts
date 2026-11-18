// lib/quizErrors.ts — premier message d'une erreur DRF imbriquée (quiz → questions → choix).
// Ex. {questions: [{}, {choices: ["Au moins 2 choix…"]}]} → "Question 2 › choices: Au moins 2 choix…"

const LABELS: Record<string, string> = { questions: 'Question', choices: 'Choice' };

export function firstNestedError(data: unknown, path: string[] = []): string | null {
  if (typeof data === 'string') return path.length ? `${path.join(' › ')}: ${data}` : data;
  if (Array.isArray(data)) {
    for (let index = 0; index < data.length; index += 1) {
      const item = data[index];
      if (typeof item === 'string') return firstNestedError(item, path);
      const parent = path[path.length - 1];
      const label = parent && LABELS[parent] ? [...path.slice(0, -1), `${LABELS[parent]} ${index + 1}`] : path;
      const found = firstNestedError(item, label);
      if (found) return found;
    }
    return null;
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === 'string') return record.detail;
    for (const [field, value] of Object.entries(record)) {
      const found = firstNestedError(value, [...path, field === 'non_field_errors' ? 'error' : field]);
      if (found) return found;
    }
  }
  return null;
}

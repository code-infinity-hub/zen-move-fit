export const isDeepEqual = (a: any, b: any): boolean => {
  // Mesmo valor ou mesma referência
  if (a === b) return true;

  // Se um deles não for objeto ou for null
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  // Verifica se ambos são arrays ou não
  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);

  if (isArrayA !== isArrayB) return false;

  // Pega as chaves
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Quantidade diferente de chaves
  if (keysA.length !== keysB.length) return false;

  // Verifica cada chave recursivamente
  return keysA.every((key) => {
    return keysB.includes(key) && isDeepEqual(a[key], b[key]);
  });
};
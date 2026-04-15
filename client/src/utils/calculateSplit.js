// Pure function — never use AI for this
export function splitEqually(amount, count) {
  const share = parseFloat((amount / count).toFixed(2));
  return share;
}

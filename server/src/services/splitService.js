// Split amount equally among members
export function splitEqually(amount, memberIds) {
  const share = parseFloat((amount / memberIds.length).toFixed(2));
  return memberIds.map(id => ({ userId: id, owes: share }));
}

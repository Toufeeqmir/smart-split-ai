// Calculates who owes whom — pure math, no AI
export function calculateBalances(expenses) {
  const balances = {};
  for (const exp of expenses) {
    const share = exp.amount / exp.splitAmong.length;
    for (const userId of exp.splitAmong) {
      const uid = userId.toString();
      const payer = exp.paidBy.toString();
      if (uid === payer) continue;
      const key = [payer, uid].sort().join('_');
      if (!balances[key]) balances[key] = { from: uid, to: payer, amount: 0 };
      balances[key].amount += (balances[key].to === payer) ? share : -share;
    }
  }
  return Object.values(balances);
}

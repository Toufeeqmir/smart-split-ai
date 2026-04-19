export const simpleBalances = (balances) => {
 const net = {};
  for(let key in balances){
    const [from , to] = key.split("->");
    const amount = balances[key];

    net[from] = (net[from] ||0) -amount;
    net[to] = (net[to] || 0) + amount;
  }

  const creditors = [];
  const debtors = [];

  for(let user in net){
    if(net[user] > 0){
        creditors.push({user, amount: net[user]});

    }else if(net[user] < 0){
        debtors.push({user, amount: -net[user]});
    }
  }

  const result = [];

  let i=0 , j=0;

  while(i < debtors.length && j < creditors.length){
    const amt = Math.min(debtors[i].amount , creditors[j].amount);

    result.push({
        from: debtors[i].user,
        to: creditors[j].user,
        amount: amt,
    });

    debtors[i].amount -= amt;
    creditors[j].amount -=amt;

    if(debtors[i].amount ===0) i++;
    if(creditors[j].amount ===0) j++;
  }
  return result;
};
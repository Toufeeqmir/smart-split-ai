export const calculateBalances = (expenses) =>{

    if(!Array.isArray(expenses)){
        return {}; //prevent crash
    }
    const balances = {};

    expenses.forEach((exp) =>{
         const splitAmount = exp.amount / (exp.splitAmong.length || 1);
         
         exp.splitAmong.forEach((user) =>{
            if(user !== exp.paidBy){
                const key = `${user}->${exp.paidBy}`;

                if(!balances[key]){
                    balances[key] =0;
                }
                balances[key] += splitAmount;
            }
         })
    });
    return balances;
}
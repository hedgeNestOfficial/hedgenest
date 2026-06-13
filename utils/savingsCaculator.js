exports.caculateSavings = ({amount, duration, interestRate})=>{
    const interestBeforeTax = (amount * interestRate * duration)/(100 * 365)
    const withHoldingTax = interestBeforeTax * 0.1;
    const interestAfterTax = interestBeforeTax - withHoldingTax;
    const totalPayBack = amount + interestAfterTax

    return {
        interestBeforeTax:Number(interestBeforeTax.toFixed(2)), 
        withHoldingTax:Number(withHoldingTax.toFixed(2)),
        interestAfterTax:Number(interestAfterTax.toFixed(2)),
        totalPayBack:Number(totalPayBack.toFixed(2))
    }
}

exports.getInterestRate = (duration) =>{
    if(duration >= 7 && duration <= 30){
        return 14;
    }
    if(duration >= 31 && duration <= 180){
        return 15;
    }
    if(duration >= 181 && duration <= 365){
        return 16;
    }
    return 17;
}
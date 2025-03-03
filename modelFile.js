// function model(instanceParameters, modelParameters, x){
//     var X = Math.exp(-x*instanceParameters.c);

//     var a = modelParameters.a, b = modelParameters.b;

//     return a*X**2 + X + b;
// }
function model(instanceParameters, modelParameters, x){
    const Js0 = modelParameters.Js0,
        Xti1 = modelParameters.Xti1,
        Nj = modelParameters.Nj,
        Jssw0 = modelParameters.Jssw0,
        Xti2 = modelParameters.Xti2,
        Njssw = modelParameters.Njssw,
        eta = modelParameters.eta;
    
    const Tnom = 20 + 273.15;
    
    const area = (instanceParameters.size * 1e-6) ** 2,
        perimeter = (instanceParameters.size * 1e-6) * 2*(2+1),
        temp = instanceParameters.temp + 273.15;

    const Eg0 = 1.1047;
        
    const Eg_Tnom = Eg0 - 4.73 * 1e-4 * Math.pow((Tnom ), 2) / (Tnom  + 636);

    const Eg = Eg0 - 4.73 * 1e-4 * Math.pow((temp), 2) / (temp  + 636) ;
    
    const Xtil1 = Xti1 * Math.log(temp/Tnom); 
    const Xtil2 = Xti2 * Math.log(temp/Tnom); 

    const Eg_nom_x_Beta_nom = Eg_Tnom * 1.16041735 * 1e4 / Tnom;

    const Eg_x_beta = Eg * 1.16041735 * 1e4 / temp;

    const Js = Js0 * Math.exp((Eg_nom_x_Beta_nom - Eg_x_beta + Xtil1) / Nj) ; 

    const Jssw = Jssw0 * Math.exp((Eg_nom_x_Beta_nom - Eg_x_beta + Xtil2) / Njssw) ;




    // const Js = Js0 * Math.exp((1.16041735 * 1e4) * ( Eg_Tnom/(25 + 273.15) - Eg/(temp) + Xti1 * Math.log(temp / (25 + 273.15))  ) /Nj  ) ;

    // const Jssw = Jssw0 * ((1.16041735 * 1e4) * ( Eg_Tnom/(25 + 273.15) - Eg/(temp) + Xti2 * Math.log(temp / (25 + 273.15)))/ Njssw  );  

    const Is = Js * area + Jssw * perimeter;

    console.log({
        "js":Js,
        "Jso":Js0,
        "jssw":Jssw,
        "Xtil1":Xtil1,
        "Xtil2":Xtil2,
        "Eg_tnom":Eg_Tnom,
        "Eg":Eg,
        "Area" : area,
        "perimeter":perimeter,

        "Nj":Nj,
        "Njssw":Njssw
    });
    return   Is * Math.abs(Math.exp( (-(x)) * 1.226321 * (1e4) / (temp *eta )  ) - 1);

}
// function model(instanceParameters, modelParameters, x){
//     let is = modelParameters.is,
//         eta = modelParameters.eta,
//         temp = instanceParameters.temp;
//     const y = is * Math.abs(Math.exp( (-x) * 1.226321 * (1e4) / ((temp + 273.15) *eta )  ) - 1);
//     return y;

// }

// function model(instanceParameters, modelParameters, x) {
//     // Compute a decaying exponential term
//     let X = Math.exp(-x * instanceParameters.c);

//     // Extract parameters
//     let a = modelParameters.a, 
//         b = modelParameters.b,
//         alpha = modelParameters.alpha; 
//         beta = modelParameters.beta,
//         gamma = modelParameters.gamma;

//     // Compute polynomial and logarithmic interactions
//     let polyTerm = a * X ** 3 + b * X ** 2 + gamma/X;
//     // let logTerm = Math.log(1 + Math.abs(X * beta));

//     // Combine terms with nonlinear operations
//     let result = alpha * polyTerm + Math.sqrt(Math.abs(beta * X)) + Math.exp(-gamma * x);

//     // Apply conditional logic for stability
//     // if (result > 1000) result = 1000;
//     // if (isNaN(result) || !isFinite(result)) result = 0; // Handle edge cases

//     return result;
// }

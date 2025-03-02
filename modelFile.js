// function model(instanceParameters, modelParameters, x){
//     var X = Math.exp(-x*instanceParameters.c);

//     var a = modelParameters.a, b = modelParameters.b;

//     return a*X**2 + X + b;
// }

function model(instanceParameters, modelParameters, x) {
    // Compute a decaying exponential term
    let X = Math.exp(-x * instanceParameters.c);

    // Extract parameters
    let a = modelParameters.a, 
        b = modelParameters.b,
        alpha = modelParameters.alpha; 
        beta = modelParameters.beta,
        gamma = modelParameters.gamma;

    // Compute polynomial and logarithmic interactions
    let polyTerm = a * X ** 3 + b * X ** 2 + gamma/X;
    // let logTerm = Math.log(1 + Math.abs(X * beta));

    // Combine terms with nonlinear operations
    let result = alpha * polyTerm + Math.sqrt(Math.abs(beta * X)) + Math.exp(-gamma * x);

    // Apply conditional logic for stability
    // if (result > 1000) result = 1000;
    // if (isNaN(result) || !isFinite(result)) result = 0; // Handle edge cases

    return result;
}

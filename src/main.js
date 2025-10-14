let prompt = require("prompt-sync")();

function Funcoes() {
    let funcoes = [];
    
    let numTermos = Number(prompt("Quantos termos tem a função? "));
    
    for (let i = 0; i < numTermos; i++) {
        let coeficiente = Number(prompt(`Digite o coeficiente do termo ${i + 1}: `));
        let expoente = Number(prompt(`Digite o expoente do termo ${i + 1}: `));
        
        funcoes.push([coeficiente, expoente]);
    }
    
    return funcoes;
}

function derivada(coeficiente, expoente) {
    if (expoente == 0) {
        return [0, 0];
    }
    
    let novoCoeficiente = coeficiente * expoente;
    let novoExpoente = expoente - 1;
    
    return [novoCoeficiente, novoExpoente];
}

function calcularDerivada(funcoes) {
    let derivadaFuncoes = [];
    
    for (let i = 0; i < funcoes.length; i++) {
        let [coeficiente, expoente] = funcoes[i];
        let derivadaTermo = derivada(coeficiente, expoente);
        derivadaFuncoes.push(derivadaTermo);
    }
    
    return derivadaFuncoes;
}

function exibirResultado(derivadaFuncoes) {
    let resultado = "Derivada: ";
    
    for (let i = 0; i < derivadaFuncoes.length; i++) {
        let [coeficiente, expoente] = derivadaFuncoes[i];
        
        if (coeficiente != 0) {
            resultado += `${coeficiente}x^${expoente}`;
            if (i < derivadaFuncoes.length - 1) {
                resultado += " + ";
            }
        }
    }
    
    console.log(resultado);
}

let funcoes = Funcoes();

console.log("\nFunção original:");

funcoes.forEach(([coef, expo]) => {
    console.log(`${coef}x^${expo}`);
});

let derivadaFuncoes = calcularDerivada(funcoes);

exibirResultado(derivadaFuncoes);

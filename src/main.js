let prompt = require("prompt-sync")();

let funcao = '';
let funcoes = [];

function Funcoes(funcao) {
  let termos = [];
    let termoAtual = '';
    let coeficiente = 0;
    let expoente = 0;

    funcao = funcao.replace(/\s+/g, '');

    //console.log(funcao)
    if(funcao[0] !== '-' && funcao[0] !== '+')
        funcao = '+' + funcao;
    //console.log(funcao)


    for (let i = 0; i < funcao.length; i++) {
        const caractere = funcao[i];

    if (caractere === 'x') {
        if (termoAtual === '' || termoAtual === '+' || termoAtual === '-') {
            coeficiente = termoAtual === '-' ? -1 : 1;
        } else {
            coeficiente = parseInt(termoAtual);
        }
        
        if (funcao[i + 1] === '^') {
            let inicioExpoente = i + 2;
            let fimExpoente = inicioExpoente;
            while (fimExpoente < funcao.length && !isNaN(funcao[fimExpoente])) {
                fimExpoente++;
            }
            expoente = parseInt(funcao.slice(inicioExpoente, fimExpoente));
            i = fimExpoente - 1;
        } else {
            expoente = 1;
        }

        termos.push({ coeficiente, expoente });
        termoAtual = '';
    } else if (caractere === '+' || caractere === '-') {
        if (termoAtual !== '') {
            if (termoAtual !== 'x' && termoAtual !== 'x^') {
                coeficiente = parseInt(termoAtual);
                expoente = 0;
                termos.push({ coeficiente, expoente });
            }
        }
        termoAtual = caractere;
        } else {
            termoAtual += caractere;
        }
    }

    return termos;
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
        let {coeficiente, expoente} = funcoes[i];
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
            if(expoente == 0)
                resultado += `${coeficiente}`;
            else if(expoente == 1)
                resultado += `${coeficiente}x`;
            else
                resultado += `${coeficiente}x^${expoente}`;
            
            if (i < derivadaFuncoes.length - 1 && derivadaFuncoes[i + 1][0] > 0) {
                resultado += "+";
            }
        }
    }
    
    console.log(resultado);
}

funcao = prompt("Digite a função (ex: 3x^2 - 2x + 1): ");

funcoes = Funcoes(funcao);

console.log("\nFunção original:", funcao);
/*for(let i = 0; i < funcoes.length; i++) {
    const {coeficiente, expoente} = funcoes[i];
    console.log(`${coeficiente}x^${expoente}`);
}*/

let derivadaFuncoes = calcularDerivada(funcoes);

exibirResultado(derivadaFuncoes);

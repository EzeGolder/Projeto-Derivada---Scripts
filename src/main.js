let prompt = require("prompt-sync")();


//Funnção que vai converter fração para número com virgula
function parseFracao(fraction) {
    if (fraction.includes('/')) {
        const [numerador, denominador] = fraction.split('/').map(Number);
        return numerador / denominador;
    }
    return parseFloat(fraction);
}

function Funcoes(funcao) {
    let termos = [];
    let termoAtual = '';
    let coeficiente = 0;
    let expoente = 0;

    funcao = funcao.replace(/\s+/g, '');
    funcao = funcao.replace(/,/g, '.');

    if (funcao[0] !== '-' && funcao[0] !== '+') {
        funcao = '+' + funcao;
    }

    for (let i = 0; i < funcao.length; i++) {
        const caractere = funcao[i];

        if (caractere === 'x') {
            if (termoAtual === '' || termoAtual === '+' || termoAtual === '-') {
                coeficiente = termoAtual === '-' ? -1 : 1;
            } else {
                coeficiente = parseFracao(termoAtual);
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
                coeficiente = parseFracao(termoAtual);
                expoente = 0;
                termos.push({ coeficiente, expoente });
            }
            termoAtual = caractere;
        } else {
            termoAtual += caractere;
        }
    }
    if (termoAtual !== '') {
        coeficiente = parseFracao(termoAtual);
        expoente = 0;
        termos.push({ coeficiente, expoente });
    }

    return termos;
}

function derivada(coeficiente, expoente) {
    if (expoente === 0) {
        return [0, 0];
    }

    let novoCoeficiente = coeficiente * expoente;
    let novoExpoente = expoente - 1;

    return [novoCoeficiente, novoExpoente];
}

function calcularDerivada(funcoes) {
    let derivadaFuncoes = [];

    for (let i = 0; i < funcoes.length; i++) {
        let { coeficiente, expoente } = funcoes[i];
        let derivadaTermo = derivada(coeficiente, expoente);
        derivadaFuncoes.push(derivadaTermo);
    }

    return derivadaFuncoes;
}

function exibirResultado(derivadaFuncoes) {
    let resultado = "Derivada: ";
    let primeira = true;

    for (let i = 0; i < derivadaFuncoes.length; i++) {
        let [coeficiente, expoente] = derivadaFuncoes[i];

        if (coeficiente !== 0) {
            let sinal = coeficiente > 0 ? (primeira ? '' : ' + ') : ' - ';
            let valorAbsoluto = Math.abs(coeficiente);

            if (expoente === 0)
                resultado += `${sinal}${valorAbsoluto}`;
            else if (expoente === 1)
                resultado += `${sinal}${valorAbsoluto}x`;
            else
                resultado += `${sinal}${valorAbsoluto}x^${expoente}`;

            primeira = false;
        }
    }

    if (resultado === "Derivada: ") {
        resultado += "0";
    }

    console.log(resultado);
}

//execuçao do programa
let funcao = prompt("Digite a função (ex: 3x^2 - 2x + 1): ");

let funcoes = Funcoes(funcao);

console.log("\nFunção original:", funcao);

let derivadaFuncoes = calcularDerivada(funcoes);

exibirResultado(derivadaFuncoes);

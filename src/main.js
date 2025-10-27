let prompt = require("prompt-sync")();
let primeira_derivada;
let segunda_derivada;

//Função que vai converter fração para número com virgula
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

    if (funcao[0] != '-' && funcao[0] != '+') {
        funcao = '+' + funcao;
    }

    for (let i = 0; i < funcao.length; i++) {
        const caractere = funcao[i];

        if (caractere == 'x') {
            if (termoAtual == '' || termoAtual == '+' || termoAtual == '-') {
                coeficiente = termoAtual == '-' ? -1 : 1;
            } else {
                coeficiente = parseFracao(termoAtual);
            }

            if (funcao[i + 1] == '^') {
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
        } else if (caractere == '+' || caractere == '-') {
            if (termoAtual != '') {
                coeficiente = parseFracao(termoAtual);
                expoente = 0;
                termos.push({ coeficiente, expoente });
            }
            termoAtual = caractere;
        } else {
            termoAtual += caractere;
        }
    }
    if (termoAtual != '') {
        coeficiente = parseFracao(termoAtual);
        expoente = 0;
        termos.push({ coeficiente, expoente });
    }

    return termos;
}

function derivadaTombo(coeficiente, expoente) {
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
        let { coeficiente, expoente } = funcoes[i];
        let derivadaTermo = derivadaTombo(coeficiente, expoente);
        derivadaFuncoes.push(derivadaTermo);
    }

    return derivadaFuncoes;
}

function exibirResultado(derivadaFuncoes) {
    let resultado = "";
    let primeira = true;

    for (let i = 0; i < derivadaFuncoes.length; i++) {
        let [coeficiente, expoente] = derivadaFuncoes[i];

        if (coeficiente != 0) {
            let sinal = coeficiente > 0 ? (primeira ? '' : ' + ') : ' - ';
            let valorAbsoluto = Math.abs(coeficiente);


            //isso aqui é pra arredondar, não é a melhor coisa do mundo, mas achei necessário
            valorAbsoluto = parseFloat(valorAbsoluto.toFixed(2));
            
            if (expoente == 0)
                resultado += `${sinal}${valorAbsoluto}`;
            else if (expoente == 1)
                resultado += `${sinal}${valorAbsoluto}x`;
            else
                resultado += `${sinal}${valorAbsoluto}x^${expoente}`;

            primeira = false;
        }
    }


    if (resultado == "Derivada: ") {
        resultado += "0";
    }
    
    if(resultado == 0){
        return 0;
    }

    console.log(resultado);

    return resultado;
}

function inserir_exibir(funcao, grau){
    let funcoes = Funcoes(funcao);

    let derivadaFuncoes = calcularDerivada(funcoes);

    console.log(`Derivada de ${grau} grau`)

    return exibirResultado(derivadaFuncoes);

}

function calcularX(Derivada, x){
    let resultado = 0;

    let  termoDerivada = Funcoes(Derivada);

    for(let i = 0; i < termoDerivada.length; i++){
        let {coeficiente, expoente} = termoDerivada[i];
        //console.log(termoDerivada[i]);
        resultado += coeficiente * Math.pow(x, expoente);
    }

    //console.log(resultado)
    return resultado;
}

function pontoCritico(Derivada){
    let maxIntervalo = 100;
    let minIntervalo = -100;
    let limite = 0.0001;
    let valorX = (maxIntervalo + minIntervalo) / 2;
    let valorDerivada = calcularX(Derivada, valorX);

    while(Math.abs(valorDerivada) > limite){
        if(Math.abs(valorDerivada) < limite){
            return valorX;
        }

        if(valorDerivada > 0){
            maxIntervalo = valorX;
        } else {
            minIntervalo = valorX;
        }
        
        valorX = (maxIntervalo + minIntervalo) / 2;
        valorDerivada = calcularX(Derivada, valorX);
    }

    return valorX;
}

//execuçao do programa
let funcao = prompt("Digite a função (ex: 3x^2 - 2x + 1): ");

console.log("\nFunção original:", funcao);

primeira_derivada = inserir_exibir(funcao, "primeiro");
segunda_derivada = inserir_exibir(primeira_derivada, "segundo")

let xZero = pontoCritico(primeira_derivada);

console.log("\nPonto crítico:", xZero);
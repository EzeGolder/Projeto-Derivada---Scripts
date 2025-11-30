/*
### **Grupo 2 — 
## Integrantes: Bruno Enrique Medeiros Costa, Ezequiel da Silva, Miguel Rocha de Araujo, Rogério, Samuel de Macedo Ferrari**

*/

let prompt = require("prompt-sync")();

//Funções derivadas
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

//Transforma funções em forma de strings em um array de coeficientes e expoentes
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

//Retorno de uma função (derivada) em forma de string
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


    if (resultado == "") {
        resultado += "0";
    }
    
    console.log(resultado);

    return resultado;
}

//Função que controla as saídas das derivadas
function inserir_exibir(funcao, grau){
    let funcoes = Funcoes(funcao);

    let derivadaFuncoes = calcularDerivada(funcoes);

    console.log(`Derivada de ${grau} grau`)

    return exibirResultado(derivadaFuncoes);

}

//Calcular o Y de uma função com base no X
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


//Descobrir ponto crítico
function pontoCritico(Derivada, minIntervalo = -100, maxIntervalo = 100) {

    console.log(`\nIntervalo escolhido para análise: [${minIntervalo}, ${maxIntervalo}]`);

    let termosDerivada = Funcoes(Derivada);
    if (termosDerivada.length === 1 && termosDerivada[0].expoente === 0) {
        return null;
    }

    let maxIteracoes = 10000;
    let limite = 0.0001;
    let iteracao = 0;
    let valorX = (maxIntervalo + minIntervalo) / 2;

    let fmin = calcularX(Derivada, minIntervalo);
    let fmax = calcularX(Derivada, maxIntervalo);

    if (fmin * fmax > 0) {
        console.log("A derivada não cruza o eixo x neste intervalo. Tente outro intervalo.");
        return null;
    }

    let valorDerivada = calcularX(Derivada, valorX);

    while (Math.abs(valorDerivada) > limite && iteracao < maxIteracoes) {

        if (valorDerivada > 0) {
            maxIntervalo = valorX;
        } else {
            minIntervalo = valorX;
        }

        valorX = (maxIntervalo + minIntervalo) / 2;
        valorDerivada = calcularX(Derivada, valorX);
        iteracao++;
    }

    if (iteracao >= maxIteracoes) {
        console.log("Limite de iterações alcançado.");
        return null;
    }

    return valorX;
}


function minOuMax(derivada2, x){
    if(derivada2 == ""){
        return "Não existe ponto crítico"
    }

    y = calcularX(derivada2, x)
    if(y < 0){
        return "Máximo"
    }else if(y>0){
        return "Mínimo"
    }else{
        return "Nulo"
    }
}



//      FUNÇÕES DE INTEGRAIS


// Integra o termo oposto ao tombo
function integralSubida(coeficiente, expoente) {
    let novoExpoente = expoente + 1;

    // coeficiente / novoExpoente
    let novoCoeficiente = coeficiente / novoExpoente;

    return [novoCoeficiente, novoExpoente];
}

// Calcula integral de todos os termos
function calcularIntegral(funcoes) {
    let integralFuncoes = [];

    for (let i = 0; i < funcoes.length; i++) {
        let { coeficiente, expoente } = funcoes[i];

        // constante vira coef * x
        if (expoente === 0) {
            integralFuncoes.push([coeficiente, 1]);
        } else {
            integralFuncoes.push(integralSubida(coeficiente, expoente));
        }
    }

    return integralFuncoes;
}

// Exibir integral em formato de string (+ C)
function exibirIntegral(integralFuncoes) {
    let resultado = "";
    let primeira = true;

    for (let i = 0; i < integralFuncoes.length; i++) {
        let [coeficiente, expoente] = integralFuncoes[i];

        if (coeficiente != 0) {
            let sinal = coeficiente > 0 ? (primeira ? '' : ' + ') : ' - ';
            let valorAbsoluto = Math.abs(coeficiente);

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

    if (resultado == "") {
        resultado = "0";
    }

    resultado += " + C";

    console.log(resultado);
    return resultado;
}

// Controlador da integral
function inserir_integral(funcao) {
    let funcoes = Funcoes(funcao);
    let integralFuncoes = calcularIntegral(funcoes);

    console.log("\nIntegral indefinida:");
    return exibirIntegral(integralFuncoes);
}


//Execução do programa

console.log("===== MENU =====");
console.log("1 - Calcular derivadas");
console.log("2 - Calcular integrais");
console.log("================");


//Inserção de escolha
let escolha = prompt("Escolha uma opção: ");

if (escolha == "1") {

    //Inserção de função base
    let funcao = prompt("Digite a função (ex: 3x^2 - 2x + 1): ");

    console.log("\nFunção original:", funcao);

    // 1ª derivada
    primeira_derivada = inserir_exibir(funcao, "primeiro");

    // 2ª derivada
    segunda_derivada = inserir_exibir(primeira_derivada, "segundo");

    // Escolha do intervalo
    console.log("\nDeseja inserir um intervalo personalizado para o cálculo do ponto crítico?");
    console.log("1 - Sim");
    console.log("2 - Não (usar intervalo padrão [-100, 100])");

    let escolhaIntervalo = prompt("Escolha: ");

    let minIntervalo, maxIntervalo;

    if (escolhaIntervalo == "1") {
        minIntervalo = parseFloat(prompt("Digite o limite inferior do intervalo: "));
        maxIntervalo = parseFloat(prompt("Digite o limite superior do intervalo: "));
        console.log(`\nIntervalo definido pelo usuário: [${minIntervalo}, ${maxIntervalo}]`);
    } else {
        minIntervalo = -100;
        maxIntervalo = 100;
        console.log("\nIntervalo padrão utilizado: [-100, 100]");
    }

    // Cálculo do ponto crítico
    let xZero = pontoCritico(primeira_derivada, minIntervalo, maxIntervalo);

    if (xZero == null) {
        console.log("Ponto crítico inexistente ou fora do intervalo.");
    } else {
        let yZero = calcularX(funcao, xZero);
        let tipo_ponto = minOuMax(segunda_derivada, xZero);

        console.log(`Ponto ${tipo_ponto}: (${xZero.toFixed(4)}, ${yZero.toFixed(4)})`);
    }

}
 else if (escolha == "2") {

    // INTEGRAIS 

    //Inserção de função base
    let funcao = prompt("Digite a função para integrar (ex: 3x^2 - 2x + 1): ");

    console.log("\nFunção original:", funcao);

    inserir_integral(funcao);

} else {
    console.log("Opção inválida.");
}
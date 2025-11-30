//  CALCULADORA DE DERIVADAS E INTEGRAIS - CONSOLE
//  Node.js — Grupo 2
//
//  Este programa implementa:
//  Parser de funções algébricas (polinômios com frações)
//  Derivada simbólica (1ª e 2ª ordem)
//  Busca de pontos críticos por varredura + bisseção
//  Classificação de máximo/mínimo via 2ª derivada
//  Integral simbólica
//  Integral numérica (Regra dos Trapézios)
//  Interface interativa em console

const prompt = require("prompt-sync")({ sigint: true });



//  FUNÇÕES BÁSICAS PARA TRATAR A FUNÇÃO DO USUÁRIO


// Converte frações do tipo "1/3" em números reais
// Se não houver "/", apenas converte para float
function parseFracao(f) {
    if (f.includes("/")) {
        const [n, d] = f.split("/").map(Number);
        return n / d;
    }
    return parseFloat(f);
}


// Decompõe uma função como "3x^2 - 2x + 1"
// e devolve uma lista de monômios no formato:
// [{ coeficiente: 3, expoente: 2 }, { coeficiente: -2, expoente: 1 }, { coeficiente: 1, expoente: 0 }]
//
// Este é o "parser" do programa.
function Funcoes(funcao) {

    // Normalizar string
    funcao = funcao.toLowerCase().replace(/\s+/g, "");

    // Caso o polinômio não comece com + ou -, adiciona "+"
    if (funcao[0] !== "+" && funcao[0] !== "-")
        funcao = "+" + funcao;

    let termos = [];
    let termoAtual = "";

    // Loop para identificar coeficientes e expoentes
    for (let i = 0; i < funcao.length; i++) {
        let c = funcao[i];

        // Achou um "x" → fim de um termo com variável
        if (c === "x") {
            let coef;

            // Determinar coeficiente
            if (termoAtual === "" || termoAtual === "+" || termoAtual === "-")
                coef = termoAtual === "-" ? -1 : 1;
            else
                coef = parseFracao(termoAtual);

            let expo = 1;

            // Procurar por expoente "^n"
            if (funcao[i + 1] === "^") {
                let j = i + 2;
                while (!isNaN(funcao[j])) j++;
                expo = parseInt(funcao.slice(i + 2, j));
                i = j - 1;
            }

            termos.push({ coeficiente: coef, expoente: expo });
            termoAtual = "";
        }

        // Novo termo inicia → salva termo anterior (que é constante)
        else if (c === "+" || c === "-") {
            if (termoAtual !== "") {
                termos.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });
            }
            termoAtual = c;
        }

        // Número / fração sendo lida
        else {
            termoAtual += c;
        }
    }

    // Último termo (constante)
    if (termoAtual !== "") {
        termos.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });
    }

    return termos;
}



//   DERIVADAS (Regra do Tombo)


// Aplica a regra do tombo em um monômio c*x^e → (c*e) * x^(e-1)
function derivadaTombo(c, e) {
    if (e === 0) return [0, 0]; // derivada de constante
    return [c * e, e - 1];
}

// Recebe vetor de monômios e devolve o vetor da derivada
function calcularDerivada(termos) {
    return termos.map(t => derivadaTombo(t.coeficiente, t.expoente));
}

// Converte vetor de monômios em string legível
function exibirResultado(derivada) {
    let r = "";
    for (let [c, e] of derivada) {
        if (c !== 0) {
            let sinal = c > 0 && r !== "" ? "+" : "";
            let abs = Math.abs(c).toFixed(2);

            if (e === 0) r += `${sinal}${abs}`;
            else if (e === 1) r += `${sinal}${abs}x`;
            else r += `${sinal}${abs}x^${e}`;
        }
    }
    return r || "0";
}



//   AVALIAÇÃO DA FUNÇÃO — calcula f(x)


// Substitui x na função e calcula o valor
function calcularX(funcaoStr, x) {
    let termos = Funcoes(funcaoStr);
    return termos.reduce(
        (acc, t) => acc + t.coeficiente * Math.pow(x, t.expoente),
        0
    );
}



//   PONTOS CRÍTICOS (busca numérica)
//   1. Scan detecta mudança de sinal
//   2. Bisseção encontra raiz da derivada


function pontoCritico(derivadaStr, min = -100, max = 100) {
    let passos = 2000;
    let delta = (max - min) / passos;

    let anterior = calcularX(derivadaStr, min);
    let candidatos = [];

    // 1) Varredura para detectar troca de sinal
    for (let i = 1; i <= passos; i++) {
        let x = min + i * delta;
        let atual = calcularX(derivadaStr, x);

        if (anterior * atual < 0)
            candidatos.push([x - delta, x]);

        if (Math.abs(atual) < 0.0005)
            candidatos.push([x - delta, x + delta]);

        anterior = atual;
    }

    // 2) Bisseção em cada janela candidata
    let limite = 0.0001;

    for (let [a, b] of candidatos) {
        for (let i = 0; i < 200; i++) {
            let m = (a + b) / 2;
            let fm = calcularX(derivadaStr, m);

            if (Math.abs(fm) < limite) return m;

            let fa = calcularX(derivadaStr, a);
            if (fa * fm < 0) b = m;
            else a = m;
        }
    }

    return null;
}


// Classifica o ponto crítico usando a segunda derivada
function minOuMax(derivada2Str, x) {
    let d2 = calcularX(derivada2Str, x);
    if (d2 < 0) return "Máximo local";
    if (d2 > 0) return "Mínimo local";
    return "Ponto de inflexão";
}



//   INTEGRAL SIMBÓLICA


// Reverte a regra do tombo: integra c*x^e → c/(e+1) * x^(e+1)
function integralSubida(c, e) {
    return [c / (e + 1), e + 1];
}

// Aplica a regra para todos os monômios
function calcularIntegral(termos) {
    return termos.map(t =>
        t.expoente === 0 ? [t.coeficiente, 1] : integralSubida(t.coeficiente, t.expoente)
    );
}

// Converte vetor de monômios integrados em string
function exibirIntegral(intFun) {
    let r = "";
    for (let [c, e] of intFun) {
        let s = c > 0 && r !== "" ? "+" : "";
        let k = Math.abs(c).toFixed(2);
        if (e === 1) r += `${s}${k}x`;
        else r += `${s}${k}x^${e}`;
    }
    return r + "+C";
}



//   INTEGRAÇÃO NUMÉRICA — Regra dos Trapézios

//
// Fórmula:
//     ∫ f(x) dx ≈ (h/2) * [ f(a) + 2*(f(a+h) + f(a+2h) + ... + f(b-h)) + f(b) ]
//
// É um método de Newton–Cotes fechado de 1º grau.

function trapezios(funcaoStr, a, b, n = 2000) {
    let h = (b - a) / n;
    let soma = 0;

    // Soma dos pontos internos
    for (let i = 1; i < n; i++) {
        soma += calcularX(funcaoStr, a + i * h);
    }

    // Fórmula final
    return (h / 2) * (
        calcularX(funcaoStr, a) +
        2 * soma +
        calcularX(funcaoStr, b)
    );
}



//   INTERFACE DE CONSOLE — fluxo principal do programa


console.log("=== CALCULADORA DE DERIVADAS E INTEGRAIS (Console) ===");

let funcao = prompt("Digite a função f(x): ");

console.log("\nEscolha a operação:");
console.log("1 - Primeira e segunda derivada + ponto crítico");
console.log("2 - Integral indefinida (simbólica)");
console.log("3 - Integral numérica (regra dos trapézios)");

let op = prompt("Opção: ");



//  OPÇÃO 1 — DERIVADAS E PONTO CRÍTICO

if (op === "1") {
    let termos = Funcoes(funcao);

    let d1 = exibirResultado(calcularDerivada(termos));
    let d1limpo = d1.replace(/\s+/g, "");
    let d2 = exibirResultado(calcularDerivada(Funcoes(d1limpo)));

    console.log("\n1ª Derivada:", d1);
    console.log("2ª Derivada:", d2);

    let xc = pontoCritico(d1limpo, -100, 100);

    if (xc === null) {
        console.log("Nenhum ponto crítico encontrado.");
    } else {
        let yc = calcularX(funcao, xc);
        console.log(`\nPonto crítico encontrado: x = ${xc.toFixed(4)}, y = ${yc.toFixed(4)}`);
        console.log("Tipo:", minOuMax(d2, xc));
    }
}



//  OPÇÃO 2 — INTEGRAL SIMBÓLICA

else if (op === "2") {
    let termos = Funcoes(funcao);
    console.log("\nIntegral:", exibirIntegral(calcularIntegral(termos)));
}



//  OPÇÃO 3 — INTEGRAL NUMÉRICA

else if (op === "3") {
    let a = parseFloat(prompt("Intervalo mínimo: "));
    let b = parseFloat(prompt("Intervalo máximo: "));

    let area = trapezios(funcao, a, b, 4000);

    console.log(`\nIntegral numérica ≈ ${area}`);
}


else {
    console.log("Opção inválida.");
}

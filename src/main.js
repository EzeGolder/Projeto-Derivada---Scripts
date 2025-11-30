
//  CALCULADORA DE DERIVADAS E INTEGRAIS - CONSOLE
//  Node.js — Grupo 2


const prompt = require("prompt-sync")({ sigint: true });


// Funções matemáticas básicas


// Converte frações (ex.: "1/3") para número
function parseFracao(f) {
    if (f.includes("/")) {
        const [n, d] = f.split("/").map(Number);
        return n / d;
    }
    return parseFloat(f);
}

// Decompõe função em monômios: retorna [{coeficiente, expoente}]
function Funcoes(funcao) {
    funcao = funcao.toLowerCase().replace(/\s+/g, "");

    if (funcao[0] !== "+" && funcao[0] !== "-") funcao = "+" + funcao;

    let termos = [];
    let termoAtual = "";

    for (let i = 0; i < funcao.length; i++) {
        let c = funcao[i];

        if (c === "x") {
            let coef;

            if (termoAtual === "" || termoAtual === "+" || termoAtual === "-")
                coef = termoAtual === "-" ? -1 : 1;
            else
                coef = parseFracao(termoAtual);

            let expo = 1;

            if (funcao[i + 1] === "^") {
                let j = i + 2;
                while (!isNaN(funcao[j])) j++;
                expo = parseInt(funcao.slice(i + 2, j));
                i = j - 1;
            }

            termos.push({ coeficiente: coef, expoente: expo });
            termoAtual = "";
        }
        else if (c === "+" || c === "-") {
            if (termoAtual !== "") {
                termos.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });
            }
            termoAtual = c;
        }
        else {
            termoAtual += c;
        }
    }

    if (termoAtual !== "") {
        termos.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });
    }

    return termos;
}


// Derivadas


function derivadaTombo(c, e) {
    if (e === 0) return [0, 0];
    return [c * e, e - 1];
}

function calcularDerivada(termos) {
    return termos.map(t => derivadaTombo(t.coeficiente, t.expoente));
}

function exibirResultado(derivada) {
    let r = "";
    for (let [c, e] of derivada) {
        if (c !== 0) {
            let s = c > 0 && r !== "" ? "+" : "";
            let k = Math.abs(c).toFixed(2);

            if (e === 0) r += `${s}${k}`;
            else if (e === 1) r += `${s}${k}x`;
            else r += `${s}${k}x^${e}`;
        }
    }
    return r || "0";
}


// Avaliação de função


function calcularX(funcaoStr, x) {
    let termos = Funcoes(funcaoStr);
    return termos.reduce((acc, t) => acc + t.coeficiente * Math.pow(x, t.expoente), 0);
}


// Pontos críticos (scan + bisseção)


function pontoCritico(derivadaStr, min = -100, max = 100) {
    let passos = 2000;
    let delta = (max - min) / passos;
    let anterior = calcularX(derivadaStr, min);
    let candidatos = [];

    for (let i = 1; i <= passos; i++) {
        let x = min + i * delta;
        let atual = calcularX(derivadaStr, x);

        if (anterior * atual < 0) {
            candidatos.push([x - delta, x]);
        }

        if (Math.abs(atual) < 0.0005) {
            candidatos.push([x - delta, x + delta]);
        }

        anterior = atual;
    }

    let limite = 0.0001;

    for (let [a, b] of candidatos) {
        let fa, fb;
        for (let i = 0; i < 200; i++) {
            let m = (a + b) / 2;
            let fm = calcularX(derivadaStr, m);

            if (Math.abs(fm) < limite) return m;

            fa = calcularX(derivadaStr, a);

            if (fa * fm < 0) b = m;
            else a = m;
        }
    }

    return null;
}

function minOuMax(derivada2Str, x) {
    let d2 = calcularX(derivada2Str, x);
    if (d2 < 0) return "Máximo";
    if (d2 > 0) return "Mínimo";
    return "Ponto de inflexão / nulo";
}


// Integração simbólica


function integralSubida(c, e) {
    return [c / (e + 1), e + 1];
}

function calcularIntegral(termos) {
    return termos.map(t => {
        if (t.expoente === 0) return [t.coeficiente, 1];
        return integralSubida(t.coeficiente, t.expoente);
    });
}

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


// Regra dos Trapézios


function trapezios(funcaoStr, a, b, n = 2000) {
    let h = (b - a) / n;
    let soma = 0;

    for (let i = 1; i < n; i++) {
        soma += calcularX(funcaoStr, a + i * h);
    }

    return (h / 2) * (calcularX(funcaoStr, a) + 2 * soma + calcularX(funcaoStr, b));
}


// Interface Console


console.log("=== CALCULADORA DE DERIVADAS E INTEGRAIS (Console) ===");

let funcao = prompt("Digite a função f(x): ");
console.log("\nEscolha a operação:");
console.log("1 - Primeira e segunda derivada + ponto crítico");
console.log("2 - Integral indefinida");
console.log("3 - Integral numérica (regra dos trapézios)");

let op = prompt("Opção: ");

if (op === "1") {
    let termos = Funcoes(funcao);
    let d1 = exibirResultado(calcularDerivada(termos));
    let d1limpo = d1.replace(/\s+/g, '');
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

else if (op === "2") {
    let termos = Funcoes(funcao);
    console.log("\nIntegral:", exibirIntegral(calcularIntegral(termos)));
}

else if (op === "3") {
    let a = parseFloat(prompt("Intervalo mínimo: "));
    let b = parseFloat(prompt("Intervalo máximo: "));

    let area = trapezios(funcao, a, b, 4000);

    console.log(`\nIntegral numérica ≈ ${area}`);
}

else {
    console.log("Opção inválida.");
}

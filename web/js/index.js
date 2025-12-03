/*
### GRUPO 2 — PROJETO DE CALCULADORA DERIVADAS/INTEGRAIS (Web)
Integrantes:
- Bruno Enrique Medeiros Costa
- Ezequiel da Silva
- Miguel Rocha de Araujo
- Rogério
- Samuel de Macedo Ferrari

Este arquivo contém **TODO o JavaScript responsável pela interface funcional da calculadora Web**.
Ele faz:
manipulação da página (DOM)
interpretação de funções matemáticas dadas pelo usuário
cálculo de derivadas
cálculo de integrais simbólicas
cálculo de integrais numéricas (regra dos trapézios)
identificação de pontos críticos (máx/min)

Cada bloco é explicado abaixo.
*/


/* =
    CONTROLE DA INTERFACE (DOM)
  
   Esta parte serve apenas para controlar quais campos aparecem
   na tela. Não envolve matemática — apenas UX.
*/

// Exibe ou oculta inputs de intervalo quando o usuário mudar o modo
document.querySelectorAll("input[name='intervaloModo']").forEach(radio => {
    radio.addEventListener("change", () => {
        let modo = document.querySelector("input[name='intervaloModo']:checked").value;

        // Só mostra inputs se o usuário deseja intervalo customizado
        document.getElementById("intervalos").style.display =
            (modo === "custom") ? "flex" : "none";
    });
});

// Mostra ou esconde os campos de intervalo dependendo da operação
function atualizarVisibilidadeIntervalo() {
    let operacao = document.querySelector("input[name='operacao']:checked").value;

    if (operacao === "derivada" || operacao === "trapz") {
        // Derivada e integral numérica PRECISAM de intervalo
        document.getElementById("intervalo-opcao").style.display = "flex";

        let modo = document.querySelector("input[name='intervaloModo']:checked").value;
        document.getElementById("intervalos").style.display =
            modo === "custom" ? "flex" : "none";

    } else {
        // Integral simbólica não usa intervalos
        document.getElementById("intervalo-opcao").style.display = "none";
        document.getElementById("intervalos").style.display = "none";
    }
}

// Atualiza sempre que o usuário trocar opção
document.querySelectorAll("input[name='operacao']").forEach(radio => {
    radio.addEventListener("change", atualizarVisibilidadeIntervalo);
});
document.querySelectorAll("input[name='intervaloModo']").forEach(radio => {
    radio.addEventListener("change", atualizarVisibilidadeIntervalo);
});

// Chamada inicial
atualizarVisibilidadeIntervalo();



/* 
    INTERPRETAÇÃO DE FUNÇÕES
  
   As próximas funções transformam strings como:
       "3x^2 - 4x + 1/2"
   em uma estrutura fácil de manipular:

   [
     { coeficiente: 3 , expoente: 2 },
     { coeficiente: -4, expoente: 1 },
     { coeficiente: 0.5, expoente: 0 }
   ]

   Isso é essencial para derivar, integrar ou avaliar.
*/

// Converte frações escritas como "1/3" para números reais
function parseFracao(fraction) {
    if (fraction.includes('/')) {
        const [n, d] = fraction.split('/').map(Number);
        return n / d;
    }
    return parseFloat(fraction);
}


// Converte string → array de monômios
function Funcoes(funcao) {
    funcao = funcao.toLowerCase().replace(/\s+/g, '');

    // Garante que toda função começa com sinal
    if (funcao[0] !== '+' && funcao[0] !== '-')
        funcao = '+' + funcao;

    let termos = [];
    let termoAtual = "";

    for (let i = 0; i < funcao.length; i++) {
        let c = funcao[i];

        // Termos contendo "x"
        if (c === 'x') {
            let coef;

            // Casos como "+x" ou "-x"
            if (termoAtual === '' || termoAtual === '+' || termoAtual === '-')
                coef = termoAtual === '-' ? -1 : 1;
            else
                coef = parseFracao(termoAtual);

            // Expoente
            let expo = 1;
            if (funcao[i + 1] === '^') {
                let j = i + 2;
                while (!isNaN(funcao[j])) j++;
                expo = parseInt(funcao.slice(i + 2, j));
                i = j - 1;
            }

            termos.push({ coeficiente: coef, expoente: expo });
            termoAtual = "";
        }

        // Novo termo (+ ou -)
        else if (c === '+' || c === '-') {
            if (termoAtual !== "")
                termos.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });

            termoAtual = c;
        }

        // Números / frações
        else if (!isNaN(c) || c === '.' || c === '/')
            termoAtual += c;
    }

    // Último termo
    if (termoAtual !== "")
        termos.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });

    return termos;
}



/*
    DERIVADAS
   */

// Derivada de um monômio c·x^e → (c·e)·x^(e-1)
function derivadaTombo(c, e) {
    if (e === 0) return [0, 0];
    return [c * e, e - 1];
}

// Deriva todos os monômios da função
function calcularDerivada(funcoes) {
    return funcoes.map(t => derivadaTombo(t.coeficiente, t.expoente));
}

// Converte monômios → string novamente
function exibirResultado(derivadaFuncoes) {
    let r = "";
    let primeira = true;

    for (let [c, e] of derivadaFuncoes) {
        if (c !== 0) {
            let sinal = c > 0 ? (primeira ? "" : "+") : "-";
            let abs = Math.abs(c).toFixed(2);

            if (e === 0) r += `${sinal}${abs}`;
            else if (e === 1) r += `${sinal}${abs}x`;
            else r += `${sinal}${abs}x^${e}`;

            primeira = false;
        }
    }
    return r || "0";
}



/* 
    AVALIAÇÃO DE FUNÇÃO f(x)
    */

// Calcula o valor da função para um x específico (usado em trapézios e ponto crítico)
function calcularX(funcao, x) {
    let termos = Funcoes(funcao);
    return termos.reduce((s, t) => s + t.coeficiente * Math.pow(x, t.expoente), 0);
}



/* 
    PONTO CRÍTICO (Máximos / Mínimos)
   
   A técnica funciona assim:

   1. Escaneia o intervalo todo em busca de mudança de sinal na derivada
   2. Quando acha possível ponto crítico → refina com método da bisseção
   3. Volta x onde f'(x) = 0
*/

function pontosCriticos(derivadaStr, min = -100, max = 100) {
    const N = 5000;         // precisão do scan
    const EPS = 1e-6;       // tolerância para quase-zero
    const delta = (max - min) / N;

    const f = x => calcularX(derivadaStr, x);

    let candidatos = [];
    let xPrev = min;
    let fPrev = f(xPrev);

    // 1) VARREDURA PROCURANDO MUDANÇA DE SINAL OU QUASE-ZERO
    for (let i = 1; i <= N; i++) {
        let x = min + i * delta;
        let fx = f(x);

        // mudança de sinal
        if (fPrev * fx < 0) {
            candidatos.push([x - delta, x]);
        }

        // quase zero
        if (Math.abs(fx) < EPS) {
            candidatos.push([x - delta, x + delta]);
        }

        xPrev = x;
        fPrev = fx;
    }

    // se não achar nada
    if (candidatos.length === 0) return [];

    // 2) FUNÇÃO AUXILIAR DE BISSEÇÃO
    function bissection(a, b) {
        let fa = f(a);
        let fb = f(b);

        for (let i = 0; i < 100; i++) {
            let m = (a + b) / 2;
            let fm = f(m);

            if (Math.abs(fm) < 1e-9) return m;

            if (fa * fm < 0) {
                b = m;
                fb = fm;
            } else {
                a = m;
                fa = fm;
            }
        }
        return (a + b) / 2;
    }

    // 3) REFINA CADA INTERVALO → raiz real
    let roots = candidatos.map(([a, b]) => bissection(a, b));

    // 4) REMOVE DUPLICATAS (raízes repetidas)
    let finais = [];
    for (let r of roots) {
        if (!finais.some(v => Math.abs(v - r) < 1e-5)) {
            finais.push(r);
        }
    }

    return finais;
}

// Determina se é mínimo ou máximo via derivada segunda
function minOuMax(derivada2, x) {
    let d2 = calcularX(derivada2, x);
    if (d2 < 0) return "Máximo";
    if (d2 > 0) return "Mínimo";
    return "Ponto nulo / inflexão";
}



/* 
    INTEGRAIS SIMBÓLICAS
   */

// Integral de c·x^e → (c/(e+1))·x^(e+1)
function integralSubida(c, e) {
    return [c / (e + 1), e + 1];
}

// Integra cada termo individualmente
function calcularIntegral(funcoes) {
    return funcoes.map(t =>
        t.expoente === 0 ? [t.coeficiente, 1] : integralSubida(t.coeficiente, t.expoente)
    );
}

// Converte monômios → string final com “+ C”
function exibirIntegral(intFuncoes) {
    let r = "";
    let primeira = true;

    for (let [c, e] of intFuncoes) {
        if (c !== 0) {
            let sinal = c > 0 ? (primeira ? "" : "+") : "-";
            let abs = Math.abs(c).toFixed(2);

            if (e === 1) r += `${sinal}${abs}x`;
            else r += `${sinal}${abs}x^${e}`;

            primeira = false;
        }
    }
    return (r || "0") + "+C";
}



/* 
    INTEGRAL NUMÉRICA — REGRA DOS TRAPÉZIOS
   
   Fórmula:

     ∫ f(x) dx ≈ h/2 * [ f(a) + 2( f(a+h) + ... + f(b−h) ) + f(b) ]

   Quanto mais trapézios (n), mais preciso o resultado.
*/

function trapezios(funcaoStr, a, b, n = 2000) {

    a = parseFloat(a);
    b = parseFloat(b);
    n = parseInt(n);

    if (isNaN(a) || isNaN(b) || isNaN(n) || n <= 0)
        return "Erro: valores inválidos para a integral numérica.";

    let h = (b - a) / n;
    let soma = 0;

    for (let i = 1; i < n; i++) {
        let x = a + i * h;
        soma += calcularX(funcaoStr, x);
    }

    return (h / 2) * (
        calcularX(funcaoStr, a) +
        2 * soma +
        calcularX(funcaoStr, b)
    );
}



/* 
    BOTÃO "CALCULAR" — LÓGICA PRINCIPAL
   
*/
document.getElementById("calcular").addEventListener("click", () => {

    let funcao = document.getElementById("funcao").value;
    let operacao = document.querySelector("input[name='operacao']:checked").value;

    let termos = Funcoes(funcao);
    let texto = "";

    /* ----------------------------------------------------
       DERIVADAS + PONTOS CRÍTICOS (AGORA VÁRIOS)
    -----------------------------------------------------*/
    if (operacao === "derivada") {

        // 1) DERIVADA 1
        let d1array = calcularDerivada(termos);
        let d1 = exibirResultado(d1array);

        // 2) Construir string limpa da derivada
        let d1limpo = d1array
            .filter(([c,e]) => c !== 0)
            .map(([c,e]) => {
                let cs = Number(c).toString();
                if (e === 0) return `${cs}`;
                if (e === 1) return `${cs}x`;
                return `${cs}x^${e}`;
            })
            .join("+")
            .replace(/\+\-/g, "-");

        // 3) DERIVADA 2
        let d2array = calcularDerivada(Funcoes(d1limpo));
        let d2 = exibirResultado(d2array);

        // String limpa para avaliar min ou max
        let d2funcStr = d2array
            .filter(([c,e]) => c !== 0)
            .map(([c,e]) => {
                let cs = Number(c).toString();
                if (e === 0) return `${cs}`;
                if (e === 1) return `${cs}x`;
                return `${cs}x^${e}`;
            })
            .join("+")
            .replace(/\+\-/g, "-");

        // 4) Intervalo
        let intervaloModo = document.querySelector("input[name='intervaloModo']:checked").value;
        let min, max;

        if (intervaloModo === "custom") {
            min = parseFloat(document.getElementById("minIntervalo").value);
            max = parseFloat(document.getElementById("maxIntervalo").value);

            if (isNaN(min) || isNaN(max) || min >= max) {
                document.getElementById("resultado").innerText = "Erro: intervalo inválido.";
                return;
            }
        } else {
            min = -100;
            max = 100;
        }

        // 5) ACHAR TODOS OS PONTOS CRÍTICOS
        let xsCrit = pontosCriticos(d1limpo, min, max);

        texto =
            `=== DERIVADAS ===\n` +
            `f'(x) = ${d1}\n` +
            `f''(x) = ${d2}\n\n`;

        if (xsCrit.length === 0) {
            texto += `Nenhum ponto crítico encontrado no intervalo (${min}, ${max}).`;
        } 
        else {

            texto += `=== PONTOS CRÍTICOS (${xsCrit.length}) ===\n\n`;

            xsCrit.forEach(xCrit => {
                let yCrit = calcularX(funcao, xCrit);
                let tipo = minOuMax(d2funcStr, xCrit);

                texto +=
                    `x = ${xCrit.toFixed(6)}\n` +
                    `y = ${yCrit.toFixed(6)}\n` +
                    `Classificação: ${tipo}\n\n`;
            });
        }
    }

    /* ----------------------------------------------------
       INTEGRAL NUMÉRICA — TRAPÉZIOS
    -----------------------------------------------------*/
    else if (operacao === "trapz") {

        let minInput = parseFloat(document.getElementById("minIntervalo").value);
        let maxInput = parseFloat(document.getElementById("maxIntervalo").value);

        let min = !isNaN(minInput) ? minInput : -100;
        let max = !isNaN(maxInput) ? maxInput : 100;

        if (isNaN(min) || isNaN(max) || min >= max) {
            document.getElementById("resultado").innerText = "Erro: intervalo inválido.";
            return;
        }

        let area = trapezios(funcao, min, max, 4000);

        texto =
            `=== INTEGRAL NUMÉRICA — REGRA DOS TRAPÉZIOS ===\n` +
            `Função: ${funcao}\n` +
            `Intervalo: [${min}, ${max}]\n` +
            `Área aproximada = ${area.toFixed(6)}`;
    }

    /* ----------------------------------------------------
       INTEGRAL SIMBÓLICA
    -----------------------------------------------------*/
    else {
        let integral = exibirIntegral(calcularIntegral(termos));
        texto = `=== INTEGRAL INDEFINIDA ===\nF(x) = ${integral}`;
    }

    // Exibir no HTML
    document.getElementById("resultado").innerText = texto;
});

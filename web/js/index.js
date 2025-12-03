/*
### GRUPO 2 — PROJETO DE CALCULADORA DERIVADAS/INTEGRAIS (Web)
Integrantes:
- Bruno Enrique Medeiros Costa
- Ezequiel da Silva
- Miguel Rocha de Araujo
- Rogério
- Samuel de Macedo Ferrari

Este arquivo contém **TODO o JavaScript responsável pela interface funcional da calculadora Web**.
Ele implementa:
- Manipulação da Interface (DOM)
- Interpretação de Funções Polinomiais (Parser)
- Cálculo de Derivadas (Simples e Segunda)
- Identificação de Pontos Criticos (Max/Min)
- Cálculo de Integrais Simbólicas (Antiderivadas)
- Cálculo de Integrais Numéricas (Regra dos Trapezios)
*/


// =========================================================================
// CONTROLE DA INTERFACE (DOM)
// =========================================================================

/**
 * Funções de controle da Interface do Usuário (UI/UX).
 * Responsáveis por exibir ou ocultar campos de entrada (inputs) de acordo
 * com a operação selecionada (derivada, integral, trapezios).
 */

// Listener para exibir ou ocultar inputs de intervalo quando o modo mudar (Customizado/Padrao)
document.querySelectorAll("input[name='intervaloModo']").forEach(radio => {
    radio.addEventListener("change", () => {
        let modoIntervalo = document.querySelector("input[name='intervaloModo']:checked").value;

        // Só mostra inputs se o usuário deseja intervalo customizado
        document.getElementById("intervalos").style.display =
            (modoIntervalo === "custom") ? "flex" : "none";
    });
});

/**
 * Atualiza a visibilidade dos campos de entrada de intervalo (min/max)
 * com base na operacao matematica escolhida (derivada/trapz precisam).
 */
function atualizarVisibilidadeIntervalo() {
    let operacaoSelecionada = document.querySelector("input[name='operacao']:checked").value;

    // Derivada e integral numerica (trapz) precisam de intervalo para analise.
    if (operacaoSelecionada === "derivada" || operacaoSelecionada === "trapz") {
        document.getElementById("intervalo-opcao").style.display = "flex";

        let modoIntervalo = document.querySelector("input[name='intervaloModo']:checked").value;
        // Mantem os inputs visiveis se o modo for customizado
        document.getElementById("intervalos").style.display =
            modoIntervalo === "custom" ? "flex" : "none";

    } else {
        // Integral simbolica nao usa limites de intervalo
        document.getElementById("intervalo-opcao").style.display = "none";
        document.getElementById("intervalos").style.display = "none";
    }
}

// Associa a funcao de visibilidade aos eventos de troca de radio button
document.querySelectorAll("input[name='operacao']").forEach(radio => {
    radio.addEventListener("change", atualizarVisibilidadeIntervalo);
});
document.querySelectorAll("input[name='intervaloModo']").forEach(radio => {
    radio.addEventListener("change", atualizarVisibilidadeIntervalo);
});

// Chamada inicial para configurar a interface ao carregar a pagina
atualizarVisibilidadeIntervalo();


// =========================================================================
// INTERPRETACAO E PARSING DE FUNCOES
// =========================================================================

/**
 * As funcoes a seguir transformam a string de entrada do usuario
 * (ex: "3x^2 - 4x + 1/2") em uma estrutura de dados de monomios:
 * [ { coeficiente: 3 , expoente: 2 }, ... ]
 * Isso e a base para todos os calculos.
 */

/**
 * Converte strings que representam fracoes (ex: "1/3") para numeros decimais.
 * @param {string} fracao - A string que pode conter uma fracao ou um numero.
 * @returns {number} O valor numerico da fracao.
 */
function parseFracao(fracao) {
    if (fracao.includes('/')) {
        const [numerador, denominador] = fracao.split('/').map(Number);
        // Retorna o resultado da divisao.
        return numerador / denominador;
    }
    // Retorna o numero como float se nao for fracao.
    return parseFloat(fracao);
}


/**
 * Transforma a string de entrada da funcao em um array de monomios.
 * Ex: "3x^2 - 4x + 1/2" -> [ {coef: 3, exp: 2}, {coef: -4, exp: 1}, {coef: 0.5, exp: 0} ]
 * @param {string} funcaoStr - A funcao polinomial em formato string.
 * @returns {Array<object>} Um array de objetos representando cada monomio.
 */
function Funcoes(funcaoStr) {
    let funcaoLimpa = funcaoStr.toLowerCase().replace(/\s+/g, ''); // Limpa espacos e minusculas

    // Garante que a string comece com um sinal para facilitar o parse (ex: "x^2" -> "+x^2")
    if (funcaoLimpa[0] !== '+' && funcaoLimpa[0] !== '-')
        funcaoLimpa = '+' + funcaoLimpa;

    let monomios = [];
    let termoAtual = "";

    for (let i = 0; i < funcaoLimpa.length; i++) {
        let caracter = funcaoLimpa[i];

        // LOGICA PARA TERMOS COM 'x' (VARIAVEL)
        if (caracter === 'x') {
            let coeficiente;
            
            // Termo que ja incluiu o sinal (ex: "+3" ou "-1/2")
            let termoSemX = termoAtual; 
            
            // Caso especial: "+x" ou "-x" (coeficiente 1 ou -1)
            if (termoSemX === '' || termoSemX === '+' || termoSemX === '-')
                coeficiente = termoSemX === '-' ? -1 : 1;
            else
                // Caso geral: parseia o coeficiente (pode ser fracao)
                coeficiente = parseFracao(termoSemX); 

            // LOGICA PARA EXPOENTE
            let expoente = 1; // Padrao: x^1
            if (funcaoLimpa[i + 1] === '^') {
                let j = i + 2; // Comeca a ler depois do '^'
                // Le todos os digitos do expoente
                while (!isNaN(funcaoLimpa[j])) j++;
                
                // Extrai o valor do expoente
                expoente = parseInt(funcaoLimpa.slice(i + 2, j));
                i = j - 1; // Atualiza o indice principal para pular os digitos do expoente
            }

            monomios.push({ coeficiente: coeficiente, expoente: expoente });
            termoAtual = ""; // Reseta o termo para o proximo monomio
        }

        // LOGICA PARA SEPARACAO DE TERMOS (+ ou -)
        else if (caracter === '+' || caracter === '-') {
            // Se houver algo em termoAtual, e um termo constante anterior (ex: "+1/2" antes de "+x")
            if (termoAtual !== "")
                monomios.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });

            termoAtual = caracter; // Comeca o novo termo com o sinal
        }

        // LOGICA PARA NUMEROS / FRACÕES
        else if (!isNaN(caracter) || caracter === '.' || caracter === '/')
            termoAtual += caracter;
    }

    // Ultimo Termo (Se for uma constante isolada, ex: "... + 5")
    if (termoAtual !== "")
        monomios.push({ coeficiente: parseFracao(termoAtual), expoente: 0 });

    return monomios;
}


// =========================================================================
// DERIVADAS (Regra do Tombo)
// =========================================================================

/**
 * Aplica a regra do tombo (d/dx c*x^e = c*e*x^(e-1)) a um monomio.
 * @param {number} c - Coeficiente.
 * @param {number} e - Expoente.
 * @returns {Array<number>} Um array [novo_coeficiente, novo_expoente].
 */
function derivadaTombo(c, e) {
    if (e === 0) return [0, 0]; // Derivada de constante e zero
    return [c * e, e - 1];
}

/**
 * Calcula a derivada de todos os monomios da funcao.
 * @param {Array<object>} funcoes - Array de monomios originais.
 * @returns {Array<Array<number>>} Array de monomios derivados [[coef, exp], ...].
 */
function calcularDerivada(funcoes) {
    return funcoes.map(t => derivadaTombo(t.coeficiente, t.expoente));
}

/**
 * Converte o array de monomios derivados de volta para uma string legivel.
 * Os coeficientes sao formatados com 2 casas decimais.
 * @param {Array<Array<number>>} derivadaFuncoes - Array de monomios derivados.
 * @returns {string} A string da funcao derivada (ex: "6.00x^2 + 8.00x").
 */
function exibirResultado(derivadaFuncoes) {
    let resultadoStr = "";
    let primeira = true; // Para gerenciar o primeiro sinal

    for (let [c, e] of derivadaFuncoes) {
        if (c !== 0) {
            let sinal = c > 0 ? (primeira ? "" : "+") : "-";
            let valorAbsoluto = Math.abs(c).toFixed(2); // Formata para 2 casas

            if (e === 0) resultadoStr += `${sinal}${valorAbsoluto}`; // Termo constante
            else if (e === 1) resultadoStr += `${sinal}${valorAbsoluto}x`; // Termo linear
            else resultadoStr += `${sinal}${valorAbsoluto}x^${e}`; // Termo com expoente

            primeira = false;
        }
    }
    return resultadoStr || "0.00"; // Retorna "0.00" se for a derivada de uma constante
}


// =========================================================================
// AVALIACAO DE FUNCAO f(x)
// =========================================================================

/**
 * Calcula o valor numerico da funcao (f(x)) para um x especifico.
 * Essencial para o metodo dos Trapezios e a determinacao do Y no ponto critico.
 * @param {string} funcaoStr - A funcao polinomial em formato string.
 * @param {number} valorX - O valor de x a ser substituido.
 * @returns {number} O valor de f(valorX).
 */
function calcularX(funcaoStr, valorX) {
    // Reutiliza o parser para obter a estrutura de monomios
    let monomios = Funcoes(funcaoStr); 
    
    // Soma os valores de cada monomio (c * x^e)
    return monomios.reduce((soma, monomio) => 
        soma + monomio.coeficiente * Math.pow(valorX, monomio.expoente)
    , 0);
}


// =========================================================================
// PONTO CRITICO (MAXIMOS / MINIMOS)
// =========================================================================

/**
 * Encontra as raizes da derivada primeira (f'(x) = 0) usando uma combinacao
 * de varredura (scan) e o Metodo da Bisseccao (refinamento).
 * @param {string} derivadaStr - A funcao derivada primeira (f'(x)) em string.
 * @param {number} min - Limite inferior do intervalo de busca.
 * @param {number} max - Limite superior do intervalo de busca.
 * @returns {Array<number>} Array de valores x onde f'(x) = 0.
 */
function pontosCriticos(derivadaStr, min = -100, max = 100) {
    const N = 5000;         // Precisao da varredura (numero de passos)
    const EPS = 1e-6;       // Tolerancia para considerar um valor como "quase zero"
    const delta = (max - min) / N; // Tamanho de cada passo no scan

    // Funcao auxiliar que calcula o valor de f'(x)
    const fDerivada = x => calcularX(derivadaStr, x);

    let candidatos = [];
    let xAnterior = min;
    let fAnterior = fDerivada(xAnterior);

    // 1) VARREDURA PROCURANDO MUDANCA DE SINAL
    for (let i = 1; i <= N; i++) {
        let x = min + i * delta;
        let fx = fDerivada(x);

        // Se o sinal mudou (fAnterior * fx < 0), encontramos um intervalo com uma raiz.
        if (fAnterior * fx < 0) {
            candidatos.push([x - delta, x]); // Adiciona o intervalo [x_n-1, x_n]
        }

        // Se o valor e muito proximo de zero.
        if (Math.abs(fx) < EPS) {
            candidatos.push([x - delta, x + delta]); // Adiciona um pequeno intervalo ao redor do zero
        }

        xAnterior = x;
        fAnterior = fx;
    }

    if (candidatos.length === 0) return [];

    // 2) FUNCAO AUXILIAR DE BISSECCAO (Refinamento da raiz)
    function bisseccao(a, b) {
        let fa = fDerivada(a);
        
        // Maximo de 100 iteracoes para convergencia
        for (let i = 0; i < 100; i++) {
            let m = (a + b) / 2; // Ponto medio
            let fm = fDerivada(m);

            if (Math.abs(fm) < 1e-9) return m; // Se proximo de zero, encontramos a raiz

            // Reduz o intervalo onde o sinal inverte (a * m < 0 ou b * m < 0)
            if (fa * fm < 0) {
                b = m;
            } else {
                a = m;
                fa = fm; // A nova raiz esta no intervalo [m, b]
            }
        }
        return (a + b) / 2; // Retorna a melhor aproximacao apos 100 iteracoes
    }

    // 3) REFINA CADA INTERVALO CANDIDATO
    let raizes = candidatos.map(([a, b]) => bisseccao(a, b));

    // 4) REMOVE DUPLICATAS (raizes muito proximas)
    let raizesFinais = [];
    for (let r of raizes) {
        // Verifica se a raiz ja foi adicionada (com uma tolerancia de 1e-5)
        if (!raizesFinais.some(v => Math.abs(v - r) < 1e-5)) {
            raizesFinais.push(r);
        }
    }

    return raizesFinais;
}

/**
 * Classifica o ponto critico (minimo ou maximo) usando o Teste da Derivada Segunda.
 * Se f''(x) > 0, concavidade para cima (Minimo).
 * Se f''(x) < 0, concavidade para baixo (Maximo).
 * @param {string} derivada2Str - A funcao derivada segunda (f''(x)) em string.
 * @param {number} x - O valor x do ponto critico.
 * @returns {string} "Minimo", "Maximo" ou "Ponto nulo / inflexao".
 */
function minOuMax(derivada2Str, x) {
    let d2 = calcularX(derivada2Str, x);
    if (d2 < 0) return "Maximo";
    if (d2 > 0) return "Minimo";
    return "Ponto nulo / inflexao";
}


// =========================================================================
// INTEGRAIS SIMBOLICAS (Antiderivadas)
// =========================================================================

/**
 * Aplica a regra da integral (int c*x^e dx = c/(e+1) * x^(e+1)) a um monomio.
 * @param {number} c - Coeficiente.
 * @param {number} e - Expoente.
 * @returns {Array<number>} Um array [novo_coeficiente, novo_expoente].
 */
function integralSubida(c, e) {
    return [c / (e + 1), e + 1];
}

/**
 * Calcula a integral indefinida de todos os monomios da funcao.
 * @param {Array<object>} funcoes - Array de monomios originais.
 * @returns {Array<Array<number>>} Array de monomios integrados.
 */
function calcularIntegral(funcoes) {
    return funcoes.map(t =>
        // Regra especial para constante: int c*x^0 dx = c*x^1
        t.expoente === 0 ? [t.coeficiente, 1] : integralSubida(t.coeficiente, t.expoente)
    );
}

/**
 * Converte o array de monomios integrados de volta para uma string legivel
 * e adiciona a constante de integracao (+C).
 * @param {Array<Array<number>>} intFuncoes - Array de monomios integrados.
 * @returns {string} A string da funcao primitiva (ex: "F(x) = 2.00x^3 + C").
 */
function exibirIntegral(intFuncoes) {
    let resultadoStr = "";
    let primeira = true;

    for (let [c, e] of intFuncoes) {
        if (c !== 0) {
            let sinal = c > 0 ? (primeira ? "" : "+") : "-";
            let valorAbsoluto = Math.abs(c).toFixed(2);

            if (e === 1) resultadoStr += `${sinal}${valorAbsoluto}x`;
            else resultadoStr += `${sinal}${valorAbsoluto}x^${e}`;

            primeira = false;
        }
    }
    return (resultadoStr || "0.00") + "+C"; // Adiciona a constante C
}


// =========================================================================
// INTEGRAL NUMERICA — REGRA DOS TRAPEZIOS
// =========================================================================

/**
 * Aproxima a integral definida de f(x) no intervalo [a, b] usando
 * a Regra dos Trapezios.
 * Formula: I ≈ h/2 * [ f(a) + 2*SUM(f(a+ih)) + f(b) ]
 * @param {string} funcaoStr - Funcao a ser integrada.
 * @param {number} a - Limite inferior.
 * @param {number} b - Limite superior.
 * @param {number} n - Numero de trapezios (particoes).
 * @returns {number | string} O valor aproximado da area ou uma mensagem de erro.
 */
function trapezios(funcaoStr, a, b, n = 2000) {

    // Conversao e validacao de entradas
    a = parseFloat(a);
    b = parseFloat(b);
    n = parseInt(n);

    if (isNaN(a) || isNaN(b) || isNaN(n) || n <= 0 || a === b)
        return "Erro: valores invalidos para a integral numerica.";

    let h = (b - a) / n; // Largura de cada trapezio
    let soma = 0; // Soma dos termos internos (que sao multiplicados por 2)

    // Loop de i = 1 ate n-1 (termos internos: f(a+h) ate f(b-h))
    for (let i = 1; i < n; i++) {
        let x = a + i * h; // Ponto x onde a funcao sera avaliada
        soma += calcularX(funcaoStr, x); // Avalia f(x_i)
    }

    // Aplica a formula final
    return (h / 2) * (
        calcularX(funcaoStr, a) + // f(a)
        2 * soma + // 2 * [ f(x1) + f(x2) + ... ]
        calcularX(funcaoStr, b) // f(b)
    );
}


// =========================================================================
// BOTAO "CALCULAR" — LOGICA PRINCIPAL
// =========================================================================

document.getElementById("calcular").addEventListener("click", () => {

    let funcaoEntrada = document.getElementById("funcao").value;
    let operacaoSelecionada = document.querySelector("input[name='operacao']:checked").value;

    let monomios = Funcoes(funcaoEntrada);
    let textoResultado = "";

    /* ----------------------------------------------------
        DERIVADAS + PONTOS CRITICOS
    -----------------------------------------------------*/
    if (operacaoSelecionada === "derivada") {

        // 1) DERIVADA 1 (f'(x))
        let d1array = calcularDerivada(monomios);
        let d1resultadoStr = exibirResultado(d1array);

        // 2) Preparacao da string limpa de f'(x) para o calculo de raizes e d''(x)
        let d1limpoStr = d1array
            .filter(([c,e]) => c !== 0)
            .map(([c,e]) => {
                let cs = Number(c).toString(); // Coeficiente como string
                if (e === 0) return `${cs}`;
                if (e === 1) return `${cs}x`;
                return `${cs}x^${e}`;
            })
            .join("+")
            .replace(/\+\-/g, "-"); // Corrige a dupla adicao de sinal (ex: "+-4x")

        // 3) DERIVADA 2 (f''(x))
        let d2array = calcularDerivada(Funcoes(d1limpoStr));
        let d2resultadoStr = exibirResultado(d2array);

        // String limpa de f''(x) para avaliacao no minOuMax
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

        // 4) Definicao do Intervalo de busca para os pontos criticos
        let modoIntervalo = document.querySelector("input[name='intervaloModo']:checked").value;
        let minIntervalo, maxIntervalo;

        if (modoIntervalo === "custom") {
            minIntervalo = parseFloat(document.getElementById("minIntervalo").value);
            maxIntervalo = parseFloat(document.getElementById("maxIntervalo").value);

            if (isNaN(minIntervalo) || isNaN(maxIntervalo) || minIntervalo >= maxIntervalo) {
                document.getElementById("resultado").innerText = "Erro: Intervalo de busca invalido.";
                return;
            }
        } else {
            // Intervalo Padrao (Default)
            minIntervalo = -100;
            maxIntervalo = 100;
        }

        // 5) ACHAR TODOS OS PONTOS CRITICOS
        let xsCriticos = pontosCriticos(d1limpoStr, minIntervalo, maxIntervalo);

        textoResultado =
            `=== DERIVADAS ===\n` +
            `f'(x) = ${d1resultadoStr}\n` +
            `f''(x) = ${d2resultadoStr}\n\n`;

        if (xsCriticos.length === 0) {
            textoResultado += `Nenhum ponto critico encontrado no intervalo (${minIntervalo}, ${maxIntervalo}).`;
        } 
        else {

            textoResultado += `=== PONTOS CRITICOS (${xsCriticos.length}) ===\n\n`;

            xsCriticos.forEach(xCrit => {
                let yCrit = calcularX(funcaoEntrada, xCrit); // Avalia na funcao original f(x)
                let tipo = minOuMax(d2funcStr, xCrit); // Classifica (Min/Max)

                textoResultado +=
                    `x = ${xCrit.toFixed(6)}\n` +
                    `y = ${yCrit.toFixed(6)}\n` +
                    `Classificacao: ${tipo}\n\n`;
            });
        }
    }

    /* ----------------------------------------------------
        INTEGRAL NUMERICA — TRAPEZIOS
    -----------------------------------------------------*/
    else if (operacaoSelecionada === "trapz") {

        let minInput = parseFloat(document.getElementById("minIntervalo").value);
        let maxInput = parseFloat(document.getElementById("maxIntervalo").value);

        let min = !isNaN(minInput) ? minInput : -100;
        let max = !isNaN(maxInput) ? maxInput : 100;

        if (isNaN(min) || isNaN(max) || min >= max) {
            document.getElementById("resultado").innerText = "Erro: Intervalo invalido para integral.";
            return;
        }

        // Utiliza n=4000 para uma boa precisao na aproximacao
        let areaAproximada = trapezios(funcaoEntrada, min, max, 4000); 


        // Tratamento de erro retornado pela funcao trapezios
        if (typeof areaAproximada === 'string' && areaAproximada.startsWith('Erro')) {
            document.getElementById("resultado").innerText = areaAproximada;
            return;
        }

        textoResultado =
            `=== INTEGRAL NUMERICA — REGRA DOS TRAPEZIOS ===\n` +
            `Funcao: ${funcaoEntrada}\n` +
            `Intervalo: [${min}, ${max}]\n` +
            `Area aproximada = ${areaAproximada.toFixed(6)}`;

        
    }

    /* ----------------------------------------------------
        INTEGRAL SIMBOLICA
    -----------------------------------------------------*/
    else {
        let integralResultado = exibirIntegral(calcularIntegral(monomios));
        textoResultado = `=== INTEGRAL INDEFINIDA ===\nF(x) = ${integralResultado}`;
    }

    // Exibir o resultado final na interface
    document.getElementById("resultado").innerText = textoResultado;
});
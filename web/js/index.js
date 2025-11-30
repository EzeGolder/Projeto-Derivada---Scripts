/*
### **Grupo 2 — 
## Integrantes: Bruno Enrique Medeiros Costa, Ezequiel da Silva, Miguel Rocha de Araujo, Rogério, Samuel de Macedo Ferrari**

*/
//Javascript para a manipulação da página web da calculadora

//Adição de referências a elementos da página:

// Mostrar campos apenas quando o usuário quiser intervalo personalizado
document.querySelectorAll("input[name='intervaloModo']").forEach(radio => {
    radio.addEventListener("change", () => {
        let custom = document.querySelector("input[name='intervaloModo']:checked").value;
        document.getElementById("intervalos").style.display =
            custom === "custom" ? "flex" : "none";
    });
});

// Controlar visibilidade dos radios de intervalo com base na operação escolhida
function atualizarVisibilidadeIntervalo() {
    let operacao = document.querySelector("input[name='operacao']:checked").value;

    if (operacao === "derivada" || operacao === "trapz") {
        // Derivada e integral numérica precisam de intervalos
        document.getElementById("intervalo-opcao").style.display = "flex";

        let modo = document.querySelector("input[name='intervaloModo']:checked").value;
        document.getElementById("intervalos").style.display =
            modo === "custom" ? "flex" : "none";

    } else {
        // Integral simbólica não usa intervalo
        document.getElementById("intervalo-opcao").style.display = "none";
        document.getElementById("intervalos").style.display = "none";
    }
}


document.querySelectorAll("input[name='operacao']").forEach(radio => {
    radio.addEventListener("change", atualizarVisibilidadeIntervalo);
});

document.querySelectorAll("input[name='intervaloModo']").forEach(radio => {
    radio.addEventListener("change", atualizarVisibilidadeIntervalo);
});

atualizarVisibilidadeIntervalo();

//Funções da calculadora:


//Transformar fração em número único

function parseFracao(fraction) {
    if (fraction.includes('/')) {
        const [n, d] = fraction.split('/').map(Number);
        return n / d;
    }
    return parseFloat(fraction);
}

//Método que trata as funções, devolvendo um vetor de monômios
function Funcoes(funcao) {

    // Normalização
    funcao = funcao.toLowerCase();
    funcao = funcao.replace(/\s+/g, '');

    if (funcao[0] !== '+' && funcao[0] !== '-')
        funcao = '+' + funcao;

    let termos = [];
    let termoAtual = '';
    let coeficiente = 0;
    let expoente = 0;

    for (let i = 0; i < funcao.length; i++) {
        const c = funcao[i];

        if (c === 'x') {

            if (termoAtual === '' || termoAtual === '+' || termoAtual === '-') {
                coeficiente = termoAtual === '-' ? -1 : 1;
            } else {
                coeficiente = parseFracao(termoAtual);
            }

            if (funcao[i + 1] === '^') {
                let inicio = i + 2;
                let fim = inicio;

                while (fim < funcao.length && (!isNaN(funcao[fim]))) {
                    fim++;
                }

                expoente = parseInt(funcao.slice(inicio, fim));
                i = fim - 1;
            } else {
                expoente = 1;
            }

            termos.push({ coeficiente, expoente });
            termoAtual = '';
        }

        else if (c === '+' || c === '-') {
            if (termoAtual !== '') {
                coeficiente = parseFracao(termoAtual);
                expoente = 0;
                termos.push({ coeficiente, expoente });
            }
            termoAtual = c;
        }

        else {
            if (!isNaN(c) || c === '.' || c === '/')
                termoAtual += c;
        }
    }

    if (termoAtual !== '') {
        coeficiente = parseFracao(termoAtual);
        expoente = 0;
        termos.push({ coeficiente, expoente });
    }

    return termos;
}


//Derivadas

function derivadaTombo(c, e) {
    if (e === 0) return [0, 0];
    return [c * e, e - 1];
}

function calcularDerivada(funcoes) {
    return funcoes.map(t => derivadaTombo(t.coeficiente, t.expoente));
}

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


//Ponto Crítico

function calcularX(funcao, x) {
    let termos = Funcoes(funcao);
    let r = 0;
    for (let t of termos) r += t.coeficiente * Math.pow(x, t.expoente);
    return r;
}

function pontoCritico(derivadaStr, min = -100, max = 100) {

    // 1. Amostragem inicial - detectar possíveis mudanças de sinal
    let passos = 2000; // QUanto mais denso mais preciso
    let delta = (max - min) / passos;

    let anterior = calcularX(derivadaStr, min);
    let candidatos = [];

    for (let i = 1; i <= passos; i++) {
        let xAtual = min + i * delta;
        let valor = calcularX(derivadaStr, xAtual);

        // Detectar mudança de sinal (método original)
        if (anterior * valor < 0) {
            candidatos.push([xAtual - delta, xAtual]);
        }

        // Detectar valores muito próximos de zero (pontos de sela)
        if (Math.abs(valor) < 0.0005) {
            candidatos.push([xAtual - delta, xAtual + delta]);
        }

        anterior = valor;
    }

    // Se não achou nada, não há ponto crítico
    if (candidatos.length === 0) return null;

    // 2. Para cada janela encontrada, aplicar método binário
    let limite = 0.0001;

    for (let [a, b] of candidatos) {
        let min2 = a;
        let max2 = b;

        let it = 0;
        let x = (min2 + max2) / 2;
        let fx = calcularX(derivadaStr, x);

        while (Math.abs(fx) > limite && it < 10000) {
            
            if (fx > 0) max2 = x;
            else min2 = x;

            x = (min2 + max2) / 2;
            fx = calcularX(derivadaStr, x);
            it++;
        }

        if (it < 10000) {
            return x; // Encontrou!
        }
    }

    return null; // Se todos os intervalos falharam
}


function minOuMax(derivada2, x) {
    let y = calcularX(derivada2, x);
    if (y < 0) return "Máximo";
    if (y > 0) return "Mínimo";
    return "Ponto nulo";
}


//Integrais

function integralSubida(c, e) {
    return [c / (e + 1), e + 1];
}

function calcularIntegral(funcoes) {
    return funcoes.map(t =>
        t.expoente === 0 ? [t.coeficiente, 1] : integralSubida(t.coeficiente, t.expoente)
    );
}

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


//     Regra dos Trapézios (Integração Numérica)


// Integra a função no intervalo [a, b] usando n trapézios
function trapezios(funcaoStr, a, b, n = 2000) {

    // Garantir valores válidos
    a = parseFloat(a);
    b = parseFloat(b);
    n = parseInt(n);

    if (isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
        return "Erro: valores inválidos para a integral numérica.";
    }

    // Largura dos trapézios
    let h = (b - a) / n;
    let soma = 0;

    // Soma das partes internas (todas menos as bordas)
    for (let i = 1; i < n; i++) {
        let x = a + i * h;
        soma += calcularX(funcaoStr, x);
    }

    // Fórmula final dos trapézios
    let resultado = (h / 2) * (
        calcularX(funcaoStr, a) +
        2 * soma +
        calcularX(funcaoStr, b)
    );

    return resultado;
}



//Funções do botão de enviar 

document.getElementById("calcular").addEventListener("click", () => {
    let funcao = document.getElementById("funcao").value;
    let operacao = document.querySelector("input[name='operacao']:checked").value;

    let termos = Funcoes(funcao);
    let texto = "";

    if (operacao === "derivada") {

    
    //  DERIVADAS
    

    let d1 = exibirResultado(calcularDerivada(termos));
    let d1limpo = d1.replace(/\s+/g, '');
    let d2 = exibirResultado(calcularDerivada(Funcoes(d1limpo)));

    // Intervalo
    let intervaloModo = document.querySelector("input[name='intervaloModo']:checked").value;
    let min, max;

    if (intervaloModo === "custom") {
        min = parseFloat(document.getElementById("minIntervalo").value);
        max = parseFloat(document.getElementById("maxIntervalo").value);

        if (isNaN(min) || isNaN(max) || min >= max) {
            document.getElementById("resultado").innerText =
                "Erro: intervalo inválido.";
            return;
        }
    } else {
        min = -100;
        max = 100;
    }

    let xCrit = pontoCritico(d1limpo, min, max);

    if (xCrit === null) {
        texto =
            `1ª Derivada: ${d1}
            2ª Derivada: ${d2}

            Não há ponto crítico no intervalo (${min}, ${max}).`;
    } else {
        let yCrit = calcularX(funcao, xCrit);
        let tipo = minOuMax(d2, xCrit);

        texto =
            `1ª Derivada: ${d1}
            2ª Derivada: ${d2}

            Ponto crítico encontrado:
            x = ${xCrit.toFixed(4)}
            y = ${yCrit.toFixed(4)}
            Tipo: ${tipo}`;
    }

} else if (operacao === "trapz") {

   
    //  INTEGRAL NUMÉRICA
    

    let minInput = parseFloat(document.getElementById("minIntervalo").value);
    let maxInput = parseFloat(document.getElementById("maxIntervalo").value);

    let min = !isNaN(minInput) ? minInput : -100;
    let max = !isNaN(maxInput) ? maxInput : 100;


    if (isNaN(min) || isNaN(max) || min >= max) {
        document.getElementById("resultado").innerText =
            "Erro: intervalo inválido.";
        return;
    }

    let area = trapezios(funcao, min, max, 4000); // 4k trapézios = suave

    texto =
        `Integral numérica (Regra dos Trapézios)
        Função: ${funcao}
        Intervalo: [${min}, ${max}]
        Área aproximada = ${area}`;

} else {

    
    //  INTEGRAL SIMBÓLICA
    

    let integral = exibirIntegral(calcularIntegral(termos));
    texto = `Integral indefinida:\n${integral}`;
}


    document.getElementById("resultado").innerText = texto;
});

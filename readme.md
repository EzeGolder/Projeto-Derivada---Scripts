# 📘 Calculadora de Derivadas e Integrais  


### **Grupo 2 — 
## Integrantes: Bruno Enrique Medeiros Costa, Ezequiel da Silva, Miguel Rocha de Araujo, Rogério, Samuel de Macedo Ferrari**

Este projeto consiste em uma **calculadora web completa** capaz de interpretar funções algébricas, derivar, integrar, encontrar pontos críticos e determinar se são máximos, mínimos ou pontos de inflexão.  
Todo o processamento matemático é feito em **JavaScript puro**, tanto para console quanto para navegador.

---

## ✨ Funcionalidades

### ✅ Parser completo de funções
Aceita polinômios com:
- `+` e `-`
- Espaços opcionais
- `X` ou `x`  
- Frações (`1/2`, `2/3x^4`, etc.)

Exemplos aceitos:
3x^2 - 2x + 1
5x^3 - 10
1/3 x^4


---

### ✅ Derivada (1ª e 2ª ordem)
- Implementação simbólica usando **Regra do Tombo**
- Conversão automática da derivada de volta para string legível

---

### ✅ Pontos críticos
Busca robusta utilizando:
- **Varredura (sample scan)** para detectar mudanças de sinal  
- **Método da Bisseção** para refinar a raiz  
- Suporte a intervalo padrão `(-100, 100)` ou intervalo informado pelo usuário

---

### ✅ Classificação do ponto crítico
Usando a **segunda derivada**:

| Valor da 2ª derivada | Classificação |
|----------------------|--------------|
| `< 0` | Máximo local |
| `> 0` | Mínimo local |
| `= 0` | Ponto nulo / sela / indefinido |

---

### ✅ Integrais
- Cálculo simbólico da **integral indefinida**
- Formato da saída:
ax^n + C


---

### ✅ Interface Web
- Caixa de resultado expandida por padrão  
- Painel de opções dinâmico  
- Campos de intervalo visíveis somente quando necessários  
- Interface totalmente responsiva  

---

## 📁 Estrutura do Projeto
/src
index.html → Interface da calculadora
index.css → Estilos
index.js → Lógica completa usando JS no navegador
main.js → Versão console (Node.js)


---

## ▶️ Como executar no navegador

Basta abrir o arquivo:

src/index.html

A calculadora funciona imediatamente, **sem dependências externas**.

---

## ▶️ Como executar a versão console (Node.js)

Certifique-se de ter o Node.js instalado.

Execute:

```bash
node src/main.js
```


A versão console permite inserir funções digitando diretamente no terminal.
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis da calculadora básica
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let resetScreen = false;

    // Elementos da calculadora
    const currentOperandElement = document.getElementById('current-operand');
    const previousOperandElement = document.getElementById('previous-operand');
    const display = document.querySelector('.display');

    // Botões da calculadora básica
    const numberButtons = document.querySelectorAll('[id^="one"],[id^="two"],[id^="three"],[id^="four"],[id^="five"],[id^="six"],[id^="seven"],[id^="eight"],[id^="nine"],[id^="zero"]');
    const operationButtons = document.querySelectorAll('[id^="add"],[id^="subtract"],[id^="multiply"],[id^="divide"]');
    const equalsButton = document.getElementById('equals');
    const clearButton = document.getElementById('clear');
    const toggleSignButton = document.getElementById('toggle-sign');
    const percentageButton = document.getElementById('percentage');
    const decimalButton = document.getElementById('decimal');

    // Event listeners para calculadora básica
    numberButtons.forEach(button => {
        button.addEventListener('click', () => appendNumber(button.textContent));
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => chooseOperation(button.textContent));
    });

    equalsButton.addEventListener('click', calculate);
    clearButton.addEventListener('click', clearAll);
    toggleSignButton.addEventListener('click', toggleSign);
    percentageButton.addEventListener('click', percentage);
    decimalButton.addEventListener('click', appendDecimal);

    // Funções da calculadora básica
    function appendNumber(number) {
        if (currentOperand === '0' || resetScreen) {
            currentOperand = '';
            resetScreen = false;
        }
        currentOperand += number;
        updateDisplay();
    }

    function appendDecimal() {
        if (resetScreen) {
            currentOperand = '0';
            resetScreen = false;
        }
        if (!currentOperand.includes('.')) {
            currentOperand += '.';
        }
        updateDisplay();
    }

    function clearAll() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        updateDisplay();
    }

    function toggleSign() {
        if (currentOperand === '0') return;
        currentOperand = (parseFloat(currentOperand) * -1).toString();
        updateDisplay();
    }

    function percentage() {
        if (currentOperand === '0') return;
        currentOperand = (parseFloat(currentOperand) / 100).toString();
        updateDisplay();
    }

    function chooseOperation(op) {
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            calculate();
        }
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
        updateDisplay();
    }

    function calculate() {
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = prev / current; break;
            default: return;
        }
        
        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
        resetScreen = true;
        updateDisplay();
    }

    function updateDisplay() {
        currentOperandElement.textContent = currentOperand;
        previousOperandElement.textContent = operation != null ? `${previousOperand} ${operation}` : previousOperand;
    }

    // Controle das abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Esconde o display quando na aba estatística
            if (tabId === 'stats') {
                display.classList.add('hidden');
                showStatSelector();
            } else {
                display.classList.remove('hidden');
            }
        });
    });

    // Funções estatísticas
    window.showStatSelector = function() {
        document.querySelector('.stat-type-selector').classList.remove('hidden');
        document.querySelectorAll('.stat-form').forEach(form => {
            form.classList.add('hidden');
        });
    };

    // Seleção do tipo de cálculo estatístico
    document.querySelectorAll('.stat-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const statType = this.getAttribute('data-stat-type');
            showStatForm(statType);
        });
    });

    function showStatForm(statType) {
        document.querySelector('.stat-type-selector').classList.add('hidden');
        document.querySelectorAll('.stat-form').forEach(form => {
            form.classList.add('hidden');
        });
        document.getElementById(`${statType}-form`).classList.remove('hidden');
    }

    // Implementação das funções estatísticas
    window.calculateMeanCI = function() {
        const mean = parseFloat(document.getElementById('mean').value);
        const stdDev = parseFloat(document.getElementById('stdDev').value);
        const sampleSize = parseInt(document.getElementById('sampleSize1').value);
        const zValue = parseFloat(document.getElementById('confidenceLevel1').value);
        
        if (isNaN(mean) || isNaN(stdDev) || isNaN(sampleSize) || stdDev <= 0 || sampleSize <= 0) {
            alert("Por favor, preencha todos os campos com valores válidos.");
            return;
        }
        
        const marginOfError = zValue * (stdDev / Math.sqrt(sampleSize));
        const lowerBound = mean - marginOfError;
        const upperBound = mean + marginOfError;
        
        const confidenceLevel = document.getElementById('confidenceLevel1').options[
            document.getElementById('confidenceLevel1').selectedIndex].text;
        
        const resultBox = document.getElementById('meanResult');
        resultBox.querySelector('.result-content').innerHTML = `
            <p><strong>Intervalo de ${confidenceLevel} de confiança para a média populacional (μ):</strong></p>
            <p class="result-value">${lowerBound.toFixed(2)} < μ < ${upperBound.toFixed(2)}</p>
            <p><strong>Margem de erro:</strong> ±${marginOfError.toFixed(2)}</p>
            <div class="formula-box">
                <p><strong>Fórmula utilizada:</strong></p>
                <p class="formula">x̄ ± z<sub>α/2</sub> × (σ/√n)</p>
                <p>Onde:</p>
                <ul>
                    <li>x̄ = ${mean.toFixed(2)} (média amostral)</li>
                    <li>z<sub>α/2</sub> = ${zValue} (valor crítico para ${confidenceLevel})</li>
                    <li>σ = ${stdDev.toFixed(2)} (desvio padrão populacional)</li>
                    <li>n = ${sampleSize} (tamanho da amostra)</li>
                </ul>
            </div>
        `;
        resultBox.style.display = 'block';
    };

    window.calculatePropCI = function() {
        const sampleProp = parseFloat(document.getElementById('sampleProp').value);
        const sampleSize = parseInt(document.getElementById('sampleSize2').value);
        const zValue = parseFloat(document.getElementById('confidenceLevel2').value);
        
        if (isNaN(sampleProp) || isNaN(sampleSize) || isNaN(zValue) || 
            sampleProp < 0 || sampleProp > 1 || sampleSize <= 0) {
            alert("Por favor, preencha todos os campos com valores válidos.");
            return;
        }
        
        const marginOfError = zValue * Math.sqrt((sampleProp * (1 - sampleProp)) / sampleSize);
        const lowerBound = Math.max(0, sampleProp - marginOfError);
        const upperBound = Math.min(1, sampleProp + marginOfError);
        
        const confidenceLevel = document.getElementById('confidenceLevel2').options[
            document.getElementById('confidenceLevel2').selectedIndex].text;
        
        const resultBox = document.getElementById('propResult');
        resultBox.querySelector('.result-content').innerHTML = `
            <p><strong>Intervalo de ${confidenceLevel} de confiança para a proporção populacional (π):</strong></p>
            <p class="result-value">${lowerBound.toFixed(4)} < π < ${upperBound.toFixed(4)}</p>
            <p><strong>Margem de erro:</strong> ±${marginOfError.toFixed(4)}</p>
            <div class="formula-box">
                <p><strong>Fórmula utilizada:</strong></p>
                <p class="formula">p̂ ± z<sub>α/2</sub> × √(p̂(1-p̂)/n)</p>
                <p>Onde:</p>
                <ul>
                    <li>p̂ = ${sampleProp.toFixed(4)} (proporção amostral)</li>
                    <li>z<sub>α/2</sub> = ${zValue} (valor crítico para ${confidenceLevel})</li>
                    <li>n = ${sampleSize} (tamanho da amostra)</li>
                </ul>
            </div>
        `;
        resultBox.style.display = 'block';
    };

    window.calculateSampleSizeMean = function() {
        const desiredMargin = parseFloat(document.getElementById('desiredMargin').value);
        const popStdDev = parseFloat(document.getElementById('popStdDev').value);
        const zValue = parseFloat(document.getElementById('confidenceLevel3').value);
        
        if (isNaN(desiredMargin) || isNaN(popStdDev) || isNaN(zValue) || 
            desiredMargin <= 0 || popStdDev <= 0) {
            alert("Por favor, preencha todos os campos com valores válidos.");
            return;
        }
        
        const sampleSize = Math.ceil(Math.pow((zValue * popStdDev) / desiredMargin, 2));
        
        const confidenceLevel = document.getElementById('confidenceLevel3').options[
            document.getElementById('confidenceLevel3').selectedIndex].text;
        
        const resultBox = document.getElementById('sampleSizeMeanResult');
        resultBox.querySelector('.result-content').innerHTML = `
            <p><strong>Tamanho mínimo de amostra necessário para ${confidenceLevel} de confiança:</strong></p>
            <p class="result-value">n = ${sampleSize}</p>
            <div class="formula-box">
                <p><strong>Fórmula utilizada:</strong></p>
                <p class="formula">n = (z<sub>α/2</sub> × σ / E)²</p>
                <p>Onde:</p>
                <ul>
                    <li>z<sub>α/2</sub> = ${zValue} (valor crítico para ${confidenceLevel})</li>
                    <li>σ = ${popStdDev.toFixed(4)} (desvio padrão populacional)</li>
                    <li>E = ${desiredMargin.toFixed(4)} (margem de erro desejada)</li>
                </ul>
            </div>
        `;
        resultBox.style.display = 'block';
    };

    window.calculateSampleSizeProp = function() {
        const estimatedProp = parseFloat(document.getElementById('estimatedProp').value);
        const desiredMargin = parseFloat(document.getElementById('desiredMarginProp').value);
        const zValue = parseFloat(document.getElementById('confidenceLevel4').value);
        
        if (isNaN(estimatedProp) || isNaN(desiredMargin) || isNaN(zValue) || 
            estimatedProp < 0 || estimatedProp > 1 || desiredMargin <= 0) {
            alert("Por favor, preencha todos os campos com valores válidos.");
            return;
        }
        
        const sampleSize = Math.ceil((Math.pow(zValue, 2) * estimatedProp * (1 - estimatedProp)) / Math.pow(desiredMargin, 2));
        
        const confidenceLevel = document.getElementById('confidenceLevel4').options[
            document.getElementById('confidenceLevel4').selectedIndex].text;
        
        const resultBox = document.getElementById('sampleSizePropResult');
        resultBox.querySelector('.result-content').innerHTML = `
            <p><strong>Tamanho mínimo de amostra necessário para ${confidenceLevel} de confiança:</strong></p>
            <p class="result-value">n = ${sampleSize}</p>
            <div class="formula-box">
                <p><strong>Fórmula utilizada:</strong></p>
                <p class="formula">n = [z² × p × (1-p)] / E²</p>
                <p>Onde:</p>
                <ul>
                    <li>z = ${zValue} (valor crítico para ${confidenceLevel})</li>
                    <li>p = ${estimatedProp.toFixed(2)} (proporção estimada)</li>
                    <li>1-p = ${(1 - estimatedProp).toFixed(2)}</li>
                    <li>E = ${desiredMargin.toFixed(4)} (margem de erro desejada)</li>
                </ul>
                <p class="formula">n = [${zValue}² × ${estimatedProp.toFixed(2)} × ${(1 - estimatedProp).toFixed(2)}] / ${desiredMargin.toFixed(4)}²</p>
                <p class="formula">n = [${Math.pow(zValue, 2).toFixed(4)} × ${(estimatedProp * (1 - estimatedProp)).toFixed(4)}] / ${Math.pow(desiredMargin, 2).toFixed(6)}</p>
                <p class="formula">n = ${sampleSize} (arredondado para cima)</p>
                ${estimatedProp === 0.5 ? '<p class="note">Nota: Usando p=0.5 obtém-se o tamanho máximo de amostra (mais conservador)</p>' : ''}
            </div>
        `;
        resultBox.style.display = 'block';
    };

    window.calculateErrorDifference = function() {
        const calculatedError = parseFloat(document.getElementById('calculatedError').value);
        const desiredError = parseFloat(document.getElementById('desiredError').value);
        
        if (isNaN(calculatedError) || isNaN(desiredError) || calculatedError <= 0 || desiredError <= 0) {
            alert("Por favor, preencha ambos os campos com valores positivos válidos.");
            return;
        }
        
        const errorDiff = calculatedError - desiredError;
        const percentageDiff = (errorDiff / desiredError) * 100;
        
        const resultBox = document.getElementById('errorDiffResult');
        resultBox.querySelector('.result-content').innerHTML = `
            <p><strong>Diferença entre os erros:</strong></p>
            <p class="result-value ${errorDiff >= 0 ? 'positive-difference' : 'negative-difference'}">
                ${errorDiff.toFixed(4)} (${percentageDiff.toFixed(2)}%)
            </p>
            <p><strong>Interpretação:</strong></p>
            <ul>
                <li>Valor positivo: Margem calculada é ${errorDiff.toFixed(4)} maior que a pretendida</li>
                <li>Valor negativo: Margem calculada é ${Math.abs(errorDiff).toFixed(4)} menor que a pretendida</li>
            </ul>
            <div class="formula-box">
                <p><strong>Fórmula utilizada:</strong></p>
                <p class="formula">Diferença = Margem Calculada - Erro Pretendido</p>
                <p class="formula">% Diferença = (Diferença / Erro Pretendido) × 100</p>
            </div>
        `;
        resultBox.style.display = 'block';
    };
});
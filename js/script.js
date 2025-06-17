document.addEventListener('DOMContentLoaded', function() {
        // Variáveis globais
        let currentOperand = '0';
        let previousOperand = '';
        let operation = undefined;
        let resetScreen = false;
        let statFormsData = {};
        
        // Elementos da DOM
        const currentOperandElement = document.getElementById('current-operand');
        const previousOperandElement = document.getElementById('previous-operand');

        // Botões
        const numberButtons = document.querySelectorAll('[id^="one"],[id^="two"],[id^="three"],[id^="four"],[id^="five"],[id^="six"],[id^="seven"],[id^="eight"],[id^="nine"],[id^="zero"]');
        const operationButtons = document.querySelectorAll('[id^="add"],[id^="subtract"],[id^="multiply"],[id^="divide"]');
        const equalsButton = document.getElementById('equals');
        const clearButton = document.getElementById('clear');
        const toggleSignButton = document.getElementById('toggle-sign');
        const percentageButton = document.getElementById('percentage');
        const decimalButton = document.getElementById('decimal');
        
        // Botões estatísticos
        const statOptionButtons = document.querySelectorAll('.stat-option-btn');
        const calculateMeanCIBtn = document.getElementById('calculateMeanCI');
        const calculatePropCIBtn = document.getElementById('calculatePropCI');
        const calculateSampleSizeMeanBtn = document.getElementById('calculateSampleSizeMean');
        const calculateSampleSizePropBtn = document.getElementById('calculateSampleSizeProp');
        const calculateErrorDifferenceBtn = document.getElementById('calculateErrorDifference');
        const backButtons = document.querySelectorAll('.back-btn');

        // Event Listeners
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                appendNumber(button.textContent);
                animateButton(button);
            });
        });

        // Controle das abas
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        operationButtons.forEach(button => {
            button.addEventListener('click', () => {
                chooseOperation(button.textContent);
                animateButton(button);
            });
        });

        [equalsButton, clearButton, toggleSignButton, percentageButton, decimalButton].forEach(btn => {
            btn.addEventListener('click', () => animateButton(btn));
        });

        equalsButton.addEventListener('click', calculate);
        clearButton.addEventListener('click', clearAll);
        toggleSignButton.addEventListener('click', toggleSign);
        percentageButton.addEventListener('click', percentage);
        decimalButton.addEventListener('click', appendDecimal);

        // Event Listeners para estatísticas
        statOptionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const statType = this.getAttribute('data-stat-type');
                showStatForm(statType);
            });
        });

        calculateMeanCIBtn.addEventListener('click', calculateMeanCI);
        calculatePropCIBtn.addEventListener('click', calculatePropCI);
        calculateSampleSizeMeanBtn.addEventListener('click', calculateSampleSizeMean);
        calculateSampleSizePropBtn.addEventListener('click', calculateSampleSizeProp);
        calculateErrorDifferenceBtn.addEventListener('click', calculateErrorDifference);
        
        backButtons.forEach(button => {
            button.addEventListener('click', showStatSelector);
        });

        // Funções da calculadora básica
        function appendNumber(number) {
            if (currentOperand === '0' || resetScreen) {
                currentOperand = '';
                resetScreen = false;
            }
            
            if (currentOperand.replace('.', '').length >= 15) {
                showToast('Número máximo de dígitos atingido');
                return;
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
            } else {
                showToast('Já existe um ponto decimal');
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
            
            try {
                switch (operation) {
                    case '+': computation = prev + current; break;
                    case '-': computation = prev - current; break;
                    case '×': computation = prev * current; break;
                    case '÷': 
                        if (current === 0) {
                            showToast('Divisão por zero não permitida');
                            clearAll();
                            return;
                        }
                        computation = prev / current; 
                        break;
                    default: return;
                }
                
                currentOperand = computation.toString();
                operation = undefined;
                previousOperand = '';
                resetScreen = true;
                updateDisplay();
            } catch (error) {
                showToast('Erro no cálculo');
                console.error(error);
            }
        }

        function updateDisplay() {
            currentOperandElement.textContent = formatNumber(currentOperand);
            previousOperandElement.textContent = operation != null ? 
                `${formatNumber(previousOperand)} ${operation}` : 
                formatNumber(previousOperand);
        }

        function formatNumber(num) {
            if (num === '') return '';
            const number = parseFloat(num);
            if (isNaN(number)) return num;
            
            if (Math.abs(number) >= 1e15 || (Math.abs(number) < 1e-6 && number !== 0)) {
                return number.toExponential(6);
            }
            
            const decimalPlaces = (number.toString().split('.')[1] || []).length;
            return decimalPlaces > 10 ? number.toFixed(10) : num;
        }

        // Funções estatísticas
        function showStatSelector() {
            document.querySelectorAll('.stat-form input, .stat-form select').forEach(el => el.value = '');
            document.querySelectorAll('.result-box .result-content').forEach(el => el.innerHTML = '');
            
            document.querySelector('.stat-type-selector').classList.remove('hidden');
            document.querySelectorAll('.stat-form').forEach(form => form.classList.add('hidden'));
        }

        function saveCurrentFormData() {
            const visibleForm = document.querySelector('.stat-form:not(.hidden)');
            if (!visibleForm) return;
            
            const formId = visibleForm.id.replace('-form', '');
            const inputs = visibleForm.querySelectorAll('input, select');
            statFormsData[formId] = {};
            
            inputs.forEach(input => {
                statFormsData[formId][input.id] = input.value;
            });
        }

        function restoreFormData(formId) {
            if (!statFormsData[formId]) return;
            
            const form = document.getElementById(`${formId}-form`);
            Object.keys(statFormsData[formId]).forEach(id => {
                const input = form.querySelector(`#${id}`);
                if (input) input.value = statFormsData[formId][id];
            });
        }

        function showStatForm(statType) {
            saveCurrentFormData();
            document.querySelector('.stat-type-selector').classList.add('hidden');
            document.querySelectorAll('.stat-form').forEach(form => form.classList.add('hidden'));
            
            const form = document.getElementById(`${statType}-form`);
            form.classList.remove('hidden');
            restoreFormData(statType);
            
            const firstInput = form.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }

        function calculateMeanCI() {
            try {
                const mean = parseFloat(document.getElementById('mean').value);
                const stdDev = parseFloat(document.getElementById('stdDev').value);
                const sampleSize = parseInt(document.getElementById('sampleSize1').value);
                const zValue = parseFloat(document.getElementById('confidenceLevel1').value);
                
                if (isNaN(mean) || isNaN(stdDev) || isNaN(sampleSize) || stdDev <= 0 || sampleSize <= 0) {
                    showToast('Valores inválidos. Verifique os dados.');
                    return;
                }
                
                const marginOfError = zValue * (stdDev / Math.sqrt(sampleSize));
                const lowerBound = mean - marginOfError;
                const upperBound = mean + marginOfError;
                
                const confidenceLevel = document.getElementById('confidenceLevel1').options[
                    document.getElementById('confidenceLevel1').selectedIndex].text;
                
                const resultBox = document.getElementById('meanResult');
                resultBox.querySelector('.result-content').innerHTML = `
                    <div class="result-header">
                        <h4>Intervalo de ${confidenceLevel} de confiança</h4>
                        <p class="range-display">${lowerBound.toFixed(4)} < μ < ${upperBound.toFixed(4)}</p>
                    </div>
                    <div class="result-details">
                        <p><span class="detail-label">Margem de erro:</span> ±${marginOfError.toFixed(4)}</p>
                        <p><span class="detail-label">Amplitude:</span> ${(upperBound - lowerBound).toFixed(4)}</p>
                    </div>
                    <div class="formula-box">
                        <div class="formula-header">Fórmula</div>
                        <div class="formula">x̄ ± z × (σ/√n)</div>
                        <div class="formula-values">
                            <p>= ${mean.toFixed(2)} ± ${zValue} × (${stdDev.toFixed(2)}/√${sampleSize})</p>
                            <p>= ${mean.toFixed(2)} ± ${(zValue * (stdDev / Math.sqrt(sampleSize))).toFixed(4)}</p>
                        </div>
                    </div>
                    <button class="copy-btn" onclick="copyResult('meanResult')">Copiar</button>
                `;
                resultBox.style.display = 'block';
                scrollToResult(resultBox);
            } catch (error) {
                showToast('Erro no cálculo. Verifique os valores.');
                console.error(error);
            }
        }

        function calculatePropCI() {
            try {
                const sampleProp = parseFloat(document.getElementById('sampleProp').value);
                const sampleSize = parseInt(document.getElementById('sampleSize2').value);
                const zValue = parseFloat(document.getElementById('confidenceLevel2').value);
                
                if (isNaN(sampleProp) || isNaN(sampleSize) || sampleSize <= 0 || sampleProp < 0 || sampleProp > 1) {
                    showToast('Valores inválidos. Verifique os dados.');
                    return;
                }
                
                const marginOfError = zValue * Math.sqrt((sampleProp * (1 - sampleProp)) / sampleSize);
                const lowerBound = Math.max(0, sampleProp - marginOfError);
                const upperBound = Math.min(1, sampleProp + marginOfError);
                
                const confidenceLevel = document.getElementById('confidenceLevel2').options[
                    document.getElementById('confidenceLevel2').selectedIndex].text;
                
                const resultBox = document.getElementById('propResult');
                resultBox.querySelector('.result-content').innerHTML = `
                    <div class="result-header">
                        <h4>Intervalo de ${confidenceLevel} de confiança</h4>
                        <p class="range-display">${lowerBound.toFixed(4)} < p < ${upperBound.toFixed(4)}</p>
                    </div>
                    <div class="result-details">
                        <p><span class="detail-label">Margem de erro:</span> ±${marginOfError.toFixed(4)}</p>
                        <p><span class="detail-label">Amplitude:</span> ${(upperBound - lowerBound).toFixed(4)}</p>
                    </div>
                    <div class="formula-box">
                        <div class="formula-header">Fórmula</div>
                        <div class="formula">p̂ ± z × √(p̂(1-p̂)/n)</div>
                        <div class="formula-values">
                            <p>= ${sampleProp.toFixed(4)} ± ${zValue} × √(${sampleProp.toFixed(4)}×${(1-sampleProp).toFixed(4)}/${sampleSize})</p>
                            <p>= ${sampleProp.toFixed(4)} ± ${marginOfError.toFixed(4)}</p>
                        </div>
                    </div>
                    <button class="copy-btn" onclick="copyResult('propResult')">Copiar</button>
                `;
                resultBox.style.display = 'block';
                scrollToResult(resultBox);
            } catch (error) {
                showToast('Erro no cálculo. Verifique os valores.');
                console.error(error);
            }
        }

        function calculateSampleSizeMean() {
            try {
                const desiredMargin = parseFloat(document.getElementById('desiredMargin').value);
                const popStdDev = parseFloat(document.getElementById('popStdDev').value);
                const zValue = parseFloat(document.getElementById('confidenceLevel3').value);
                
                if (isNaN(desiredMargin) || isNaN(popStdDev) || desiredMargin <= 0 || popStdDev <= 0) {
                    showToast('Valores inválidos. Verifique os dados.');
                    return;
                }
                
                const sampleSize = Math.ceil(Math.pow((zValue * popStdDev) / desiredMargin, 2));
                
                const confidenceLevel = document.getElementById('confidenceLevel3').options[
                    document.getElementById('confidenceLevel3').selectedIndex].text;
                
                const resultBox = document.getElementById('sampleSizeMeanResult');
                resultBox.querySelector('.result-content').innerHTML = `
                    <div class="result-header">
                        <h4>Tamanho de Amostra Necessário (${confidenceLevel})</h4>
                        <p class="result-value">${sampleSize}</p>
                    </div>
                    <div class="result-details">
                        <p>Para uma margem de erro de ±${desiredMargin}</p>
                        <p>Com desvio padrão populacional de ${popStdDev.toFixed(4)}</p>
                    </div>
                    <div class="formula-box">
                        <div class="formula-header">Fórmula</div>
                        <div class="formula">n = (z × σ / E)²</div>
                        <div class="formula-values">
                            <p>= (${zValue} × ${popStdDev.toFixed(4)} / ${desiredMargin.toFixed(4)})²</p>
                            <p>= ${sampleSize}</p>
                        </div>
                    </div>
                    <button class="copy-btn" onclick="copyResult('sampleSizeMeanResult')">Copiar</button>
                `;
                resultBox.style.display = 'block';
                scrollToResult(resultBox);
            } catch (error) {
                showToast('Erro no cálculo. Verifique os valores.');
                console.error(error);
            }
        }

        function calculateSampleSizeProp() {
            try {
                const estimatedProp = parseFloat(document.getElementById('estimatedProp').value);
                const desiredMargin = parseFloat(document.getElementById('desiredMarginProp').value);
                const zValue = parseFloat(document.getElementById('confidenceLevel4').value);
                
                if (isNaN(estimatedProp) || isNaN(desiredMargin) || desiredMargin <= 0 || estimatedProp < 0 || estimatedProp > 1) {
                    showToast('Valores inválidos. Verifique os dados.');
                    return;
                }
                
                const p = isNaN(estimatedProp) ? 0.5 : estimatedProp;
                const sampleSize = Math.ceil(Math.pow(zValue, 2) * p * (1 - p) / Math.pow(desiredMargin, 2));
                
                const confidenceLevel = document.getElementById('confidenceLevel4').options[
                    document.getElementById('confidenceLevel4').selectedIndex].text;
                
                const resultBox = document.getElementById('sampleSizePropResult');
                resultBox.querySelector('.result-content').innerHTML = `
                    <div class="result-header">
                        <h4>Tamanho de Amostra Necessário (${confidenceLevel})</h4>
                        <p class="result-value">${sampleSize}</p>
                    </div>
                    <div class="result-details">
                        <p>Para uma margem de erro de ±${desiredMargin.toFixed(4)}</p>
                        ${!isNaN(estimatedProp) ? `<p>Com proporção estimada de ${estimatedProp.toFixed(4)}</p>` : '<p>Com proporção desconhecida (usando 0.5)</p>'}
                    </div>
                    <div class="formula-box">
                        <div class="formula-header">Fórmula</div>
                        <div class="formula">n = z² × p̂(1-p̂) / E²</div>
                        <div class="formula-values">
                            <p>= ${zValue}² × ${p.toFixed(4)} × ${(1-p).toFixed(4)} / ${desiredMargin.toFixed(4)}²</p>
                            <p>= ${sampleSize}</p>
                        </div>
                    </div>
                    <button class="copy-btn" onclick="copyResult('sampleSizePropResult')">Copiar</button>
                `;
                resultBox.style.display = 'block';
                scrollToResult(resultBox);
            } catch (error) {
                showToast('Erro no cálculo. Verifique os valores.');
                console.error(error);
            }
        }

        function calculateErrorDifference() {
            try {
                const calculatedError = parseFloat(document.getElementById('calculatedError').value);
                const desiredError = parseFloat(document.getElementById('desiredError').value);
                
                if (isNaN(calculatedError) || isNaN(desiredError)) {
                    showToast('Valores inválidos. Verifique os dados.');
                    return;
                }
                
                const difference = calculatedError - desiredError;
                const differenceClass = difference > 0 ? 'positive-difference' : 'negative-difference';
                const differenceText = difference > 0 ? 'acima' : 'abaixo';
                
                const resultBox = document.getElementById('errorDiffResult');
                resultBox.querySelector('.result-content').innerHTML = `
                    <div class="result-header">
                        <h4>Diferença entre Erros</h4>
                        <p class="result-value ${differenceClass}">${Math.abs(difference).toFixed(4)} ${differenceText} do desejado</p>
                    </div>
                    <div class="result-details">
                        <p>Erro calculado: ${calculatedError.toFixed(4)}</p>
                        <p>Erro desejado: ${desiredError.toFixed(4)}</p>
                        <p>Diferença: <span class="${differenceClass}">${difference.toFixed(4)}</span></p>
                    </div>
                    <button class="copy-btn" onclick="copyResult('errorDiffResult')">Copiar</button>
                `;
                resultBox.style.display = 'block';
                scrollToResult(resultBox);
            } catch (error) {
                showToast('Erro no cálculo. Verifique os valores.');
                console.error(error);
            }
        }

        // Funções auxiliares
        function animateButton(button) {
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 150);
        }

        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }

        function scrollToResult(element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        window.copyResult = function(resultId) {
            const resultBox = document.getElementById(resultId);
            const textToCopy = resultBox.querySelector('.result-content').textContent;
            navigator.clipboard.writeText(textToCopy)
                .then(() => showToast('Resultado copiado!'))
                .catch(err => showToast('Falha ao copiar'));
        };

        // Modo escuro/claro
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '🌓';
        themeToggle.addEventListener('click', toggleTheme);
        document.querySelector('.tabs').appendChild(themeToggle);

        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
            themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        }

        // Inicialização
        updateDisplay();
    });
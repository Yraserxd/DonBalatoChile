document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendMessage');
    const visionButton = document.getElementById('visionButton');
    const imageInput = document.getElementById('imageInput');
    const branchButtons = document.querySelectorAll('.branch-button');
    const appContainer = document.querySelector('.app-container');
    const statusDot = document.querySelector('.status-dot');

    let selectedBranch = '';
    let cashierName = '';
    let cashierGender = '';
    let cashAmount = '';
    let debitAmount = '';
    let currentStep = ''; // To track conversation step

    // Function to update status dot color
    function updateStatusDot(isActive) {
        if (isActive) {
            statusDot.style.backgroundColor = 'var(--status-dot-active)';
        } else {
            statusDot.style.backgroundColor = 'var(--status-dot-inactive)';
        }
    }

    updateStatusDot(true);


    const branchMessages = {
        santiago: '¡Bienvenido a la capital! 🌆 Soy el bot de la sucursal Santiago.',
        serena: '¡Hola desde La Serena! 🌊 Donde el mar se une con el desierto. Soy tu asistente para el balance de caja.',
        copiapo: '¡Saludos desde el desierto! 🏜️ Bot de la sucursal Copiapó activo.',
        rengo: '¡Bienvenido a Rengo! 🏛️ Tu asistente local está listo.',
        andes: '¡Saludos desde Los Andes! ❄️ Donde la cordillera nos acompaña.',
        felipe: '¡Hola desde San Felipe! 🏛️ Tu asistente histórico.',
        vallenar: '¡Bienvenido a Vallenar! 🏘️ Tu bot local está aquí para ayudarte.'
    };

    // Branch selection handling
    branchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const branchClass = this.dataset.branch;
            const mapImage = document.getElementById('map-image');
            const mapTransition = document.querySelector('.map-transition');
            const welcomeMessage = document.querySelector('.welcome-message');
            const inputArea = document.querySelector('.input-area');
            const bubblesContainer = document.querySelector('.bubbles-container');

            // Load and handle map image
            mapImage.src = `assets/img/${branchClass}_map.jpg`;
            mapImage.onerror = () => {
                console.warn(`Map image for ${branchClass} not found`);
                transitionToBranch();
            };
            mapImage.onload = () => {
                mapTransition.classList.add('active');
                setTimeout(transitionToBranch, 2000);
            };

            function transitionToBranch() {
                mapTransition.classList.remove('active');
                appContainer.className = 'app-container ' + branchClass;
                
                // Asegurarnos que el avatar del bot no tenga animaciones
                const botAvatar = document.querySelector('.bot-avatar');
                const botFace = document.querySelector('.bot-face');
                if (botAvatar) {
                    botAvatar.style.transform = 'none';
                    botAvatar.style.transition = 'none';
                    botAvatar.style.animation = 'none';
                }
                if (botFace) {
                    botFace.style.transform = 'none';
                    botFace.style.transition = 'none';
                    botFace.style.animation = 'none';
                }
                
                // Hide welcome message and show chat with smooth transition
                welcomeMessage.style.opacity = '0';
                setTimeout(() => {
                    welcomeMessage.style.display = 'none';
                    inputArea.style.display = 'block';
                    setTimeout(() => {
                        inputArea.style.opacity = '1';
                    }, 50);
                }, 300);
                
                // Handle bubbles and fish for La Serena
                bubblesContainer.style.display = branchClass === 'serena' ? 'block' : 'none';
                if(branchClass === 'serena') {
                    createFish();
                } else {
                    document.querySelectorAll('.fish').forEach(fish => fish.remove());
                }

                // Start registration flow with welcome message
                console.log("Calling startRegistrationFlow with message:", branchMessages[branchClass]);
                startRegistrationFlow(branchMessages[branchClass]);

                // Add background only for La Serena
                if(branchClass === 'serena') {
                    const background = document.createElement('div');
                    background.className = 'video-background';
                    background.innerHTML = '<div class="static-background"></div>';
                    appContainer.prepend(background);
                } else {
                    const existingBg = document.querySelector('.video-background');
                    if(existingBg) existingBg.remove();
                }

                // Añadir estilos específicos para la barra de mensajes de La Serena
                if (branchClass === 'serena') {
                    inputArea.style.background = 'rgba(255, 255, 255, 0.25)';
                    inputArea.style.backdropFilter = 'blur(10px)';
                    inputArea.style.webkitBackdropFilter = 'blur(10px)';
                    inputArea.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                    inputArea.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                } else {
                    // Restablecer estilos por defecto para otras sucursales
                    inputArea.style.background = '';
                    inputArea.style.backdropFilter = '';
                    inputArea.style.webkitBackdropFilter = '';
                    inputArea.style.border = '';
                    inputArea.style.boxShadow = '';
                }
            }
        });
    });

    // --- Start Registration Flow ---
    function startRegistrationFlow(welcomeMessage) {
        console.log("startRegistrationFlow called with message:", welcomeMessage);
        chatMessages.innerHTML = '';
        addBotMessage(welcomeMessage);
        currentStep = 'askName';
        setTimeout(askForName, 500); // Delay to show welcome message first
    }

    // --- Step 1: Ask for Name ---
    function askForName() {
        addBotMessage('Antes de comenzar, ¿podrías decirme tu nombre? 😊');
        currentStep = 'waitForName';
    }

    // --- Step 2: Ask for Gender ---
    function askForGender() {
        addBotMessage(`Hola ${cashierName}, es un gusto ayudarte hoy. ¿Eres hombre 👨 o mujer 👩?`, { type: 'gender' });
        currentStep = 'waitForGender';
    }

    // --- Step 3: Ask about Cash ---
    function askAboutCash() {
        const niceComment = cashierGender === 'hombre' ? '¡excelente! 👍' : '¡maravilloso! ✨';
        addBotMessage(`¡${cashierName} ${niceComment}! Para empezar el balance de caja, ¿recibiste efectivo en tu caja hoy? 💰`, { type: 'confirm' });
        currentStep = 'waitForCashConfirmation';
    }

    // --- Step 4: Ask for Cash Amount ---
    function askForCashAmount() {
        addBotMessage('¿Cuánto efectivo recibiste en tu caja? 💸 Por favor, ingresa el monto.');
        currentStep = 'waitForCashAmount';
    }

    // --- Step 5: Confirm Cash Amount ---
    function askConfirmCashAmount() {
        const amountText = formatChileanCurrency(cashAmount);
        const amountInWords = numberToWords(parseInt(cashAmount.replace(/\./g, ''))); // Remove dots for parsing
        addBotMessage(`¿Estás seguro/a que la cantidad de efectivo recibida es de ${amountText} (${amountInWords} PESOS CHILENOS)? 🤔`, { type: 'confirm' });
        currentStep = 'waitForCashAmountConfirmation';
    }

    // --- Step 6: Ask about Debit ---
    function askAboutDebit() {
        addBotMessage('Perfecto, ahora dime, ¿recibiste pagos con débito en tu caja hoy? 💳', { type: 'confirm' });
        currentStep = 'waitForDebitConfirmation';
    }
     // --- Step 7: Ask for Debit Amount ---
     function askForDebitAmount() {
        addBotMessage('¿Cuánto débito recibiste en tu caja? 🧾 Por favor, ingresa el monto.');
        currentStep = 'waitForDebitAmount';
    }

    // --- Step 8: Confirm Debit Amount ---
    function askConfirmDebitAmount() {
        const amountText = formatChileanCurrency(debitAmount);
        const amountInWords = numberToWords(parseInt(debitAmount.replace(/\./g, ''))); // Remove dots for parsing
        addBotMessage(`¿Estás seguro/a que la cantidad de débito recibida es de ${amountText} (${amountInWords} PESOS CHILENOS)? 🤔`, { type: 'confirm' });
        currentStep = 'waitForDebitAmountConfirmation';
    }

    // --- Step 9: End of Flow (Example) ---
    function endRegistrationFlow() {
        addBotMessage('¡Excelente! Caja cuadrada. ✅ Gracias por tu colaboración. 😊');
        currentStep = 'flowComplete'; // Or reset to initial state if needed
        displayStatistics(); // Llamar a la función para mostrar estadísticas
    }

    // --- Function to Display Statistics ---
    function displayStatistics() {
        // Crear contenedor para las estadísticas
        const statsContainer = document.createElement('div');
        statsContainer.className = 'statistics-container';

        // Título de la sección
        const title = document.createElement('h3');
        title.textContent = 'Resumen de Caja 💰';
        statsContainer.appendChild(title);

        // Mostrar nombre del cajero
        const namePara = document.createElement('p');
        namePara.innerHTML = `<b>Cajero:</b> ${cashierName}`;
        statsContainer.appendChild(namePara);

        // Mostrar cantidad de efectivo
        const cashPara = document.createElement('p');
        const formattedCash = formatChileanCurrency(cashAmount); // Formatear moneda
        cashPara.innerHTML = `<b>Efectivo:</b> ${formattedCash}`;
        statsContainer.appendChild(cashPara);

        // Mostrar cantidad de débito
        const debitPara = document.createElement('p');
        const formattedDebit = formatChileanCurrency(debitAmount); // Formatear moneda
        debitPara.innerHTML = `<b>Débito:</b> ${formattedDebit}`;
        statsContainer.appendChild(debitPara);

        // Agregar el contenedor de estadísticas al chat
        chatMessages.appendChild(statsContainer);
    }

    // Send message function - Modified to handle conversation flow
    sendButton.addEventListener('click', function(event) {
        event.preventDefault();
        const messageText = userInput.value.trim();
        if (messageText) {
            addUserMessage(messageText);
            userInput.value = '';
            
            // Forzar actualización de la interfaz
            setTimeout(() => {
                switch(currentStep) {
                    case 'waitForName':
                        cashierName = messageText;
                        setTimeout(askForGender, 500);
                        break;
                    
                    case 'waitForCashAmount':
                        cashAmount = formatInputAmount(messageText);
                        setTimeout(askConfirmCashAmount, 500);
                        break;
                    
                    case 'waitForDebitAmount':
                        debitAmount = formatInputAmount(messageText);
                        setTimeout(askConfirmDebitAmount, 500);
                        break;
                    
                    default:
                        handleUserInput(messageText);
                        break;
                }
            }, 50);
        }
    });

    // Handle user input based on current conversation step
    function handleUserInput(text) {
        if (currentStep === 'flowComplete') {
            addBotMessage("Por favor selecciona una sucursal para comenzar nuevo registro");
        } else {
            // Respuesta genérica si no está en un paso específico
            addBotMessage("Estoy procesando tu solicitud...");
        }
    }

    // --- Format Input Amount Function ---
    function formatInputAmount(amount) {
        let number = amount.replace(/\D/g, ''); // Remove non-digits
        if (!number) return '';

        number = parseInt(number).toString(); // Ensure it's a number and back to string

        let formattedNumber = '';
        let count = 0;
        for (let i = number.length - 1; i >= 0; i--) {
            formattedNumber = number[i] + formattedNumber;
            count++;
            if (count === 3 && i !== 0) {
                formattedNumber = '.' + formattedNumber;
                count = 0;
            }
        }
        return formattedNumber;
    }


    // --- Format Chilean Currency Function ---
    function formatChileanCurrency(amount) {
        if (!amount) return '$0'; // Handle empty amount
        return '$' + amount;
    }

    // --- Function to convert numbers to words (in Spanish) ---
    function numberToWords(number) {
        if (isNaN(number)) {
            return 'Número no válido';
        }
        if (number === 0) {
            return 'Cero';
        }

        const unidades = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
        const decenas = ['', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
        const especiales = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
        const centenas = ['', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

        function convertirGrupo(n) {
            if (n === 0) return '';
            if (n < 10) return unidades[n];
            if (n >= 10 && n <= 19) return especiales[n - 10];
            if (n < 100) {
                const decena = Math.floor(n / 10);
                const unidad = n % 10;
                if (unidad === 0) return decenas[decena];
                return decenas[decena] + ' y ' + unidades[unidad];
            } else {
                const centena = Math.floor(n / 100);
                const resto = n % 100;
                if (resto === 0) return centenas[centena];
                return centenas[centena] + ' ' + convertirGrupo(resto);
            }
        }

        let palabras = '';
        if (number >= 1000000) {
            const millones = Math.floor(number / 1000000);
            const resto = number % 1000000;
            palabras += convertirGrupo(millones) + ' Millones';
            if (resto > 0) {
                palabras += ' ' + numberToWords(resto);
            }
        } else if (number >= 1000) {
            const miles = Math.floor(number / 1000);
            const resto = number % 1000;
            palabras += convertirGrupo(miles) + ' Mil';
            if (resto > 0) {
                palabras += ' ' + convertirGrupo(resto);
            }
        } else {
            palabras = convertirGrupo(number);
        }
        return palabras.charAt(0).toUpperCase() + palabras.slice(1); // Capitalize first letter
    }


    // Vision button (image upload)
    visionButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addImageMessage(e.target.result, 'user-message');
                setTimeout(() => {
                    simulateBotVisionResponse(e.target.result);
                }, 1000);
            };
            reader.readAsDataURL(file);
            imageInput.value = '';
        }
    });


    // --- Message Adding Functions ---
    function addUserMessage(text) {
        const messageDiv = createMessageElement(text, 'user-message');
        chatMessages.appendChild(messageDiv);
        scrollToBottom(); // ¡Asegurar scroll al agregar mensaje! ✅
    }

    function addBotMessage(text, options = null) {
        const messageDiv = createMessageElement(text, 'bot-message');
        if (options) {
            const optionsDiv = createOptionsElement(options);
            messageDiv.appendChild(optionsDiv);
        }
        chatMessages.appendChild(messageDiv);
        scrollToBottom(); // ¡Asegurar scroll al agregar mensaje! ✅
    }

    function addImageMessage(imageSrc, messageType) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', messageType);
        const imageElement = document.createElement('img');
        imageElement.src = imageSrc;
        imageElement.style.maxWidth = '100%';
        imageElement.style.borderRadius = '8px';
        messageDiv.appendChild(imageElement);
        chatMessages.appendChild(messageDiv);
    }


    // --- Message Element Creation ---
    function createMessageElement(text, messageType) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', messageType);
        const textElement = document.createElement('p');
        textElement.textContent = text;
        messageDiv.appendChild(textElement);
        return messageDiv;
    }


    // --- Simulate Bot Responses (No longer needed for flow, but kept for vision) ---
    function simulateBotResponse(userMessage) {
        const responses = [
            "¡Hola! ¿En qué puedo ayudarte hoy?",
            "Recibí tu mensaje. Estoy pensando...",
            "Un momento por favor, estoy consultando la información.",
            "Gracias por tu mensaje. Te responderé en breve."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addBotMessage(randomResponse);
    }

    function simulateBotVisionResponse(imageSrc) {
        addBotMessage("¡Linda imagen! Estoy procesándola... 👀");
        setTimeout(() => {
            addBotMessage("Hmm, parece ser... ¡una foto muy interesante! 🤔", { type: 'confirm' });
        }, 2000);
    }


    // --- Option Buttons Creation ---
    function createOptionsElement(options) {
        const optionsDiv = document.createElement('div');
        if (options.type === 'gender') {
            optionsDiv.className = 'gender-options';
            optionsDiv.appendChild(createOptionButton('Hombre', 'hombre', 'gender', '👨', '#007AFF')); // Añadido emoji y color
            optionsDiv.appendChild(createOptionButton('Mujer', 'mujer', 'gender', '👩', '#FF2D55')); // Añadido emoji y color
        } else if (options.type === 'confirm') {
            optionsDiv.className = 'confirm-options';
            optionsDiv.appendChild(createOptionButton('Sí', 'yes', 'confirm', '', '', 'yes')); // Añadido data-option-type-confirm = "yes"
            optionsDiv.appendChild(createOptionButton('No', 'no', 'confirm', '', '', 'no'));  // Añadido data-option-type-confirm = "no"
        }
        return optionsDiv;
    }


    function createOptionButton(text, value, optionType, emoji = '', color = '', confirmType = '') { // Añadido confirmType para data attribute
        const button = document.createElement('button');
        button.className = 'option-button ripple';

        if (emoji) {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emoji;
            button.appendChild(emojiSpan);
        }
        button.appendChild(document.createTextNode(text)); // Añadir texto después del emoji si existe

        button.dataset.option = value;
        button.dataset.optionType = optionType;
        if (confirmType) { // Si es un botón de confirmación, añadir data attribute
            button.dataset.optionTypeConfirm = confirmType;
        }


        if (optionType === 'gender' && color) {
            button.style.borderColor = color; // Establecer color del borde si es botón de género
        }


        button.addEventListener('click', () => {
            handleOptionSelection(value, optionType);
        });
        return button;
    }


    // --- Handle Option Selection ---
    function handleOptionSelection(optionValue, optionType) {
        if (optionType === 'gender') {
            cashierGender = optionValue;
            addBotMessage(`Entendido, eres ${optionValue}. 👍`);
            setTimeout(askAboutCash, 500);
        } else if (optionType === 'confirm') {
            if (currentStep === 'waitForCashConfirmation') {
                if (optionValue === 'yes') {
                    setTimeout(askForCashAmount, 500);
                } else {
                    setTimeout(askAboutDebit, 500); // If no cash, skip to debit
                }
            } else if (currentStep === 'waitForCashAmountConfirmation') {
                if (optionValue === 'yes') {
                    setTimeout(askAboutDebit, 500);
                } else {
                    cashAmount = ''; // Clear previous amount for correction
                    setTimeout(askForCashAmount, 500); // Re-ask for cash amount
                }
            } else if (currentStep === 'waitForDebitConfirmation') {
                if (optionValue === 'yes') {
                    setTimeout(askForDebitAmount, 500);
                } else {
                    debitAmount = '0'; // Assuming 0 debit if no
                    setTimeout(askConfirmDebitAmount, 500); // Confirm 0 debit
                }
            } else if (currentStep === 'waitForDebitAmountConfirmation') {
                if (optionValue === 'yes') {
                    setTimeout(endRegistrationFlow, 500); // End flow if debit confirmed
                } else {
                    debitAmount = ''; // Clear previous amount for correction
                    setTimeout(askForDebitAmount, 500); // Re-ask for debit amount
                }
            }
        }
    }


    // --- Accessibility ---
    visionButton.addEventListener('click', () => {
        imageInput.focus();
    });
    sendButton.addEventListener('click', () => {
        userInput.focus();
    });


    // ---  Enter to Send ---
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const messageText = userInput.value.trim();
            if (messageText) {
                addUserMessage(messageText);
                userInput.value = '';
                // Resto de la lógica de manejo de mensajes...
            }
        }
    });

    initParticles();

    // Manejo de opciones de género
    function setupGenderOptionsHandler() {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const hasGenderOptions = document.querySelector('.bot-message .gender-options');
                    const hasConfirmOptions = document.querySelector('.bot-message .confirm-options');
                    const inputArea = document.querySelector('.input-area');
                    
                    if (hasGenderOptions || hasConfirmOptions) {
                        if (hasGenderOptions) {
                            hasGenderOptions.closest('.bot-message').classList.add('has-gender-options');
                        }
                        if (hasConfirmOptions) {
                            hasConfirmOptions.closest('.bot-message').classList.add('has-confirm-options');
                        }
                        
                        if (inputArea) {
                            inputArea.style.display = 'none';
                        }
                    } else {
                        const noOptionsVisible = !document.querySelector('.bot-message.has-gender-options, .bot-message.has-confirm-options');
                        if (noOptionsVisible && inputArea) {
                            inputArea.style.display = 'flex';
                        }
                    }
                }
            });
        });
        
        observer.observe(chatContainer, { childList: true, subtree: true });
    }
    
    setupGenderOptionsHandler();

    // Función para desplazamiento automático del chat (MODIFICADO PARA FORZAR ACTUALIZACIÓN Y DEBOUNCE)
    function setupAutoScroll() {
        const chatMessages = document.getElementById('chatMessages');
        const userInput = document.getElementById('userInput');

        if (!chatMessages || !userInput) return;

        // Función para desplazar al final - ¡SIMPLIFICADA! 🧹
        function scrollToBottom() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            console.log('Scrolling to bottom:', chatMessages.scrollHeight, chatMessages.scrollTop); // ¡Espiando! 👀
        }

        // Función debounce (la dejamos como está)
        function debounce(func, delay) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        }

        const debouncedScrollToBottomOnInput = debounce(scrollToBottom, 50);

        // Observador de cambios en el chat (sin cambios)
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    scrollToBottom();
                }
            });
        });

        observer.observe(chatMessages, {
            childList: true,
            subtree: true
        });

        scrollToBottom(); // Scroll inicial

        // Desplazar al final cuando se envía un mensaje
        const sendButton = document.querySelector('.send-button');
        if (sendButton) {
            sendButton.addEventListener('click', function() {
                setTimeout(scrollToBottom, 100);
            });
        }

        if (userInput) {
            // Listener para el evento 'focus' (sin cambios)
            userInput.addEventListener('focus', function() {
                scrollToBottom();
            });

            // Listener para el evento 'input' - ¡CAMBIO IMPORTANTE! 🔥
            userInput.addEventListener('input', function() {
                scrollToBottom(); // ¡Llamada DIRECTA a scrollToBottom! 🚀
                // debouncedScrollToBottomOnInput(); // <- Desactivamos debounce por ahora
            });
        }
    }

    // Inicializar cuando se carga la página
    setupAutoScroll();
});

// Modificar el sistema de partículas para móvil
function createParticles() {
    const container = document.querySelector('.app-container');
    const particleCount = window.innerWidth < 768 ? 20 : 50; // Menos partículas en móvil
    
    for(let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            --size: ${Math.random() * 3 + 1}px;
            --x: ${Math.random() * 100}%;
            --y: ${Math.random() * 100}%;
            --duration: ${Math.random() * 3 + 3}s;
            --delay: ${Math.random() * 1}s;
        `;
        container.appendChild(particle);
    }
}

// Mejorar respuesta táctil
document.addEventListener('touchstart', function() {}, { passive: true });

// Añadir esta función al inicio del archivo
function randomColor() {
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEEAD', 'FF9F1C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Modificar la creación de peces
function createFish() {
    const container = document.querySelector('.bubbles-container');
    if (!container) return;

    // Limpiar peces existentes
    container.querySelectorAll('.fish').forEach(fish => fish.remove());

    for (let i = 0; i < 12; i++) {
        const fish = document.createElement('div');
        fish.className = 'fish';
        
        fish.style.cssText = `
            top: ${Math.random() * 90}%;
            left: ${Math.random() * 100}%;
            animation: 
                fishSwim ${Math.random() * 20 + 15}s linear infinite,
                fishWobble ${Math.random() * 2 + 1}s ease-in-out infinite;
            transform: 
                scale(${Math.random() * 0.4 + 0.6})
                scaleX(${Math.random() > 0.5 ? 1 : -1});
            opacity: ${Math.random() * 0.4 + 0.4};
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(fish);
    }
}
createFish();

function initParticles() {
    const container = document.querySelector('.app-container');
    const particleCount = 30;
    
    for(let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            --x: ${Math.random() * 100}%;
            --y: ${Math.random() * 100}%;
            --size: ${Math.random() * 4 + 2}px;
            --delay: ${Math.random() * 2}s;
            --duration: ${Math.random() * 8 + 4}s;
            background: hsl(${Math.random() * 360}, 70%, 60%);
        `;
        container.appendChild(particle);
    }
}

// Agregar funcionalidad para enviar mensajes con Enter
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos
    const userInput = document.getElementById('userInput');
    const sendButton = document.querySelector('.send-button');
    
    // Asegurar que el botón de enviar sea visible
    if (sendButton) {
        sendButton.style.display = 'flex';
        sendButton.style.visibility = 'visible';
        console.log('Botón de enviar configurado');
    }
    
    // Función para enviar mensajes
    function sendMessage() {
        if (userInput && userInput.value.trim()) {
            console.log('Enviando mensaje: ' + userInput.value);
            // Simular clic en el botón de enviar
            if (sendButton) {
                sendButton.click();
            }
        }
    }
    
    // Agregar evento de tecla Enter al input
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        
        console.log('Evento de tecla Enter agregado al input');
    }
});

const chatArea = document.getElementById('chatArea');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

let userName = "";
let userAddress = "";
let selectedMedicine = "";
let selectedPrice = "";
let genericPrice = "";

function getRandomPrice(min, max) {
    return Number((Math.random() * (max - min) + min).toFixed(2));
}

function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getMedicinePrice(medicine) {
    const value = getRandomPrice(0, 30);
    return formatCurrency(value);
}

function getGenericPrice(basePrice) {
    const numeric = Number(basePrice.replace('R$ ', '').replace(',', '.'));
    const max = Math.max(0, numeric);
    const value = getRandomPrice(0, max);
    return formatCurrency(value);
}

function resetOrder() {
    selectedMedicine = "";
    selectedPrice = "";
    genericPrice = "";
}

function setSelectedMedicine(medicine) {
    selectedMedicine = medicine;
    selectedPrice = getMedicinePrice(medicine);
    genericPrice = getGenericPrice(selectedPrice);
}

const chatbotDialog = {
    currentNode: 'start',
    nodes: {
        start: {
            response: "Olá! Eu sou o Amparo, seu assistente virtual. 👵👴 Eu ajudo o(a) senhor(a) a comprar um remédio de forma simples e tranquila. Como quer começar?",
            options: [
                { text: "Quero comprar um remédio 💊", next: 'offer_medicine' },
                { text: "Preciso de ajuda 📝", next: 'offer_help' }
            ]
        },
        offer_help: {
            response: "Sem problema! Aqui é fácil: basta clicar em um botão azul e eu guio cada passo. Quer ver as opções de remédios primeiro?",
            options: [
                { text: "Sim, quero ver", next: 'offer_medicine' },
                { text: "Ainda tenho dúvida", next: 'explain_steps' }
            ]
        },
        explain_steps: {
            response: "Primeiro escolhemos o remédio. Depois peço seu nome, seu endereço e a forma de pagamento. Tudo em etapas curtas e com calma.",
            options: [
                { text: "Entendi, vamos comprar", next: 'offer_medicine' }
            ]
        },
        offer_medicine: {
            response: "Ótimo! Qual remédio o(a) senhor(a) prefere?",
            options: [
                { text: "Paracetamol 500mg", next: 'offer_selected' },
                { text: "Loratadina 10mg", next: 'offer_selected' },
                { text: "Outro remédio", next: 'ask_custom_medicine' }
            ]
        },
        ask_custom_medicine: {
            response: "Sem problema! Por favor, digite o nome do remédio que deseja e aperte o botão azul de enviar.",
            options: []
        },
        offer_selected: {
            response: () => {
                const medicine = selectedMedicine || 'o remédio escolhido';
                const price = selectedPrice || formatCurrency(14.90);
                return `Encontrei ${medicine} por ${price}. Esse valor está bom para o(a) senhor(a)?`;
            },
            options: [
                { text: "Sim, está bom", next: 'ask_name' },
                { text: "Não, está caro", next: 'offer_generic' }
            ]
        },
        offer_generic: {
            response: () => `Tudo bem! Encontrei um genérico equivalente por ${genericPrice}, que é mais acessível. Deseja continuar com essa compra ou prefere procurar outra medicação?`,
            options: [
                { text: "Continuar com essa compra", next: 'ask_name' },
                { text: "Procurar outra medicação", next: 'restart_chat' }
            ]
        },
        restart_chat: {
            response: "Claro! Vamos começar de novo para encontrar o remédio ideal. Qual remédio o(a) senhor(a) precisa?",
            options: [
                { text: "Ver opções de remédio", next: 'offer_medicine' }
            ]
        },
        ask_name: {
            response: "Que maravilha! Agora preciso saber para quem vou enviar. Por favor, clique ali embaixo onde diz 'Digite uma mensagem...' e escreva o seu NOME COMPLETO para mim, e depois aperte o botão azul de enviar.",
            options: []
        },
        ask_address: {
            response: () => `Muito prazer, ${userName}! Agora, para o correio entregar certinho, digite o seu ENDEREÇO (Nome da Rua, Número e Bairro) e me envie.`,
            options: []
        },
        confirm_info: {
            response: () => `Perfeito, ${userName}. Você mora em ${userAddress}, certo? É importante confirmar para o pedido chegar direitinho.`,
            options: [
                { text: "Sim, está certo", next: 'order_summary' },
                { text: "Não, quero corrigir", next: 'ask_address' }
            ]
        },
        order_summary: {
            response: () => `Obrigado, ${userName}! Você escolheu ${selectedMedicine} por ${selectedPrice} e iremos entregar em ${userAddress}. Está tudo certo?`,
            options: [
                { text: "Sim, confirme", next: 'confirm_order' },
                { text: "Ainda quero mudar", next: 'offer_medicine' }
            ]
        },
        confirm_order: {
            response: "Perfeito! Agora escolha a forma de pagamento que for mais fácil para o(a) senhor(a).",
            options: [
                { text: "📄 Boleto Bancário", next: 'finish_boleto' },
                { text: "💳 Cartão de Crédito", next: 'finish_card' },
                { text: "📱 Pix", next: 'finish_pix' }
            ]
        },
        finish_boleto: {
            response: () => `Tudo certo! O seu pedido de remédio foi confirmado no valor de ${selectedPrice}. Vou gerar o boleto agora. O Amparo agradece a confiança, tenha um ótimo dia! 💙`,
            options: []
        },
        finish_card: {
            response: () => `Tudo certo! O pagamento de ${selectedPrice} foi aprovado com cartão. O remédio chegará em até 3 dias! O Amparo agradece a confiança! 💙`,
            options: []
        },
        finish_pix: {
            response: () => {
                const pixKey = generatePixKey();
                return `Tudo certo! O seu pedido foi criado. Use a chave PIX abaixo para pagar pelo aplicativo do banco:\n\n${pixKey}\n\nValor: ${selectedPrice}\n\nO Amparo agradece a confiança! 💙`;
            },
            options: []
        }
    }
};

function generatePixKey() {
    const segments = [
        Math.random().toString(36).slice(2, 6).toUpperCase(),
        Math.random().toString(36).slice(2, 6).toUpperCase(),
        Math.floor(1000 + Math.random() * 9000).toString(),
        Math.random().toString(36).slice(2, 6).toUpperCase()
    ];
    return segments.join('-');
}

function addMessage(text, isSent) {
    const row = document.createElement('div');
    row.className = `message-row ${isSent ? 'sent' : ''}`;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${isSent ? 'sent' : 'received'}`;

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    if (isSent) {
        const blueTick = document.createElement('img');
        blueTick.src = "https://image.shutterstock.com/image-vector/blue-tick-vector-correct-mark-260nw-1021487673.jpg";
        blueTick.className = 'blue-tick';
        time.appendChild(blueTick);
    }

    bubble.appendChild(textDiv);
    bubble.appendChild(time);
    row.appendChild(bubble);

    chatArea.insertBefore(row, typingIndicator);
    scrollToBottom();
}

function addOptions(nodeKey) {
    const node = chatbotDialog.nodes[nodeKey];
    if (!node.options || node.options.length === 0) return;

    const row = document.createElement('div');
    row.className = 'message-row';
    row.id = 'tempOptions';

    const container = document.createElement('div');
    container.className = 'options-container';

    node.options.forEach(option => {
        const button = document.createElement('div');
        button.className = 'option-bubble';
        button.textContent = option.text;
        button.onclick = () => selectOption(option.text, option.next);
        container.appendChild(button);
    });

    row.appendChild(container);
    chatArea.insertBefore(row, typingIndicator);
    scrollToBottom();
}

function removeTempOptions() {
    const optionsRow = document.getElementById('tempOptions');
    if (optionsRow) {
        optionsRow.remove();
    }
}

function selectOption(optionText, nextNode) {
    removeTempOptions();
    addMessage(optionText, true);

    const previousNode = chatbotDialog.currentNode;

    if (nextNode === 'offer_selected') {
        setSelectedMedicine(optionText);
    }

    if (previousNode === 'offer_generic' && optionText.includes('Continuar')) {
        selectedPrice = genericPrice;
        selectedMedicine = `genérico de ${selectedMedicine}`;
    }

    if (nextNode === 'restart_chat') {
        resetOrder();
    }

    chatbotDialog.currentNode = nextNode;
    setTimeout(() => showBotResponse(nextNode), 1000);
}

function showBotResponse(nodeKey) {
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    setTimeout(() => {
        typingIndicator.style.display = 'none';

        const node = chatbotDialog.nodes[nodeKey];
        let responseText = typeof node.response === 'function' ? node.response() : node.response;

        addMessage(responseText, false);
        setTimeout(() => addOptions(nodeKey), 300);
    }, 1400);
}

function handleUserInput() {
    const text = textInput.value.trim();
    if (text === "") return;

    textInput.value = "";
    toggleSendButton();
    addMessage(text, true);

    if (chatbotDialog.currentNode === 'ask_custom_medicine') {
        setSelectedMedicine(text);
        chatbotDialog.currentNode = 'offer_selected';
        setTimeout(() => showBotResponse('offer_selected'), 1000);

    } else if (chatbotDialog.currentNode === 'ask_name') {
        userName = text;
        chatbotDialog.currentNode = 'ask_address';
        setTimeout(() => showBotResponse('ask_address'), 1000);

    } else if (chatbotDialog.currentNode === 'ask_address') {
        userAddress = text;
        chatbotDialog.currentNode = 'confirm_info';
        setTimeout(() => showBotResponse('confirm_info'), 1000);

    } else {
        const optionsRow = document.getElementById('tempOptions');
        if (optionsRow) {
            setTimeout(() => {
                addMessage("Por favor, clique em um dos botões azuis acima para me ajudar a entender melhor. 😊", false);
            }, 1000);
        }
    }
}

function toggleSendButton() {
    const hasText = textInput.value.trim().length > 0;
    sendBtn.disabled = !hasText;
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function initChat() {
    toggleSendButton();
    setTimeout(() => {
        addMessage("Olá, Amparo. Preciso de ajuda para comprar um remédio.", true);
        setTimeout(() => showBotResponse('start'), 1200);
    }, 500);
}

document.addEventListener('DOMContentLoaded', initChat);
textInput.addEventListener('input', toggleSendButton);
textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleUserInput();
    }
});
sendBtn.addEventListener('click', handleUserInput);

function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

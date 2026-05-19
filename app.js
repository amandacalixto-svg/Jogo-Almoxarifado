/**
 * ==========================================================================
 * STOCKMASTER - MOTOR DO JOGO E SINTETIZADOR DE ÁUDIO
 * Lógica funcional limpa, responsiva e divertida em JavaScript Vanilla
 * ==========================================================================
 */

// --- PRODUTOS DISPONÍVEIS ---
const PRODUCTS = {
    cold: [
        { name: "Sorvete de Baunilha", icon: "snowflake" },
        { name: "Iogurte de Morango", icon: "snowflake" },
        { name: "Peixe Fresco", icon: "snowflake" },
        { name: "Leite Integral", icon: "snowflake" }
    ],
    normal: [
        { name: "Smartphone 5G", icon: "package" },
        { name: "Fone Bluetooth", icon: "package" },
        { name: "Teclado Mecânico", icon: "package" },
        { name: "Console Retro", icon: "package" }
    ],
    fragile: [
        { name: "Taças de Cristal", icon: "gem" },
        { name: "Vaso de Cerâmica", icon: "gem" },
        { name: "Espelho de Camarim", icon: "gem" },
        { name: "Lâmpadas Vintage", icon: "gem" }
    ]
};

// --- CONTROLE DE EFEITOS SONOROS (WEB AUDIO API) ---
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playClick() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.08);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Acorde maior)

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0.08, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0, now + idx * 0.06 + 0.15);

            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.15);
        });
    }

    playFailure() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playUpgrade() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [349.23, 440.00, 523.25, 659.25, 783.99]; // F4, A4, C5, E5, G5

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.08, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0, now + idx * 0.05 + 0.25);

            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.25);
        });
    }

    playWarning() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        [0, 0.15].forEach(delay => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = "triangle";
            osc.frequency.setValueAtTime(880, now + delay);
            osc.frequency.linearRampToValueAtTime(750, now + delay + 0.1);

            gain.gain.setValueAtTime(0.1, now + delay);
            gain.gain.linearRampToValueAtTime(0, now + delay + 0.1);

            osc.start(now + delay);
            osc.stop(now + delay + 0.1);
        });
    }

    playBreak() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "square";
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}

// --- CLASSE PRINCIPAL DO JOGO ---
class StockMasterGame {
    constructor() {
        this.sounds = new SoundSynth();
        
        // Configurações de Estado do Jogo
        this.money = 250;
        this.moneyEarnedToday = 0;
        this.reputation = 100; // Pct de 0 a 100
        this.day = 1;
        this.quota = 200; // Meta de faturamento diário
        
        // Níveis de Upgrade
        this.upgrades = {
            space: 0,    // 0 = 12 slots, 1 = 16 slots, 2 = 20 slots, 3 = 24 slots
            cooling: 0,  // 0 = 5% decay/s, 1 = 2% decay/s, 2 = 0% decay/s (Freezer absoluto)
            bot: 0,      // 0 = desligado, 1 = organiza a cada 12s, 2 = organiza a cada 6s
            express: 0   // 0 = base (10s), 1 = rápido (7.5s), 2 = super (5s)
        };

        this.upgradeCosts = {
            space: [200, 400, 700],
            cooling: [150, 300],
            bot: [350, 600],
            express: [250, 500]
        };

        // Inventários
        this.warehouseSlots = []; // Slots do galpão
        this.dockSlots = [];      // Slots da doca (máx 4 inicial, 6 no upgrade)
        this.orders = [];         // Pedidos ativos
        this.nextOrderId = 101;
        
        // Seleções de Interação
        this.selectedDockIndex = null;
        this.selectedWarehouseIndex = null;
        
        // Controles de Timers e Loops
        this.intervals = {};
        this.gameActive = false;
        
        // Estatísticas para Fim de Jogo
        this.stats = {
            dispatched: 0,
            spoiled: 0,
            earned: 0
        };

        this.activeEvent = null;
        this.eventTimeout = null;

        // Limite da doca
        this.maxDockSize = 4;
        
        // Variáveis de Recorde
        this.highScore = parseInt(localStorage.getItem("stockmaster_highscore") || "0");
    }

    // Inicializa o jogo e vincula eventos
    init() {
        this.bindEvents();
        this.sounds.muted = localStorage.getItem("stockmaster_muted") === "true";
        this.updateSoundButtonVisual();
        
        // Exibir modal de tutorial na primeira vez
        document.getElementById("modal-tutorial").style.display = "flex";
        lucide.createIcons();
    }

    bindEvents() {
        // Modais e Início
        document.getElementById("btn-start-game").addEventListener("click", () => {
            this.sounds.playClick();
            document.getElementById("modal-tutorial").style.display = "none";
            this.startGame();
        });

        document.getElementById("btn-restart-game").addEventListener("click", () => {
            this.sounds.playClick();
            document.getElementById("modal-gameover").style.display = "none";
            this.resetGame();
            this.startGame();
        });

        document.getElementById("btn-next-day").addEventListener("click", () => {
            this.sounds.playClick();
            document.getElementById("modal-daysuccess").style.display = "none";
            this.startNextDay();
        });

        document.getElementById("btn-restart").addEventListener("click", () => {
            this.sounds.playClick();
            if (confirm("Deseja realmente reiniciar o jogo do zero?")) {
                this.resetGame();
                this.startGame();
            }
        });

        document.getElementById("btn-help").addEventListener("click", () => {
            this.sounds.playClick();
            document.getElementById("modal-tutorial").style.display = "flex";
        });

        document.getElementById("btn-sound").addEventListener("click", () => {
            this.sounds.muted = !this.sounds.muted;
            localStorage.setItem("stockmaster_muted", this.sounds.muted);
            this.sounds.playClick();
            this.updateSoundButtonVisual();
        });

        // Upgrades Loja
        document.getElementById("btn-upgrade-space").addEventListener("click", () => this.buyUpgrade("space"));
        document.getElementById("btn-upgrade-cooling").addEventListener("click", () => this.buyUpgrade("cooling"));
        document.getElementById("btn-upgrade-bot").addEventListener("click", () => this.buyUpgrade("bot"));
        document.getElementById("btn-upgrade-express").addEventListener("click", () => this.buyUpgrade("express"));
    }

    updateSoundButtonVisual() {
        const btn = document.getElementById("btn-sound");
        const icon = document.getElementById("icon-sound");
        if (this.sounds.muted) {
            icon.setAttribute("data-lucide", "volume-x");
            btn.classList.add("btn-secondary");
        } else {
            icon.setAttribute("data-lucide", "volume-2");
            btn.classList.remove("btn-secondary");
        }
        lucide.createIcons();
    }

    // Retorna a capacidade atual do armazém baseado no upgrade de espaço
    getCapacity() {
        const levels = [12, 16, 20, 24];
        return levels[this.upgrades.space];
    }

    // Define a categoria das prateleiras baseado no index
    getShelfTypeByIndex(index, capacity) {
        if (index < capacity * 0.25) {
            return "cold"; // Geladeira
        } else if (index >= capacity * 0.75) {
            return "fragile"; // Área Segura
        } else {
            return "normal"; // Estoque Geral
        }
    }

    // Inicializa o grid de prateleiras limpo
    initWarehouse() {
        const capacity = this.getCapacity();
        this.warehouseSlots = [];
        for (let i = 0; i < capacity; i++) {
            this.warehouseSlots.push({
                id: i,
                shelfType: this.getShelfTypeByIndex(i, capacity),
                item: null
            });
        }
    }

    // Inicia um jogo novo
    startGame() {
        this.initWarehouse();
        this.dockSlots = [];
        this.orders = [];
        this.selectedDockIndex = null;
        this.selectedWarehouseIndex = null;
        
        // Gerar itens iniciais na doca
        for (let i = 0; i < 3; i++) {
            this.generateDockItem();
        }

        // Gerar pedidos iniciais
        this.generateOrder();
        this.generateOrder();

        this.gameActive = true;
        this.moneyEarnedToday = 0;

        // Iniciar Loops de Tempo
        this.startLoops();
        this.renderAll();
    }

    // Para todos os loops ativos
    stopLoops() {
        Object.keys(this.intervals).forEach(key => {
            clearInterval(this.intervals[key]);
        });
        if (this.eventTimeout) clearTimeout(this.eventTimeout);
    }

    // Inicia os loops de rotina do jogo
    startLoops() {
        this.stopLoops();

        // 1. Loop Principal (Segundos): Atualiza frescor dos alimentos, tempo dos pedidos e temporizadores
        this.intervals.main = setInterval(() => {
            if (!this.gameActive) return;
            
            // Decréscimo do tempo dos pedidos
            let ordersChanged = false;
            this.orders.forEach(order => {
                order.timeLeft--;
                if (order.timeLeft <= 0) {
                    ordersChanged = true;
                }
            });

            // Lida com pedidos expirados
            const expiredOrders = this.orders.filter(o => o.timeLeft <= 0);
            if (expiredOrders.length > 0) {
                expiredOrders.forEach(o => {
                    this.reputation -= 10;
                    this.sounds.playFailure();
                    this.showDockNotification("Pedido Atrasado!", `O pedido ${o.id} expirou. Reputação -10%`, "danger");
                });
                this.orders = this.orders.filter(o => o.timeLeft > 0);
                this.checkGameOver();
            }

            // Atualiza o frescor dos alimentos guardados no galpão
            this.warehouseSlots.forEach((slot, index) => {
                if (slot.item && slot.item.type === "cold") {
                    let decayRate = 3; // Taxa padrão fora da geladeira
                    
                    if (slot.shelfType === "cold") {
                        // Dentro da geladeira reduz o decaimento dependendo do upgrade
                        if (this.upgrades.cooling === 0) decayRate = 0.5;
                        else if (this.upgrades.cooling === 1) decayRate = 0.1;
                        else decayRate = 0; // Freezer Total
                    }

                    // Se houver evento "Onda de Calor" alimentos estragam mais rápido
                    if (this.activeEvent && this.activeEvent.id === "heatwave") {
                        decayRate *= 2;
                    }

                    slot.item.freshness -= decayRate;
                    if (slot.item.freshness <= 0 && !slot.item.spoiled) {
                        slot.item.spoiled = true;
                        slot.item.name = "Alimento Estragado 🗑️";
                        this.sounds.playBreak();
                        this.reputation -= 3;
                        this.stats.spoiled++;
                        this.showDockNotification("Alimento Estragado!", "Reputação -3%. Remova-o do estoque.", "danger");
                        this.checkGameOver();
                    }
                }
            });

            // Risco de Frágeis quebrarem fora do setor seguro
            this.warehouseSlots.forEach(slot => {
                if (slot.item && slot.item.type === "fragile" && slot.shelfType !== "fragile" && !slot.item.broken) {
                    // 3% de chance de quebrar a cada segundo fora da prateleira segura
                    if (Math.random() < 0.03) {
                        slot.item.broken = true;
                        slot.item.name = "Item Quebrado 🗑️";
                        this.sounds.playBreak();
                        this.reputation -= 4;
                        this.stats.spoiled++;
                        this.showDockNotification("Mercadoria Quebrada!", "Item frágil quebrou fora do setor correto. Reputação -4%.", "danger");
                        this.checkGameOver();
                    }
                }
            });

            this.renderAll();
        }, 1000);

        // 2. Loop de Entrada de Cargas (Doca)
        this.resetDockInterval();

        // 3. Loop de Pedidos de Clientes
        this.intervals.orders = setInterval(() => {
            if (!this.gameActive) return;
            // Se houver menos de 4 pedidos, há chance de chegar um novo
            if (this.orders.length < 4) {
                this.generateOrder();
                this.renderOrders();
            }
        }, 15000); // A cada 15s

        // 4. Robô Auxiliar (Automação de Doca)
        this.resetBotInterval();

        // 5. Eventos Randômicos Dinâmicos (A cada 45 segundos)
        this.intervals.events = setInterval(() => {
            if (!this.gameActive) return;
            if (Math.random() < 0.4) {
                this.triggerRandomEvent();
            }
        }, 45000);
    }

    // Configura o tempo de chegada de novas cargas
    resetDockInterval() {
        if (this.intervals.dock) clearInterval(this.intervals.dock);

        let delay = 10000; // Base: 10s
        if (this.upgrades.express === 1) delay = 7500;
        else if (this.upgrades.express === 2) delay = 5000;

        // Eventos afetam a velocidade da doca
        if (this.activeEvent && this.activeEvent.id === "blackfriday") {
            delay *= 0.5; // Doca duas vezes mais rápida
        }

        this.intervals.dock = setInterval(() => {
            if (!this.gameActive) return;
            this.generateDockItem();
            this.renderDock();
        }, delay);
    }

    // Configura a velocidade de atuação do robô assistente
    resetBotInterval() {
        if (this.intervals.bot) clearInterval(this.intervals.bot);
        if (this.upgrades.bot === 0) return;

        let delay = this.upgrades.bot === 1 ? 12000 : 6000; // 12s ou 6s

        this.intervals.bot = setInterval(() => {
            if (!this.gameActive) return;
            this.runRoboticAssistant();
        }, delay);
    }

    // Executa uma ação automática de arrumação do robô assistente
    runRoboticAssistant() {
        if (this.dockSlots.length === 0) return;

        // Procura o primeiro item da doca
        const itemToMove = this.dockSlots[0];
        // Acha uma vaga apropriada no armazém
        const targetSlot = this.warehouseSlots.find(slot => slot.shelfType === itemToMove.type && slot.item === null);

        if (targetSlot) {
            // Move item automaticamente
            targetSlot.item = this.dockSlots.shift();
            this.sounds.playClick();
            this.showDockNotification("Arrumação Automática", `Robô guardou "${targetSlot.item.name}" no galpão.`, "info");
            this.selectedDockIndex = null;
            this.renderDock();
            this.renderWarehouse();
        }
    }

    // Reinicia o jogo do zero
    resetGame() {
        this.money = 250;
        this.moneyEarnedToday = 0;
        this.reputation = 100;
        this.day = 1;
        this.quota = 200;
        
        this.upgrades = { space: 0, cooling: 0, bot: 0, express: 0 };
        this.maxDockSize = 4;
        this.activeEvent = null;
        
        this.stats = { dispatched: 0, spoiled: 0, earned: 0 };
    }

    // Avança para o próximo dia
    startNextDay() {
        this.day++;
        this.moneyEarnedToday = 0;
        
        // Ajusta a nova meta com escalonamento
        this.quota = 200 + (this.day - 1) * 150;
        
        // Bônus de virada de dia
        const bonus = 50 + (this.day - 1) * 10;
        this.money += bonus;
        this.stats.earned += bonus;

        // Limpa a doca e pedidos antigos para começar fresco
        this.dockSlots = [];
        this.orders = [];
        this.activeEvent = null;

        // Inicializar com itens e pedidos
        this.initWarehouse();
        for (let i = 0; i < 3; i++) {
            this.generateDockItem();
        }
        this.generateOrder();
        this.generateOrder();

        this.gameActive = true;
        this.startLoops();
        this.renderAll();
    }

    // Verifica se a reputação chegou a zero
    checkGameOver() {
        if (this.reputation <= 0) {
            this.reputation = 0;
            this.failShift();
        }
    }

    // Exibe tela de Game Over
    failShift() {
        this.gameActive = false;
        this.stopLoops();

        // Atualiza recorde local
        let isNewRecord = false;
        if (this.day > this.highScore) {
            this.highScore = this.day;
            localStorage.setItem("stockmaster_highscore", this.day);
            isNewRecord = true;
        }

        // Preenche relatório do Game Over
        document.getElementById("report-days").textContent = this.day;
        document.getElementById("report-money").textContent = `R$ ${this.stats.earned}`;
        document.getElementById("report-dispatched").textContent = this.stats.dispatched;
        document.getElementById("report-spoiled").textContent = this.stats.spoiled;

        const recordBadge = document.getElementById("high-score-badge");
        if (isNewRecord) {
            recordBadge.style.display = "inline-flex";
        } else {
            recordBadge.style.display = "none";
        }

        this.sounds.playBreak();
        
        const modal = document.getElementById("modal-gameover");
        modal.style.display = "flex";
    }

    // Verifica se bateu a meta e conclui o dia
    checkDaySuccess() {
        if (this.moneyEarnedToday >= this.quota && this.gameActive) {
            this.gameActive = false;
            this.stopLoops();
            
            const bonus = 50 + (this.day - 1) * 10;
            const nextQuota = 200 + this.day * 150;

            document.getElementById("day-bonus-amount").textContent = bonus;
            document.getElementById("next-day-quota").textContent = nextQuota;
            document.getElementById("next-day-num").textContent = this.day + 1;

            this.sounds.playSuccess();

            const modal = document.getElementById("modal-daysuccess");
            modal.style.display = "flex";
        }
    }

    // --- GERADORES PROCEDURAIS DE ITENS E PEDIDOS ---

    generateDockItem() {
        if (this.dockSlots.length >= this.maxDockSize) {
            // Doca cheia, perde mercadoria e reputação levemente
            this.reputation -= 4;
            this.sounds.playFailure();
            this.showDockNotification("Doca Cheia!", "Caminhão de entrega teve que retornar. Reputação -4%", "danger");
            this.checkGameOver();
            return;
        }

        // Sorteia categoria (cold, normal, fragile)
        const categories = ["cold", "normal", "fragile"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Sorteia produto da categoria
        const list = PRODUCTS[category];
        const prodTemplate = list[Math.floor(Math.random() * list.length)];

        this.dockSlots.push({
            id: Date.now() + Math.random(),
            type: category,
            name: prodTemplate.name,
            icon: prodTemplate.icon,
            freshness: category === "cold" ? 100 : null,
            spoiled: false,
            broken: false
        });
    }

    generateOrder() {
        // Determina tamanho do pedido baseado no dia
        let orderSize = 1;
        const roll = Math.random();
        if (this.day >= 3 && roll > 0.5) orderSize = 2;
        if (this.day >= 5 && roll > 0.8) orderSize = 3;

        const itemsRequired = [];
        const categories = ["cold", "normal", "fragile"];

        for (let i = 0; i < orderSize; i++) {
            // Sorteia itens requeridos
            const cat = categories[Math.floor(Math.random() * categories.length)];
            itemsRequired.push({
                type: cat,
                satisfied: false
            });
        }

        // Tempo de validade do pedido
        let baseTime = 30 + orderSize * 15; // 45s a 75s
        
        // Evento altera o tempo de atendimento
        if (this.activeEvent && this.activeEvent.id === "strike") {
            baseTime *= 1.5; // Mais tempo
        }

        const payout = orderSize * 60 + Math.floor(Math.random() * 30);

        this.orders.push({
            id: this.nextOrderId++,
            itemsRequired: itemsRequired,
            maxTime: baseTime,
            timeLeft: baseTime,
            payout: payout
        });
    }

    // --- EVENTOS DINÂMICOS ---
    triggerRandomEvent() {
        const eventsList = [
            {
                id: "blackfriday",
                title: "🚨 BLACK FRIDAY!",
                desc: "Cargas chegam 2X mais rápido na doca e pedidos valem 30% a mais!",
                duration: 25000
            },
            {
                id: "heatwave",
                title: "☀️ ONDA DE CALOR!",
                desc: "Alimentos fora da refrigeração estragam 2X mais rápido!",
                duration: 25000
            },
            {
                id: "strike",
                title: "📦 GREVE LOGÍSTICA!",
                desc: "O tempo limite dos pedidos dos clientes aumentou em 50%!",
                duration: 30000
            }
        ];

        // Sorteia um evento que não seja o mesmo ativo
        const ev = eventsList[Math.floor(Math.random() * eventsList.length)];
        this.activeEvent = ev;
        this.sounds.playWarning();

        // Banner informativo
        const banner = document.getElementById("event-banner");
        document.getElementById("event-title").textContent = ev.title;
        document.getElementById("event-desc").textContent = ev.desc;
        banner.style.display = "flex";

        // Aplica efeitos imediatos nos tempos
        if (ev.id === "blackfriday") {
            this.resetDockInterval();
        }

        if (this.eventTimeout) clearTimeout(this.eventTimeout);
        this.eventTimeout = setTimeout(() => {
            this.activeEvent = null;
            banner.style.display = "none";
            this.resetDockInterval();
            this.renderAll();
        }, ev.duration);

        this.renderAll();
    }

    // --- INTERAÇÕES DE JOGO (CLIQUES) ---

    // Clique em um slot da Doca de Entrada
    selectDockSlot(index) {
        if (!this.gameActive) return;
        this.sounds.playClick();
        
        // Se já estava selecionado, desseleciona
        if (this.selectedDockIndex === index) {
            this.selectedDockIndex = null;
        } else {
            this.selectedDockIndex = index;
            this.selectedWarehouseIndex = null; // Limpa seleção do armazém
        }
        this.renderDock();
        this.renderWarehouse();
    }

    // Clique em uma prateleira do galpão
    clickWarehouseSlot(index) {
        if (!this.gameActive) return;
        this.sounds.playClick();
        
        const slot = this.warehouseSlots[index];

        // CASO 1: Temos um item da doca selecionado para guardar aqui
        if (this.selectedDockIndex !== null) {
            // Verifica se o slot está vazio
            if (slot.item === null) {
                const itemToMove = this.dockSlots[this.selectedDockIndex];
                
                // Trata o bônus/punição por setor
                if (itemToMove.type === "cold" && slot.shelfType !== "cold") {
                    this.showDockNotification("Alerta de Cadeia Fria!", "Alimentos fora da Zona Fria começaram a estragar!", "warning");
                }
                if (itemToMove.type === "fragile" && slot.shelfType !== "fragile") {
                    this.showDockNotification("Alerta de Fragilidade!", "Produtos frágeis fora da área segura correm risco de quebrar!", "warning");
                }

                // Efetua a movimentação
                slot.item = itemToMove;
                this.dockSlots.splice(this.selectedDockIndex, 1);
                
                this.selectedDockIndex = null;
                this.renderDock();
                this.renderWarehouse();
            } else {
                // Sacode a prateleira informando que está ocupada
                this.shakeWarehouseSlot(index);
                this.sounds.playFailure();
            }
            return;
        }

        // CASO 2: Queremos interagir com um item que já está no armazém
        if (slot.item !== null) {
            // Lógica de descarte de item quebrado ou estragado
            if (slot.item.spoiled || slot.item.broken) {
                const typeName = slot.item.spoiled ? "Estragado" : "Quebrado";
                if (confirm(`Deseja descartar este item ${typeName}?`)) {
                    slot.item = null;
                    this.sounds.playClick();
                    this.renderWarehouse();
                }
                return;
            }

            // Seleciona o item para despacho em pedidos
            if (this.selectedWarehouseIndex === index) {
                this.selectedWarehouseIndex = null;
            } else {
                this.selectedWarehouseIndex = index;
            }
            this.renderWarehouse();
            this.renderOrders(); // Atualiza os botões "Despachar" para mostrar quais podem usar o item
        } else {
            // Clicou num slot vazio sem ter item na doca selecionado
            this.selectedWarehouseIndex = null;
            this.renderWarehouse();
        }
    }

    // Tenta entregar o item selecionado do estoque para um pedido
    tryFulfillOrder(orderId, requiredItemIndex) {
        if (!this.gameActive || this.selectedWarehouseIndex === null) return;
        
        const order = this.orders.find(o => o.id === orderId);
        const warehouseSlot = this.warehouseSlots[this.selectedWarehouseIndex];
        const item = warehouseSlot.item;

        if (!order || !item) return;

        // Procura nos requisitos não satisfeitos do pedido um que bata com o tipo do produto
        const req = order.itemsRequired.find(r => r.type === item.type && !r.satisfied);

        if (req) {
            // Consome o item e satisfaz a exigência
            req.satisfied = true;
            warehouseSlot.item = null;
            this.selectedWarehouseIndex = null;
            
            this.sounds.playClick();

            // Verifica se o pedido todo foi concluído
            const allSatisfied = order.itemsRequired.every(r => r.satisfied);
            if (allSatisfied) {
                // Conclui pedido e foca nos pagamentos
                let payout = order.payout;
                
                // Se houver Black Friday bônus de 30%
                if (this.activeEvent && this.activeEvent.id === "blackfriday") {
                    payout = Math.floor(payout * 1.3);
                }

                // Bônus por rapidez de despacho
                const speedPct = order.timeLeft / order.maxTime;
                let speedBonus = 0;
                if (speedPct > 0.5) {
                    speedBonus = Math.floor(payout * 0.15); // +15% de bônus por agilidade
                }

                const totalGain = payout + speedBonus;
                this.money += totalGain;
                this.moneyEarnedToday += totalGain;
                this.stats.earned += totalGain;
                this.stats.dispatched++;
                
                // Reputação ganha (recupera até 100%)
                this.reputation = Math.min(100, this.reputation + 5);

                this.orders = this.orders.filter(o => o.id !== orderId);
                
                this.sounds.playSuccess();
                this.showDockNotification("Pedido Concluído!", `Ganhos de R$ ${totalGain} (Bônus de R$ ${speedBonus}).`, "success");
                
                this.checkDaySuccess();
            }

            this.renderWarehouse();
            this.renderOrders();
            this.renderHUD();
        } else {
            // Item não serve para este pedido
            this.sounds.playFailure();
            this.shakeOrderCard(orderId);
        }
    }

    // --- EFEITOS DE ANIMAÇÃO CLIENT-SIDE ---
    shakeWarehouseSlot(index) {
        const el = document.querySelector(`.grid-slot[data-index="${index}"]`);
        if (el) {
            el.classList.add("shake-error");
            setTimeout(() => el.classList.remove("shake-error"), 350);
        }
    }

    shakeOrderCard(orderId) {
        const el = document.querySelector(`.order-card[data-id="${orderId}"]`);
        if (el) {
            el.classList.add("shake-error");
            setTimeout(() => el.classList.remove("shake-error"), 350);
        }
    }

    // --- SISTEMA DE COMPRA DE UPGRADES ---
    buyUpgrade(key) {
        if (!this.gameActive) return;
        
        const currentLvl = this.upgrades[key];
        const costArray = this.upgradeCosts[key];
        
        if (currentLvl >= costArray.length) return; // Máximo nível atingido

        const cost = costArray[currentLvl];

        if (this.money >= cost) {
            this.money -= cost;
            this.upgrades[key]++;
            this.sounds.playUpgrade();
            
            // Lógica interna da melhoria
            if (key === "space") {
                this.initWarehouse(); // Expande o galpão sem deletar os itens (neste caso redesenhamos com o novo limite)
                this.showDockNotification("Galpão Expandido!", "Mais espaço de estoque disponível.", "success");
            } else if (key === "bot") {
                this.resetBotInterval();
                this.showDockNotification("Robô Contratado!", "Iniciando inteligência robótica de dock-flow.", "success");
            } else if (key === "express") {
                // Aumenta tamanho da doca também
                this.maxDockSize = this.upgrades.express === 1 ? 5 : 6;
                this.resetDockInterval();
                this.showDockNotification("Logística Acelerada!", "Cargas chegando mais rápido e doca ampliada.", "success");
            } else if (key === "cooling") {
                this.showDockNotification("Freezer Industrial!", "Células frias otimizadas com sucesso.", "success");
            }

            this.renderAll();
        } else {
            this.sounds.playFailure();
            this.showDockNotification("Saldo Insuficiente!", `Você precisa de R$ ${cost} para comprar.`, "danger");
        }
    }

    // Exibe pequenos avisos voadores ou cards dinâmicos na doca
    showDockNotification(title, text, type) {
        console.log(`[Notification - ${type}]: ${title} - ${text}`);
        // Criaremos um toast elegante
        const toast = document.createElement("div");
        toast.className = `stat-badge alert-pulse fade-in`;
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.zIndex = "2000";
        toast.style.boxShadow = "var(--shadow-lg)";
        
        let iconType = "info";
        let colorClass = "font-normal";
        if (type === "danger") { iconType = "alert-triangle"; colorClass = "font-fragile"; }
        if (type === "warning") { iconType = "bell"; colorClass = "font-normal"; }
        if (type === "success") { iconType = "check-circle"; colorClass = "font-cold"; }

        toast.innerHTML = `
            <i data-lucide="${iconType}" class="${colorClass}"></i>
            <div>
                <span class="badge-label ${colorClass}">${title}</span>
                <span class="badge-value">${text}</span>
            </div>
        `;
        document.body.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.5s ease";
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }

    // --- RENDERIZADORES DE RELATÓRIO E UI ---

    renderAll() {
        this.renderHUD();
        this.renderWarehouse();
        this.renderDock();
        this.renderOrders();
        this.renderUpgrades();
    }

    renderHUD() {
        document.getElementById("hud-day").textContent = this.day;
        document.getElementById("hud-money").textContent = this.money;
        
        // Quota diária de dinheiro ganho hoje
        document.getElementById("hud-quota").textContent = `R$ ${this.moneyEarnedToday} / R$ ${this.quota}`;
        
        // Reputação e barra
        const repPctText = document.getElementById("hud-reputation");
        repPctText.textContent = `${this.reputation}%`;
        
        const repFill = document.getElementById("reputation-fill");
        repFill.style.width = `${this.reputation}%`;

        // Modifica cor do medidor
        repFill.className = "progress-bar-fill";
        if (this.reputation > 50) {
            repFill.classList.add("fill-success");
            repPctText.className = "reputation-pct font-cold";
        } else if (this.reputation > 25) {
            repFill.classList.add("fill-warning");
            repPctText.className = "reputation-pct font-normal";
        } else {
            repFill.classList.add("fill-danger");
            repPctText.className = "reputation-pct font-fragile";
        }
    }

    renderWarehouse() {
        const grid = document.getElementById("warehouse-grid");
        
        // Ajusta colunas do grid do CSS baseadas na largura atual
        const capacity = this.getCapacity();
        if (capacity === 12) grid.style.gridTemplateColumns = "repeat(4, 110px)";
        else if (capacity === 16) grid.style.gridTemplateColumns = "repeat(4, 110px)";
        else if (capacity === 20) grid.style.gridTemplateColumns = "repeat(5, 110px)";
        else if (capacity === 24) grid.style.gridTemplateColumns = "repeat(6, 110px)";

        grid.innerHTML = "";

        // Contadores
        let itemsStored = 0;

        this.warehouseSlots.forEach((slot, index) => {
            const el = document.createElement("div");
            el.className = `grid-slot slot-${slot.shelfType}`;
            el.setAttribute("data-index", index);
            
            // Destaque se estiver selecionado como destino da doca
            if (this.selectedDockIndex !== null && slot.item === null) {
                el.classList.add("selected-target");
            }

            // Exibe ícone discreto de background representativo do setor se estiver vazio
            if (slot.item === null) {
                let iconName = "package";
                if (slot.shelfType === "cold") iconName = "snowflake";
                if (slot.shelfType === "fragile") iconName = "gem";
                
                el.innerHTML = `<i data-lucide="${iconName}" style="opacity: 0.15; width: 24px; height: 24px;"></i>`;
            } else {
                itemsStored++;
                const item = slot.item;
                const selectedClass = this.selectedWarehouseIndex === index ? "selected" : "";
                
                let itemCard = document.createElement("div");
                itemCard.className = `inventory-item item-${item.type} ${selectedClass}`;
                
                // Nome resumido
                let shortName = item.name;
                if (item.spoiled) shortName = "Estragado 🗑️";
                if (item.broken) shortName = "Quebrado 🗑️";

                let freshHTML = "";
                if (item.type === "cold" && !item.spoiled) {
                    let pct = item.freshness;
                    let barColor = "var(--color-success)";
                    if (pct < 50) barColor = "var(--color-warning)";
                    if (pct < 25) barColor = "var(--color-danger)";

                    freshHTML = `
                        <div class="item-freshness-container" title="Frescor do Alimento">
                            <div class="item-freshness-bar" style="width: ${pct}%; background-color: ${barColor}"></div>
                        </div>
                    `;
                }

                let iconName = item.icon;
                if (item.spoiled || item.broken) iconName = "trash-2";

                itemCard.innerHTML = `
                    <i data-lucide="${iconName}"></i>
                    <span class="item-name">${shortName}</span>
                    ${freshHTML}
                `;
                el.appendChild(itemCard);
            }

            el.addEventListener("click", () => this.clickWarehouseSlot(index));
            grid.appendChild(el);
        });

        document.getElementById("warehouse-capacity-text").textContent = `Capacidade: ${itemsStored} / ${capacity}`;
        lucide.createIcons();
    }

    renderDock() {
        const container = document.getElementById("dock-slots");
        container.innerHTML = "";

        if (this.dockSlots.length === 0) {
            container.innerHTML = `
                <div class="empty-dock">
                    <i data-lucide="info"></i>
                    <span>Nenhum caminhão descarregando no momento...</span>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        this.dockSlots.forEach((item, index) => {
            const el = document.createElement("div");
            const selectedClass = this.selectedDockIndex === index ? "selected" : "";
            el.className = `dock-item item-${item.type} ${selectedClass}`;
            
            el.innerHTML = `
                <i data-lucide="${item.icon}"></i>
                <span class="item-name">${item.name}</span>
            `;

            el.addEventListener("click", () => this.selectDockSlot(index));
            container.appendChild(el);
        });

        lucide.createIcons();
    }

    renderOrders() {
        const container = document.getElementById("orders-list");
        container.innerHTML = "";

        document.getElementById("orders-count-badge").textContent = `${this.orders.length} Ativos`;

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-orders">
                    <i data-lucide="inbox"></i>
                    <p>Nenhum pedido ativo no momento.</p>
                    <span>Aguardando chamados de clientes...</span>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Verifica se há algum item selecionado no estoque para despacho
        const hasSelectedItem = this.selectedWarehouseIndex !== null;
        let selectedItemType = null;
        if (hasSelectedItem) {
            selectedItemType = this.warehouseSlots[this.selectedWarehouseIndex].item.type;
        }

        this.orders.forEach(order => {
            const card = document.createElement("div");
            
            // Pct de tempo
            const pct = Math.max(0, (order.timeLeft / order.maxTime) * 100);
            const isUrgent = pct < 35;
            card.className = `order-card ${isUrgent ? 'urgent' : ''}`;
            card.setAttribute("data-id", order.id);

            // Tags HTML
            let tagsHTML = "";
            order.itemsRequired.forEach(req => {
                let tagClass = "tag-normal";
                let tagIcon = "package";
                let tagLabel = "Eletrônico";

                if (req.type === "cold") { tagClass = "tag-cold"; tagIcon = "snowflake"; tagLabel = "Alimento"; }
                if (req.type === "fragile") { tagClass = "tag-fragile"; tagIcon = "gem"; tagLabel = "Frágil"; }

                const satClass = req.satisfied ? "style='text-decoration: line-through; opacity: 0.5'" : "";
                const satIcon = req.satisfied ? "check" : tagIcon;

                tagsHTML += `
                    <span class="order-item-tag ${tagClass}" ${satClass}>
                        <i data-lucide="${satIcon}"></i>
                        ${tagLabel}
                    </span>
                `;
            });

            // Lógica do Botão
            let btnClass = "btn-dispatch";
            let btnText = "Despachar";

            // Se temos o item correto selecionado no estoque, habilita a entrega do produto avulso
            if (hasSelectedItem) {
                const needsThisType = order.itemsRequired.some(r => r.type === selectedItemType && !r.satisfied);
                if (needsThisType) {
                    btnClass = "btn-dispatch active-ready";
                    btnText = "Entregar item";
                }
            }

            card.innerHTML = `
                <div class="order-card-header">
                    <span class="order-id">Pedido #${order.id}</span>
                    <span class="order-payout">R$ ${order.payout}</span>
                </div>
                <div class="order-items-list">
                    ${tagsHTML}
                </div>
                <div class="order-footer">
                    <div class="order-timer-container">
                        <span class="order-timer-label">
                            <i data-lucide="clock"></i>
                            Prazo: ${order.timeLeft}s
                        </span>
                        <div class="order-timer-bar-bg">
                            <div class="order-timer-bar" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <button class="${btnClass}" id="btn-order-${order.id}">${btnText}</button>
                </div>
            `;

            // Clique no botão de despachar/entregar
            card.querySelector(".btn-dispatch").addEventListener("click", (e) => {
                e.stopPropagation();
                if (hasSelectedItem) {
                    this.tryFulfillOrder(order.id, this.selectedWarehouseIndex);
                } else {
                    this.sounds.playFailure();
                    this.showDockNotification("Picking Pendente!", "Selecione primeiro o item desejado no galpão central para entregar.", "warning");
                }
            });

            container.appendChild(card);
        });

        lucide.createIcons();
    }

    renderUpgrades() {
        const upgradeTypes = ["space", "cooling", "bot", "express"];

        upgradeTypes.forEach(key => {
            const lvl = this.upgrades[key];
            const costs = this.upgradeCosts[key];
            const isMax = lvl >= costs.length;
            
            const btn = document.getElementById(`btn-upgrade-${key}`);
            const itemCard = document.getElementById(`shop-${key}`);
            const costText = document.getElementById(`upgrade-${key}-cost`);
            const descText = document.getElementById(`upgrade-${key}-desc`);

            if (isMax) {
                itemCard.classList.add("maxed");
                btn.disabled = true;
            } else {
                itemCard.classList.remove("maxed");
                btn.disabled = false;
                
                const nextCost = costs[lvl];
                costText.textContent = `R$ ${nextCost}`;

                // Habilita/Desabilita visual do botão baseado no dinheiro atual
                if (this.money >= nextCost) {
                    btn.classList.remove("btn-secondary");
                    btn.classList.add("btn-primary");
                    itemCard.classList.remove("disabled");
                } else {
                    btn.classList.add("btn-secondary");
                    btn.classList.remove("btn-primary");
                    itemCard.classList.add("disabled");
                }
            }

            // Descrições dinâmicas de upgrades
            if (key === "space") {
                const spaces = ["12 slots", "16 slots", "20 slots", "24 slots"];
                descText.textContent = isMax ? "Espaço máximo atingido (24)" : `Aumentar para ${spaces[lvl + 1]}`;
            } else if (key === "cooling") {
                const cools = ["Perda 0.5/s", "Fria Total (Perda 0.1/s)", "Freezer Absoluto (Sem perdas)"];
                descText.textContent = isMax ? cools[2] : `Melhorar para ${cools[lvl + 1]}`;
            } else if (key === "bot") {
                const bots = ["Sem robô", "Organiza a doca a cada 12s", "Acelerador Robótico a cada 6s"];
                descText.textContent = isMax ? bots[2] : `Contratar ${bots[lvl + 1]}`;
            } else if (key === "express") {
                const exps = ["Tempo doca: 10s", "Doca Expressa (7.5s & Cap 5)", "Logística Ultra (5.0s & Cap 6)"];
                descText.textContent = isMax ? exps[2] : `Melhorar para ${exps[lvl + 1]}`;
            }
        });
    }
}

// --- INSTANCIAÇÃO AUTOMÁTICA ---
window.addEventListener("DOMContentLoaded", () => {
    const game = new StockMasterGame();
    game.init();
    
    // Armazena no escopo global para debug opcional do desenvolvedor
    window.gameInstance = game;
});

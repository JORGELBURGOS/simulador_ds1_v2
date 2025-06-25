// Datos iniciales
const initialData = {
    products: [],
    clients: [],
    additionalProducts: [],
    pestelVariables: {
        political: [],
        economic: [],
        social: [],
        technological: [],
        ecological: [],
        legal: []
    },
    porterVariables: {
        "new-entrants": [],
        "buyers": [],
        "substitutes": [],
        "competition": [],
        "suppliers": []
    },
    strategies: [],
    selectedPestelVariables: [],
    selectedPorterVariables: [],
    activeStrategies: [],
    financialData: {
        revenue: 0,
        opCosts: 0,
        genExpenses: 0,
        ebitda: 0,
        roi: 0,
        nps: 50,
        churn: 5,
        uptime: 99.5
    },
    budget: {
        revenue: 1000000,
        opCosts: 300000,
        genExpenses: 200000,
        ebitda: 500000,
        roi: 25,
        nps: 60,
        churn: 3,
        uptime: 99.9
    }
};

// Estado de la aplicación
let state = {
    ...initialData,
    currentSection: 'clientes'
};

// Cargar datos iniciales desde archivos JSON
async function loadInitialData() {
    try {
        const [productsRes, clientsRes, strategiesRes] = await Promise.all([
            fetch('productos.json'),
            fetch('clientes.json'),
            fetch('estrategias.json')
        ]);
        
        const productsData = await productsRes.json();
        const clientsData = await clientsRes.json();
        const strategiesData = await strategiesRes.json();
        
        // Procesar productos
        state.products = productsData.map(product => ({
            ...product,
            clients: [],
            transactions: 0,
            unitValue: 0,
            growth: 0,
            marketShare: 0,
            marketGrowth: 0,
            strategy: ""
        }));
        
        // Procesar clientes
        state.clients = clientsData.map(client => ({
            ...client,
            products: [],
            transactions: 0,
            revenue: 0
        }));
        
        // Procesar estrategias
        state.strategies = strategiesData;
        
        // Generar datos aleatorios para transacciones y valores unitarios
        generateInitialTransactionData();
        
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        // Si hay error, generar datos de prueba
        generateTestData();
    }
}

// Generar datos de transacciones iniciales
function generateInitialTransactionData() {
    state.products.forEach(product => {
        // Seleccionar aleatoriamente entre 3 y 8 clientes para cada producto
        const numClients = Math.floor(Math.random() * 6) + 3;
        const shuffledClients = [...state.clients].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < numClients; i++) {
            const client = shuffledClients[i];
            
            // Generar datos aleatorios
            const transactions = Math.floor(Math.random() * 50000) + 10000;
            const unitValue = (Math.random() * 3) + 0.5;
            const revenue = transactions * unitValue;
            
            // Asignar producto al cliente
            client.products.push({
                id: product.id,
                name: product.name,
                transactions: transactions,
                unitValue: unitValue,
                revenue: revenue
            });
            
            // Actualizar totales del cliente
            client.transactions += transactions;
            client.revenue += revenue;
            
            // Actualizar producto
            product.clients.push({
                id: client.id,
                name: client.name,
                transactions: transactions,
                unitValue: unitValue,
                revenue: revenue
            });
            
            product.transactions += transactions;
            product.unitValue = ((product.unitValue * (product.clients.length - 1)) + unitValue / product.clients.length;
        }
        
        // Generar crecimiento y participación de mercado aleatorios
        product.growth = (Math.random() * 20) - 5; // Entre -5% y 15%
        product.marketShare = Math.random() * 30 + 5; // Entre 5% y 35%
        product.marketGrowth = Math.random() * 15 + 5; // Entre 5% y 20%
    });
    
    // Calcular datos financieros iniciales
    calculateFinancials();
}

// Generar datos de prueba si no se pueden cargar los archivos
function generateTestData() {
    // Implementación similar a generateInitialTransactionData()
    // pero con datos de prueba mínimos
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar datos iniciales
    await loadInitialData();
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar sección inicial
    loadSection(state.currentSection);
    
    // Configurar eventos
    setupEventListeners();
    
    // Actualizar UI
    updateUI();
});

// Configurar navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('#main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Actualizar estado
            state.currentSection = this.getAttribute('href').substring(1);
            
            // Actualizar navegación
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Cargar sección
            loadSection(state.currentSection);
        });
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Botón para agregar cliente
    document.getElementById('add-client-btn').addEventListener('click', showAddClientModal);
    
    // Formulario para agregar producto
    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProductName = document.getElementById('new-product').value;
        const productUnit = document.getElementById('product-unit').value;
        const transactions = parseInt(document.getElementById('product-transactions').value);
        const unitValue = parseFloat(document.getElementById('product-unit-value').value);
        
        if (!newProductName) return;
        
        // Crear nuevo producto
        const newProduct = {
            id: state.products.length + 1,
            name: newProductName,
            unit: productUnit,
            clients: [],
            transactions: transactions,
            unitValue: unitValue,
            growth: 0,
            marketShare: 0,
            marketGrowth: 0,
            strategy: ""
        };
        
        state.products.push(newProduct);
        
        // Actualizar UI
        updateProductsSection();
        updateBCGSection();
        
        // Resetear formulario
        this.reset();
    });
    
    // Resto de event listeners...
}

// Mostrar modal para agregar cliente
function showAddClientModal() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h3>Agregar Nuevo Cliente</h3>
        <form id='add-client-form'>
            <div class='form-group'>
                <label for='client-name'>Nombre:</label>
                <input type='text' id='client-name' required>
            </div>
            <div class='form-group'>
                <label for='client-type'>Tipo:</label>
                <select id='client-type' required>
                    <option value='Banco'>Banco</option>
                    <option value='Fintech'>Fintech</option>
                </select>
            </div>
            <div class='form-group'>
                <label>Productos:</label>
                <div id='client-products-list'>
                    ${state.products.map(product => `
                        <div class='client-product-item'>
                            <label>
                                <input type='checkbox' name='client-products' value='${product.id}'>
                                ${product.name}
                            </label>
                            <input type='number' class='product-transactions' placeholder='Transacciones' min='0' value='0'>
                            <input type='number' class='product-unit-value' placeholder='Valor unitario' min='0' step='0.01' value='0'>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class='action-buttons'>
                <button type='submit' class='btn'>Guardar</button>
                <button type='button' class='btn btn-cancel' id='cancel-add-client'>Cancelar</button>
            </div>
        </form>
    `;
    
    // Configurar formulario
    document.getElementById('add-client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('client-name').value;
        const type = document.getElementById('client-type').value;
        
        // Crear nuevo cliente
        const newClient = {
            id: state.clients.length + 1,
            name: name,
            type: type,
            products: [],
            transactions: 0,
            revenue: 0
        };
        
        // Procesar productos seleccionados
        const productCheckboxes = document.querySelectorAll('input[name="client-products"]:checked');
        productCheckboxes.forEach(checkbox => {
            const productId = parseInt(checkbox.value);
            const product = state.products.find(p => p.id === productId);
            const productItem = checkbox.closest('.client-product-item');
            const transactions = parseInt(productItem.querySelector('.product-transactions').value) || 0;
            const unitValue = parseFloat(productItem.querySelector('.product-unit-value').value) || 0;
            const revenue = transactions * unitValue;
            
            if (product && transactions > 0 && unitValue > 0) {
                // Agregar producto al cliente
                newClient.products.push({
                    id: product.id,
                    name: product.name,
                    transactions: transactions,
                    unitValue: unitValue,
                    revenue: revenue
                });
                
                // Actualizar totales del cliente
                newClient.transactions += transactions;
                newClient.revenue += revenue;
                
                // Actualizar producto
                product.clients.push({
                    id: newClient.id,
                    name: newClient.name,
                    transactions: transactions,
                    unitValue: unitValue,
                    revenue: revenue
                });
                
                product.transactions += transactions;
                product.unitValue = ((product.unitValue * (product.clients.length - 1)) + unitValue) / product.clients.length;
            }
        });
        
        state.clients.push(newClient);
        
        // Recalcular datos financieros
        calculateFinancials();
        
        // Actualizar UI
        updateClientsSection();
        updateProductsSection();
        updateUI();
        
        // Cerrar modal
        modal.style.display = 'none';
    });
    
    // Configurar botón cancelar
    document.getElementById('cancel-add-client').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Funciones para actualizar las secciones de la UI
function updateClientsSection() {
    const table = document.getElementById('clients-table');
    table.innerHTML = '';
    
    state.clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.type}</td>
            <td>${client.products.length}</td>
            <td>${client.transactions.toLocaleString()}</td>
            <td>$${client.revenue.toLocaleString()}</td>
            <td>
                <button class='btn small' data-action='view' data-id='${client.id}'>Ver</button>
                <button class='btn small' data-action='edit-client' data-id='${client.id}'>Editar</button>
            </td>
        `;
        table.appendChild(row);
    });
    
    // Configurar eventos de botones
    setupClientActionButtons();
}

// Configurar botones de acción para clientes
function setupClientActionButtons() {
    // Botón ver
    document.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = parseInt(this.getAttribute('data-id'));
            const client = state.clients.find(c => c.id === clientId);
            
            if (client) {
                showClientDetailsModal(client);
            }
        });
    });
    
    // Botón editar
    document.querySelectorAll('[data-action="edit-client"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = parseInt(this.getAttribute('data-id'));
            const client = state.clients.find(c => c.id === clientId);
            
            if (client) {
                showEditClientModal(client);
            }
        });
    });
}

// Mostrar modal de edición de cliente
function showEditClientModal(client) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h3>Editar Cliente: ${client.name}</h3>
        <form id='edit-client-form'>
            <div class='client-detail-form'>
                <div class='form-group'>
                    <label for='edit-client-name'>Nombre:</label>
                    <input type='text' id='edit-client-name' value='${client.name}' required>
                </div>
                <div class='form-group'>
                    <label for='edit-client-type'>Tipo:</label>
                    <select id='edit-client-type' required>
                        <option value='Banco' ${client.type === 'Banco' ? 'selected' : ''}>Banco</option>
                        <option value='Fintech' ${client.type === 'Fintech' ? 'selected' : ''}>Fintech</option>
                    </select>
                </div>
            </div>
            
            <h4>Productos</h4>
            <div id='edit-client-products'>
                ${state.products.map(product => {
                    const clientProduct = client.products.find(p => p.id === product.id);
                    const hasProduct = !!clientProduct;
                    
                    return `
                        <div class='client-product-item'>
                            <label>
                                <input type='checkbox' name='edit-client-products' value='${product.id}' ${hasProduct ? 'checked' : ''}>
                                ${product.name}
                            </label>
                            <input type='number' class='product-transactions' placeholder='Transacciones' min='0' 
                                   value='${hasProduct ? clientProduct.transactions : 0}'>
                            <input type='number' class='product-unit-value' placeholder='Valor unitario' min='0' step='0.01' 
                                   value='${hasProduct ? clientProduct.unitValue.toFixed(2) : '0'}'>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class='action-buttons'>
                <button type='submit' class='btn'>Guardar Cambios</button>
                <button type='button' class='btn btn-cancel' id='cancel-edit-client'>Cancelar</button>
            </div>
        </form>
    `;
    
    // Configurar formulario
    document.getElementById('edit-client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Actualizar datos básicos del cliente
        client.name = document.getElementById('edit-client-name').value;
        client.type = document.getElementById('edit-client-type').value;
        
        // Procesar productos
        const productCheckboxes = document.querySelectorAll('input[name="edit-client-products"]:checked');
        const newProducts = [];
        let totalTransactions = 0;
        let totalRevenue = 0;
        
        productCheckboxes.forEach(checkbox => {
            const productId = parseInt(checkbox.value);
            const product = state.products.find(p => p.id === productId);
            const productItem = checkbox.closest('.client-product-item');
            const transactions = parseInt(productItem.querySelector('.product-transactions').value) || 0;
            const unitValue = parseFloat(productItem.querySelector('.product-unit-value').value) || 0;
            const revenue = transactions * unitValue;
            
            if (product && transactions > 0 && unitValue > 0) {
                newProducts.push({
                    id: product.id,
                    name: product.name,
                    transactions: transactions,
                    unitValue: unitValue,
                    revenue: revenue
                });
                
                totalTransactions += transactions;
                totalRevenue += revenue;
            }
        });
        
        // Actualizar productos del cliente
        client.products = newProducts;
        client.transactions = totalTransactions;
        client.revenue = totalRevenue;
        
        // Actualizar referencias en productos
        updateProductClientReferences(client);
        
        // Recalcular datos financieros
        calculateFinancials();
        
        // Actualizar UI
        updateClientsSection();
        updateProductsSection();
        updateUI();
        
        // Cerrar modal
        modal.style.display = 'none';
    });
    
    // Configurar botón cancelar
    document.getElementById('cancel-edit-client').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Actualizar referencias de cliente en productos
function updateProductClientReferences(client) {
    // Primero eliminar todas las referencias antiguas de este cliente
    state.products.forEach(product => {
        product.clients = product.clients.filter(c => c.id !== client.id);
    });
    
    // Luego agregar las nuevas referencias
    client.products.forEach(clientProduct => {
        const product = state.products.find(p => p.id === clientProduct.id);
        if (product) {
            product.clients.push({
                id: client.id,
                name: client.name,
                transactions: clientProduct.transactions,
                unitValue: clientProduct.unitValue,
                revenue: clientProduct.revenue
            });
            
            // Recalcular totales del producto
            product.transactions = product.clients.reduce((sum, c) => sum + c.transactions, 0);
            product.unitValue = product.clients.length > 0 
                ? product.clients.reduce((sum, c) => sum + c.unitValue, 0) / product.clients.length 
                : 0;
        }
    });
}

// Resto de funciones de la aplicación...
// (Mantener las funciones existentes para otras secciones)

// Calcular datos financieros
function calculateFinancials() {
    // Calcular ingresos totales
    state.financialData.revenue = state.products.reduce(
        (sum, p) => sum + (p.transactions * p.unitValue), 0
    );
    
    // Calcular costos operativos (30% de ingresos)
    state.financialData.opCosts = state.financialData.revenue * 0.3;
    
    // Calcular gastos generales (20% de ingresos)
    state.financialData.genExpenses = state.financialData.revenue * 0.2;
    
    // Calcular EBITDA
    state.financialData.ebitda = state.financialData.revenue - state.financialData.opCosts - state.financialData.genExpenses;
    
    // Calcular ROI (EBITDA / (Costos + Gastos))
    const totalInvestment = state.financialData.opCosts + state.financialData.genExpenses;
    state.financialData.roi = totalInvestment > 0 
        ? (state.financialData.ebitda / totalInvestment) * 100 
        : 0;
    
    // Ajustar NPS y Churn basado en estrategias activas
    let npsAdjustment = 0;
    let churnAdjustment = 0;
    
    state.strategies.filter(s => s.activa).forEach(strategy => {
        npsAdjustment += strategy.impactoIngresos / 10;
        churnAdjustment -= strategy.impactoIngresos / 20;
    });
    
    state.financialData.nps = Math.min(100, Math.max(0, 50 + npsAdjustment));
    state.financialData.churn = Math.max(0, 5 + churnAdjustment);
}

// Funciones para cargar y guardar datos en localStorage
function saveDataToLocalStorage() {
    const dataToSave = {
        products: state.products,
        clients: state.clients,
        strategies: state.strategies,
        selectedPestelVariables: state.selectedPestelVariables,
        selectedPorterVariables: state.selectedPorterVariables,
        activeStrategies: state.activeStrategies,
        financialData: state.financialData,
        currentSection: state.currentSection
    };
    
    localStorage.setItem('newpay-strategic-simulator', JSON.stringify(dataToSave));
}

function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('newpay-strategic-simulator');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        state = {
            ...initialData,
            ...parsedData
        };
    }
}
// Основное приложение Vue
const { createApp } = Vue;

// Утилиты для работы с LocalStorage
const Storage = {
    getShoppingList() {
        try {
            const items = localStorage.getItem('shoppingList');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error('Ошибка при чтении из хранилища:', error);
            return [];
        }
    },
    
    saveShoppingList(items) {
        try {
            localStorage.setItem('shoppingList', JSON.stringify(items));
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении в хранилище:', error);
            return false;
        }
    }
};

// Основное приложение
const App = {
    data() {
        return {
            items: Storage.getShoppingList(),
            newItemName: '',
            newItemCategory: 'Продукты',
            selectedCategory: null,
            errorMessage: '',
            successMessage: '',
            categories: ['Продукты', 'Бытовая химия', 'Личные вещи', 'Электроника', 'Другое']
        };
    },
    
    computed: {
        filteredItems() {
            if (!this.selectedCategory) {
                return this.items;
            }
            return this.items.filter(item => item.category === this.selectedCategory);
        },
        
        totalItems() {
            return this.items.length;
        },
        
        purchasedItems() {
            return this.items.filter(item => item.purchased).length;
        },
        
        remainingItems() {
            return this.totalItems - this.purchasedItems;
        },
        
        completionPercentage() {
            return this.totalItems > 0 ? Math.round((this.purchasedItems / this.totalItems) * 100) : 0;
        },
        
        categoryStats() {
            const stats = {};
            this.categories.forEach(category => {
                stats[category] = this.items.filter(item => item.category === category).length;
            });
            return stats;
        }
    },
    
    methods: {
        // Добавить новый товар
        addItem() {
            if (!this.newItemName.trim()) {
                this.showError('Пожалуйста, введите название товара');
                return;
            }
            
            const newItem = {
                id: Date.now(),
                name: this.newItemName.trim(),
                category: this.newItemCategory,
                purchased: false,
                createdAt: new Date().toISOString()
            };
            
            this.items.push(newItem);
            this.saveToStorage();
            this.newItemName = '';
            this.showSuccess('Товар добавлен в список');
            
            // Фокус на поле ввода
            this.$nextTick(() => {
                document.querySelector('.input-field').focus();
            });
        },
        
        // Переключить статус покупки
        togglePurchased(itemId) {
            const item = this.items.find(item => item.id === itemId);
            if (item) {
                item.purchased = !item.purchased;
                this.saveToStorage();
            }
        },
        
        // Удалить товар
        removeItem(itemId) {
            if (confirm('Удалить этот товар из списка?')) {
                this.items = this.items.filter(item => item.id !== itemId);
                this.saveToStorage();
                this.showSuccess('Товар удален');
            }
        },
        
        // Редактировать товар
        editItem(itemId) {
            const item = this.items.find(item => item.id === itemId);
            if (item) {
                const newName = prompt('Введите новое название товара:', item.name);
                if (newName && newName.trim() !== item.name) {
                    item.name = newName.trim();
                    this.saveToStorage();
                    this.showSuccess('Товар обновлен');
                }
            }
        },
        
        // Отметить все как купленные
        markAllPurchased() {
            this.items.forEach(item => {
                item.purchased = true;
            });
            this.saveToStorage();
            this.showSuccess('Все товары отмечены как купленные');
        },
        
        // Удалить купленные товары
        clearPurchased() {
            if (this.purchasedItems === 0) {
                this.showError('Нет купленных товаров для удаления');
                return;
            }
            
            if (confirm(`Удалить все купленные товары (${this.purchasedItems} шт.)?`)) {
                this.items = this.items.filter(item => !item.purchased);
                this.saveToStorage();
                this.showSuccess('Купленные товары удалены');
            }
        },
        
        // Очистить весь список
        clearAll() {
            if (this.items.length === 0) {
                this.showError('Список уже пуст');
                return;
            }
            
            if (confirm('Вы уверены, что хотите удалить все товары?')) {
                this.items = [];
                this.saveToStorage();
                this.showSuccess('Все товары удалены');
            }
        },
        
        // Фильтр по категориям
        toggleCategory(category) {
            this.selectedCategory = this.selectedCategory === category ? null : category;
        },
        
        clearCategoryFilter() {
            this.selectedCategory = null;
        },
        
        // Сохранение в LocalStorage
        saveToStorage() {
            Storage.saveShoppingList(this.items);
        },
        
        // Показать сообщение об ошибке
        showError(message) {
            this.errorMessage = message;
            this.successMessage = '';
            setTimeout(() => {
                this.errorMessage = '';
            }, 3000);
        },
        
        // Показать сообщение об успехе
        showSuccess(message) {
            this.successMessage = message;
            this.errorMessage = '';
            setTimeout(() => {
                this.successMessage = '';
            }, 3000);
        },
        
        // Форматирование даты
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        },
        
        // Экспорт списка
        exportList() {
            const data = JSON.stringify(this.items, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shopping-list.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Список экспортирован');
        },
        
        // Импорт списка
        importList(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedItems = JSON.parse(e.target.result);
                    
                    // Проверяем структуру импортированных данных
                    if (Array.isArray(importedItems)) {
                        const validItems = importedItems.filter(item => 
                            item && typeof item === 'object' && 
                            item.name && typeof item.name === 'string'
                        );
                        
                        if (validItems.length > 0) {
                            // Добавляем импортированные товары
                            validItems.forEach(item => {
                                item.id = item.id || Date.now() + Math.random();
                                item.purchased = item.purchased || false;
                                item.category = item.category || 'Другое';
                                item.createdAt = item.createdAt || new Date().toISOString();
                            });
                            
                            this.items = [...this.items, ...validItems];
                            this.saveToStorage();
                            this.showSuccess(`Импортировано ${validItems.length} товаров`);
                        } else {
                            this.showError('Файл не содержит валидных товаров');
                        }
                    } else {
                        this.showError('Неверный формат файла');
                    }
                } catch (error) {
                    this.showError('Ошибка при чтении файла');
                }
            };
            reader.readAsText(file);
            
            // Сброс input файла
            event.target.value = '';
        }
    },
    
    mounted() {
        console.log('Приложение списка покупок запущено!');
        console.log('Товаров в списке:', this.items.length);
    },
    
    template: `
        <div class="app-container">
            <!-- Заголовок -->
            <header class="app-header">
                <h1 class="app-title">
                    <i class="fas fa-shopping-cart"></i>
                    Мой список покупок
                </h1>
                <p class="app-subtitle">Планируйте покупки эффективно</p>
            </header>
            
            <!-- Основной контент -->
            <main class="app-content">
                <!-- Статистика -->
                <div class="stats-container">
                    <div class="stat-item">
                        <span class="stat-value">{{ totalItems }}</span>
                        <span class="stat-label">Всего</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ remainingItems }}</span>
                        <span class="stat-label">Осталось</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ purchasedItems }}</span>
                        <span class="stat-label">Куплено</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ completionPercentage }}%</span>
                        <span class="stat-label">Выполнено</span>
                    </div>
                </div>
                
                <!-- Фильтр по категориям -->
                <div class="category-filter" v-if="items.length > 0">
                    <h3>Фильтр по категориям:</h3>
                    <div class="category-list">
                        <button 
                            v-for="category in categories" 
                            :key="category"
                            @click="toggleCategory(category)"
                            :class="['category-btn', { active: selectedCategory === category }]"
                        >
                            {{ category }} ({{ categoryStats[category] || 0 }})
                        </button>
                        <button 
                            v-if="selectedCategory"
                            @click="clearCategoryFilter"
                            class="category-btn"
                        >
                            <i class="fas fa-times"></i> Сбросить
                        </button>
                    </div>
                </div>
                
                <!-- Форма добавления -->
                <div class="input-section">
                    <input
                        type="text"
                        v-model="newItemName"
                        @keyup.enter="addItem"
                        placeholder="Что нужно купить?"
                        class="input-field"
                    >
                    <select v-model="newItemCategory" class="select-field">
                        <option v-for="category in categories" :key="category" :value="category">
                            {{ category }}
                        </option>
                    </select>
                    <button @click="addItem" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Добавить
                    </button>
                </div>
                
                <!-- Сообщения -->
                <div v-if="errorMessage" class="error-message">
                    <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
                </div>
                <div v-if="successMessage" class="success-message">
                    <i class="fas fa-check-circle"></i> {{ successMessage }}
                </div>
                
                <!-- Список покупок -->
                <div class="shopping-list">
                    <div v-if="filteredItems.length === 0" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <h3 class="empty-title">Список покупок пуст</h3>
                        <p class="empty-text" v-if="selectedCategory">
                            Нет товаров в категории "{{ selectedCategory }}"
                        </p>
                        <p class="empty-text" v-else>
                            Добавьте товары, используя форму выше
                        </p>
                    </div>
                    
                    <div v-else>
                        <div 
                            v-for="item in filteredItems" 
                            :key="item.id"
                            :class="['shopping-item', { purchased: item.purchased }]"
                        >
                            <!-- Чекбокс -->
                            <div class="item-checkbox" @click="togglePurchased(item.id)">
                                <div :class="['checkbox-custom', { checked: item.purchased }]">
                                    <i v-if="item.purchased" class="fas fa-check"></i>
                                </div>
                            </div>
                            
                            <!-- Контент элемента -->
                            <div class="item-content">
                                <div :class="['item-name', { purchased: item.purchased }]">
                                    {{ item.name }}
                                </div>
                                <div class="item-meta">
                                    <span class="item-category">{{ item.category }}</span>
                                    <span class="item-date" v-if="item.createdAt">
                                        {{ formatDate(item.createdAt) }}
                                    </span>
                                </div>
                            </div>
                            
                            <!-- Действия -->
                            <div class="item-actions">
                                <button @click="editItem(item.id)" class="action-btn edit-btn" title="Редактировать">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="removeItem(item.id)" class="action-btn delete-btn" title="Удалить">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Действия со списком -->
                <div class="list-actions" v-if="items.length > 0">
                    <button @click="markAllPurchased" class="btn btn-secondary">
                        <i class="fas fa-check-double"></i> Отметить все
                    </button>
                    <button @click="clearPurchased" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Удалить купленные
                    </button>
                    <button @click="exportList" class="btn btn-warning">
                        <i class="fas fa-download"></i> Экспорт
                    </button>
                    <label class="btn btn-warning" style="cursor: pointer;">
                        <i class="fas fa-upload"></i> Импорт
                        <input 
                            type="file" 
                            @change="importList" 
                            accept=".json,application/json" 
                            style="display: none;"
                        >
                    </label>
                </div>
            </main>
            
            <!-- Футер -->
            <footer class="app-footer">
                <div class="footer-text">
                    <p>Всего товаров: <strong>{{ totalItems }}</strong> | Куплено: <strong>{{ purchasedItems }}</strong> | Осталось: <strong>{{ remainingItems }}</strong></p>
                </div>
                <div class="footer-actions">
                    <button @click="clearAll" class="btn btn-danger">
                        <i class="fas fa-trash-alt"></i> Очистить все
                    </button>
                </div>
            </footer>
        </div>
    `
};

// Создаем и монтируем приложение
createApp(App).mount('#app');
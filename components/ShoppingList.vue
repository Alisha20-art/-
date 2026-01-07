<template>
    <div class="shopping-list-container">
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
        <div class="category-filter" v-if="categories.length > 0">
            <h3>Категории:</h3>
            <div class="category-list">
                <button 
                    v-for="category in categories" 
                    :key="category"
                    @click="toggleCategory(category)"
                    :class="['category-btn', { active: selectedCategory === category }]"
                >
                    {{ category }}
                </button>
                <button 
                    v-if="selectedCategory"
                    @click="clearCategoryFilter"
                    class="category-btn"
                >
                    Сбросить фильтр
                </button>
            </div>
        </div>
        
        <!-- Форма добавления -->
        <AddItemForm @add-item="addItem" />
        
        <!-- Список покупок -->
        <div class="shopping-list">
            <div v-if="filteredItems.length === 0" class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <h3 class="empty-title">Список покупок пуст</h3>
                <p class="empty-text">Добавьте товары, используя форму выше</p>
            </div>
            
            <div v-else>
                <ShoppingItem 
                    v-for="item in filteredItems" 
                    :key="item.id"
                    :item="item"
                    @toggle-purchased="togglePurchased"
                    @remove-item="removeItem"
                    @edit-item="editItem"
                />
            </div>
        </div>
        
        <!-- Кнопки управления -->
        <div class="list-actions" v-if="filteredItems.length > 0">
            <button @click="markAllPurchased" class="btn btn-secondary">
                <i class="fas fa-check-double"></i> Отметить все купленными
            </button>
            <button @click="clearPurchased" class="btn btn-danger">
                <i class="fas fa-trash"></i> Удалить купленные
            </button>
        </div>
    </div>
</template>

<script>
import AddItemForm from './AddItemForm.vue';
import ShoppingItem from './ShoppingItem.vue';

export default {
    name: 'ShoppingList',
    components: {
        AddItemForm,
        ShoppingItem
    },
    data() {
        return {
            selectedCategory: null,
            categories: ['Продукты', 'Бытовая химия', 'Личные вещи', 'Электроника', 'Другое']
        };
    },
    computed: {
        items() {
            return this.$root.items || [];
        },
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
        }
    },
    methods: {
        addItem(newItem) {
            this.$root.items.push({
                id: Date.now(),
                name: newItem.name,
                category: newItem.category || 'Другое',
                purchased: false,
                createdAt: new Date().toISOString()
            });
            this.$saveToStorage();
        },
        togglePurchased(itemId) {
            const item = this.$root.items.find(item => item.id === itemId);
            if (item) {
                item.purchased = !item.purchased;
                this.$saveToStorage();
            }
        },
        removeItem(itemId) {
            this.$root.items = this.$root.items.filter(item => item.id !== itemId);
            this.$saveToStorage();
        },
        editItem(itemId, newName) {
            const item = this.$root.items.find(item => item.id === itemId);
            if (item) {
                item.name = newName;
                this.$saveToStorage();
            }
        },
        markAllPurchased() {
            this.$root.items.forEach(item => {
                item.purchased = true;
            });
            this.$saveToStorage();
        },
        clearPurchased() {
            if (confirm('Удалить все купленные товары?')) {
                this.$root.items = this.$root.items.filter(item => !item.purchased);
                this.$saveToStorage();
            }
        },
        toggleCategory(category) {
            this.selectedCategory = this.selectedCategory === category ? null : category;
        },
        clearCategoryFilter() {
            this.selectedCategory = null;
        }
    }
};
</script>

<style scoped>
.list-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.list-actions .btn {
    flex: 1;
}
</style>
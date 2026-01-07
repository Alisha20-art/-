<template>
    <div class="add-item-form">
        <div class="input-section">
            <input
                type="text"
                v-model="newItemName"
                @keyup.enter="addItem"
                placeholder="Что нужно купить?"
                class="input-field"
                ref="itemInput"
            >
            <select v-model="newItemCategory" class="input-field category-select">
                <option value="" disabled selected>Выберите категорию</option>
                <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                </option>
            </select>
            <button @click="addItem" class="btn btn-primary">
                <i class="fas fa-plus"></i> Добавить
            </button>
        </div>
        
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'AddItemForm',
    props: {
        categories: {
            type: Array,
            default: () => ['Продукты', 'Бытовая химия', 'Личные вещи', 'Электроника', 'Другое']
        }
    },
    data() {
        return {
            newItemName: '',
            newItemCategory: '',
            error: ''
        };
    },
    methods: {
        addItem() {
            if (!this.newItemName.trim()) {
                this.error = 'Пожалуйста, введите название товара';
                return;
            }
            
            this.$emit('add-item', {
                name: this.newItemName.trim(),
                category: this.newItemCategory || 'Другое'
            });
            
            // Сброс формы
            this.newItemName = '';
            this.newItemCategory = '';
            this.error = '';
            
            // Фокус на поле ввода
            this.$refs.itemInput.focus();
        }
    }
};
</script>

<style scoped>
.add-item-form {
    margin-bottom: 30px;
}

.category-select {
    max-width: 200px;
}

.error-message {
    color: #e74c3c;
    margin-top: 10px;
    padding: 10px;
    background-color: #ffeaea;
    border-radius: 8px;
    font-size: 0.9rem;
}
</style> 
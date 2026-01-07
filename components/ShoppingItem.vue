<template>
    <div :class="['shopping-item', { purchased: item.purchased }]">
        <!-- Чекбокс -->
        <div class="item-checkbox" @click="togglePurchased">
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
            <button @click="editItem" class="action-btn edit-btn" title="Редактировать">
                <i class="fas fa-edit"></i>
            </button>
            <button @click="removeItem" class="action-btn delete-btn" title="Удалить">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ShoppingItem',
    props: {
        item: {
            type: Object,
            required: true
        }
    },
    methods: {
        togglePurchased() {
            this.$emit('toggle-purchased', this.item.id);
        },
        removeItem() {
            if (confirm(`Удалить "${this.item.name}" из списка?`)) {
                this.$emit('remove-item', this.item.id);
            }
        },
        editItem() {
            const newName = prompt('Введите новое название товара:', this.item.name);
            if (newName && newName.trim() !== this.item.name) {
                this.$emit('edit-item', this.item.id, newName.trim());
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        }
    }
};
</script>

<style scoped>
.item-meta {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-top: 5px;
}

.item-date {
    font-size: 0.85rem;
    color: #95a5a6;
}
</style>
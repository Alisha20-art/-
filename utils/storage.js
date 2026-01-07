// Утилиты для работы с локальным хранилищем

const Storage = {
    // Получить список покупок из хранилища
    getShoppingList() {
        try {
            const items = localStorage.getItem('shoppingList');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error('Ошибка при чтении из хранилища:', error);
            return [];
        }
    },

    // Сохранить список покупок в хранилище
    saveShoppingList(items) {
        try {
            localStorage.setItem('shoppingList', JSON.stringify(items));
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении в хранилище:', error);
            return false;
        }
    },

    // Очистить хранилище
    clearShoppingList() {
        try {
            localStorage.removeItem('shoppingList');
            return true;
        } catch (error) {
            console.error('Ошибка при очистке хранилища:', error);
            return false;
        }
    },

    // Экспорт списка покупок в файл
    exportToFile(items) {
        try {
            const data = JSON.stringify(items, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shopping-list.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            return false;
        }
    },

    // Импорт списка покупок из файла
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const items = JSON.parse(event.target.result);
                    resolve(items);
                } catch (error) {
                    reject(new Error('Неверный формат файла'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Ошибка при чтении файла'));
            };
            
            reader.readAsText(file);
        });
    },

    // Получить статистику
    getStats(items) {
        const total = items.length;
        const purchased = items.filter(item => item.purchased).length;
        const remaining = total - purchased;
        const completionPercentage = total > 0 ? Math.round((purchased / total) * 100) : 0;
        
        // Группировка по категориям
        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = 0;
            }
            categories[item.category]++;
        });
        
        return {
            total,
            purchased,
            remaining,
            completionPercentage,
            categories
        };
    }
};

export default Storage;
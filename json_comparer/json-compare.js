class JSONComparer {
    constructor() {
        this.json1Input = document.getElementById('json1');
        this.json2Input = document.getElementById('json2');
        this.compareBtn = document.getElementById('compareBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.formatBtn = document.getElementById('formatBtn');
        this.loadFileBtn = document.getElementById('loadFileBtn');
        this.fileInput = document.getElementById('fileInput');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.status1 = document.getElementById('status1');
        this.status2 = document.getElementById('status2');
        this.fileName1 = document.getElementById('fileName1');
        this.fileName2 = document.getElementById('fileName2');
        this.results = document.getElementById('results');
        this.statsText = document.getElementById('statsText');
        
        this.differences = [];
        this.onlyInFirst = [];
        this.onlyInSecond = [];
        
        this.initEventListeners();
        this.validateInputs();
    }
    
    initEventListeners() {
        this.compareBtn.addEventListener('click', () => this.compareJSON());
        this.clearBtn.addEventListener('click', () => this.clearInputs());
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.loadFileBtn.addEventListener('click', () => this.fileInput.click());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        
        this.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        
        this.json1Input.addEventListener('input', () => this.validateInputs());
        this.json2Input.addEventListener('input', () => this.validateInputs());
        
        // Auto-resize textareas
        [this.json1Input, this.json2Input].forEach(textarea => {
            textarea.addEventListener('input', () => this.autoResize(textarea));
        });
    }
    
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(400, textarea.scrollHeight) + 'px';
    }
    
    validateInputs() {
        this.validateJSON(this.json1Input, this.status1);
        this.validateJSON(this.json2Input, this.status2);
    }
    
    validateJSON(input, statusElement) {
        const value = input.value.trim();
        
        if (!value) {
            statusElement.textContent = 'Пустой';
            statusElement.className = 'status empty';
            return false;
        }
        
        try {
            JSON.parse(value);
            statusElement.textContent = 'Валидный';
            statusElement.className = 'status valid';
            return true;
        } catch (error) {
            statusElement.textContent = 'Невалидный';
            statusElement.className = 'status invalid';
            return false;
        }
    }
    
    compareJSON() {
        const json1Valid = this.validateJSON(this.json1Input, this.status1);
        const json2Valid = this.validateJSON(this.json2Input, this.status2);
        
        if (!json1Valid || !json2Valid) {
            alert('Пожалуйста, убедитесь, что оба JSON объекта валидны');
            return;
        }
        
        try {
            const obj1 = JSON.parse(this.json1Input.value);
            const obj2 = JSON.parse(this.json2Input.value);
            
            this.differences = [];
            this.onlyInFirst = [];
            this.onlyInSecond = [];
            
            this.findDifferences(obj1, obj2, '');
            this.displayResults();
            
        } catch (error) {
            alert('Ошибка при сравнении JSON: ' + error.message);
        }
    }
    
    findDifferences(obj1, obj2, path) {
        const allKeys = new Set([...this.getAllKeys(obj1), ...this.getAllKeys(obj2)]);
        
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            const hasKey1 = this.hasProperty(obj1, key);
            const hasKey2 = this.hasProperty(obj2, key);
            
            if (hasKey1 && hasKey2) {
                const val1 = this.getProperty(obj1, key);
                const val2 = this.getProperty(obj2, key);
                
                if (this.isObject(val1) && this.isObject(val2)) {
                    this.findDifferences(val1, val2, currentPath);
                } else if (this.isArray(val1) && this.isArray(val2)) {
                    this.compareArrays(val1, val2, currentPath);
                } else if (!this.deepEqual(val1, val2)) {
                    this.differences.push({
                        path: currentPath,
                        oldValue: val1,
                        newValue: val2,
                        type: 'changed'
                    });
                }
            } else if (hasKey1 && !hasKey2) {
                this.onlyInFirst.push({
                    path: currentPath,
                    value: this.getProperty(obj1, key),
                    type: 'removed'
                });
            } else if (!hasKey1 && hasKey2) {
                this.onlyInSecond.push({
                    path: currentPath,
                    value: this.getProperty(obj2, key),
                    type: 'added'
                });
            }
        }
    }
    
    compareArrays(arr1, arr2, path) {
        const maxLength = Math.max(arr1.length, arr2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const currentPath = `${path}[${i}]`;
            
            if (i < arr1.length && i < arr2.length) {
                const val1 = arr1[i];
                const val2 = arr2[i];
                
                if (this.isObject(val1) && this.isObject(val2)) {
                    this.findDifferences(val1, val2, currentPath);
                } else if (!this.deepEqual(val1, val2)) {
                    this.differences.push({
                        path: currentPath,
                        oldValue: val1,
                        newValue: val2,
                        type: 'changed'
                    });
                }
            } else if (i < arr1.length) {
                this.onlyInFirst.push({
                    path: currentPath,
                    value: arr1[i],
                    type: 'removed'
                });
            } else {
                this.onlyInSecond.push({
                    path: currentPath,
                    value: arr2[i],
                    type: 'added'
                });
            }
        }
    }
    
    getAllKeys(obj) {
        if (!this.isObject(obj)) return [];
        return Object.keys(obj);
    }
    
    hasProperty(obj, key) {
        return this.isObject(obj) && obj.hasOwnProperty(key);
    }
    
    getProperty(obj, key) {
        return this.isObject(obj) ? obj[key] : undefined;
    }
    
    isObject(val) {
        return val !== null && typeof val === 'object' && !Array.isArray(val);
    }
    
    isArray(val) {
        return Array.isArray(val);
    }
    
    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        
        if (obj1 == null || obj2 == null) return obj1 === obj2;
        
        if (typeof obj1 !== typeof obj2) return false;
        
        if (this.isArray(obj1) && this.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
                if (!this.deepEqual(obj1[i], obj2[i])) return false;
            }
            return true;
        }
        
        if (this.isObject(obj1) && this.isObject(obj2)) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            
            if (keys1.length !== keys2.length) return false;
            
            for (const key of keys1) {
                if (!obj2.hasOwnProperty(key)) return false;
                if (!this.deepEqual(obj1[key], obj2[key])) return false;
            }
            return true;
        }
        
        return false;
    }
    
    displayResults() {
        const totalDifferences = this.differences.length + this.onlyInFirst.length + this.onlyInSecond.length;
        
        if (totalDifferences === 0) {
            this.statsText.textContent = 'JSON объекты идентичны';
            this.results.style.display = 'block';
            
            document.getElementById('differences').innerHTML = '<p class="no-differences">Различий не найдено</p>';
            document.getElementById('onlyInFirst').innerHTML = '<p class="no-differences">Нет уникальных элементов</p>';
            document.getElementById('onlyInSecond').innerHTML = '<p class="no-differences">Нет уникальных элементов</p>';
        } else {
            this.statsText.textContent = `Найдено ${totalDifferences} различий (${this.differences.length} изменений, ${this.onlyInFirst.length} удалений, ${this.onlyInSecond.length} добавлений)`;
            this.results.style.display = 'block';
            
            this.renderDifferences(document.getElementById('differences'), this.differences, 'changed');
            this.renderDifferences(document.getElementById('onlyInFirst'), this.onlyInFirst, 'removed');
            this.renderDifferences(document.getElementById('onlyInSecond'), this.onlyInSecond, 'added');
        }
    }
    
    renderDifferences(container, differences, type) {
        if (differences.length === 0) {
            container.innerHTML = '<p class="no-differences">Нет различий</p>';
            return;
        }
        
        const html = differences.map(diff => {
            let content = `<div class="diff-item ${type}">
                <div class="diff-path">${diff.path}</div>`;
            
            if (type === 'changed') {
                content += `<div class="diff-values">
                    <div class="diff-value old">Старое: ${this.formatValue(diff.oldValue)}</div>
                    <div class="diff-value new">Новое: ${this.formatValue(diff.newValue)}</div>
                </div>`;
            } else {
                content += `<div class="diff-value ${type === 'added' ? 'new' : 'old'}">
                    ${this.formatValue(diff.value)}
                </div>`;
            }
            
            content += '</div>';
            return content;
        }).join('');
        
        container.innerHTML = html;
    }
    
    formatValue(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        } else if (value === null) {
            return 'null';
        } else if (typeof value === 'undefined') {
            return 'undefined';
        } else if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        } else {
            return String(value);
        }
    }
    
    formatJSON() {
        [this.json1Input, this.json2Input].forEach(input => {
            const value = input.value.trim();
            if (value) {
                try {
                    const parsed = JSON.parse(value);
                    input.value = JSON.stringify(parsed, null, 2);
                    this.autoResize(input);
                } catch (error) {
                    // Игнорируем ошибки при форматировании невалидного JSON
                }
            }
        });
        
        this.validateInputs();
    }
    
    clearInputs() {
        this.json1Input.value = '';
        this.json2Input.value = '';
        this.fileName1.textContent = '';
        this.fileName2.textContent = '';
        this.results.style.display = 'none';
        
        // Reset textarea heights
        [this.json1Input, this.json2Input].forEach(textarea => {
            textarea.style.height = '400px';
        });
        
        this.validateInputs();
    }
    
    handleFileLoad(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        if (files.length >= 1) {
            this.loadFileContent(files[0], this.json1Input, this.fileName1);
        }
        
        if (files.length >= 2) {
            this.loadFileContent(files[1], this.json2Input, this.fileName2);
        }
        
        event.target.value = '';
    }
    
    loadFileContent(file, textarea, fileNameElement) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            textarea.value = e.target.result;
            fileNameElement.textContent = file.name;
            fileNameElement.title = file.name; // Показать полное имя при наведении
            this.autoResize(textarea);
            this.validateInputs();
        };
        
        reader.onerror = () => {
            alert(`Ошибка при чтении файла ${file.name}`);
            fileNameElement.textContent = '';
        };
        
        reader.readAsText(file);
    }
    
    downloadResults() {
        const totalDifferences = this.differences.length + this.onlyInFirst.length + this.onlyInSecond.length;
        
        if (totalDifferences === 0) {
            alert('Нет различий для скачивания');
            return;
        }
        
        const results = {
            summary: {
                totalDifferences: totalDifferences,
                changes: this.differences.length,
                removals: this.onlyInFirst.length,
                additions: this.onlyInSecond.length,
                timestamp: new Date().toISOString()
            },
            differences: this.differences,
            onlyInFirst: this.onlyInFirst,
            onlyInSecond: this.onlyInSecond
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `json-comparison-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Примеры для демонстрации
const examples = {
    simple: {
        json1: {
            name: "John Doe",
            age: 30,
            city: "New York"
        },
        json2: {
            name: "John Doe",
            age: 31,
            city: "Boston",
            country: "USA"
        }
    },
    nested: {
        json1: {
            user: {
                profile: {
                    name: "Alice",
                    settings: {
                        theme: "dark",
                        notifications: true
                    }
                }
            }
        },
        json2: {
            user: {
                profile: {
                    name: "Alice Smith",
                    settings: {
                        theme: "light",
                        notifications: true,
                        language: "en"
                    }
                }
            }
        }
    },
    arrays: {
        json1: {
            items: ["apple", "banana", "cherry"],
            numbers: [1, 2, 3]
        },
        json2: {
            items: ["apple", "orange", "cherry", "date"],
            numbers: [1, 2, 4]
        }
    },
    complex: {
        json1: {
            users: [
                { id: 1, name: "John", active: true },
                { id: 2, name: "Jane", active: false }
            ],
            config: {
                api: {
                    version: "1.0",
                    endpoint: "https://api.example.com"
                },
                features: ["auth", "payments"]
            }
        },
        json2: {
            users: [
                { id: 1, name: "John Smith", active: true },
                { id: 3, name: "Bob", active: true }
            ],
            config: {
                api: {
                    version: "2.0",
                    endpoint: "https://api.example.com"
                },
                features: ["auth", "payments", "analytics"],
                debug: true
            }
        }
    }
};

function loadExample(type) {
    if (!examples[type]) return;
    
    const example = examples[type];
    const comparer = window.jsonComparer;
    
    comparer.json1Input.value = JSON.stringify(example.json1, null, 2);
    comparer.json2Input.value = JSON.stringify(example.json2, null, 2);
    
    // Очищаем имена файлов при загрузке примеров
    comparer.fileName1.textContent = '';
    comparer.fileName2.textContent = '';
    
    comparer.autoResize(comparer.json1Input);
    comparer.autoResize(comparer.json2Input);
    comparer.validateInputs();
    comparer.results.style.display = 'none';
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.jsonComparer = new JSONComparer();
});

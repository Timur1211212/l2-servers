// utils/validators.js

// Валидация сервера
function validateServer(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Название сервера должно содержать минимум 2 символа');
    }
    if (data.name && data.name.length > 100) {
        errors.push('Название сервера не может быть длиннее 100 символов');
    }
    
    if (!data.website || data.website.trim().length < 5) {
        errors.push('Укажите корректный адрес сайта');
    }
    if (data.website && !isValidUrl(data.website)) {
        errors.push('Укажите корректный URL сайта (https://example.com)');
    }
    
    if (data.description && data.description.length > 1000) {
        errors.push('Описание не может быть длиннее 1000 символов');
    }
    
    if (data.version && data.version.length > 50) {
        errors.push('Название версии не может быть длиннее 50 символов');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Валидация отзыва
function validateReview(data) {
    const errors = [];
    
    if (!data.authorName || data.authorName.trim().length < 2) {
        errors.push('Имя автора должно содержать минимум 2 символа');
    }
    if (data.authorName && data.authorName.length > 50) {
        errors.push('Имя автора не может быть длиннее 50 символов');
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
        errors.push('Оценка должна быть от 1 до 5');
    }
    
    if (!data.title || data.title.trim().length < 3) {
        errors.push('Заголовок должен содержать минимум 3 символа');
    }
    if (data.title && data.title.length > 100) {
        errors.push('Заголовок не может быть длиннее 100 символов');
    }
    
    if (!data.content || data.content.trim().length < 10) {
        errors.push('Текст отзыва должен содержать минимум 10 символов');
    }
    if (data.content && data.content.length > 1520) {
        errors.push('Текст отзыва не может быть длиннее 1520 символов');
    }
    
    if (data.pros && data.pros.length > 300) {
        errors.push('Плюсы не могут быть длиннее 300 символов');
    }
    
    if (data.cons && data.cons.length > 300) {
        errors.push('Минусы не могут быть длиннее 300 символов');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Валидация DMCA жалобы
function validateDmca(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Укажите ваше полное имя');
    }
    if (data.fullName && data.fullName.length > 100) {
        errors.push('Имя не может быть длиннее 100 символов');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Укажите корректный email адрес');
    }
    
    if (!data.copyrightedWork || data.copyrightedWork.trim().length < 10) {
        errors.push('Опишите защищенное авторским правом произведение (минимум 10 символов)');
    }
    if (data.copyrightedWork && data.copyrightedWork.length > 2000) {
        errors.push('Описание произведения не может быть длиннее 2000 символов');
    }
    
    if (!data.infringingContent || data.infringingContent.trim().length < 10) {
        errors.push('Опишите нарушающий контент (минимум 10 символов)');
    }
    if (data.infringingContent && data.infringingContent.length > 2000) {
        errors.push('Описание нарушающего контента не может быть длиннее 2000 символов');
    }
    
    if (!data.statement || data.statement.trim().length < 20) {
        errors.push('Заявление должно содержать минимум 20 символов');
    }
    if (data.statement && data.statement.length > 3000) {
        errors.push('Заявление не может быть длиннее 3000 символов');
    }
    
    if (data.company && data.company.length > 200) {
        errors.push('Название компании не может быть длиннее 200 символов');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Валидация пользователя (регистрация/логин)
function validateUser(data, isRegistration = false) {
    const errors = [];
    
    if (!data.username || data.username.trim().length < 3) {
        errors.push('Имя пользователя должно содержать минимум 3 символа');
    }
    if (data.username && data.username.length > 50) {
        errors.push('Имя пользователя не может быть длиннее 50 символов');
    }
    if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('Имя пользователя может содержать только буквы, цифры и знак подчеркивания');
    }
    
    if (!data.password) {
        errors.push('Укажите пароль');
    }
    if (isRegistration && data.password && data.password.length < 6) {
        errors.push('Пароль должен содержать минимум 6 символов');
    }
    
    if (isRegistration && data.email && !isValidEmail(data.email)) {
        errors.push('Укажите корректный email адрес');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Валидация поискового запроса
function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        return { isValid: true, sanitized: '' };
    }
    
    // Ограничиваем длину
    let sanitized = query.substring(0, 100);
    
    // Удаляем потенциально опасные символы
    sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
    
    // Экранируем специальные символы регулярных выражений
    sanitized = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    return {
        isValid: sanitized.length > 0,
        sanitized
    };
}

// Вспомогательные функции
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidSlug(slug) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}

function isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
}

// Санитизация HTML (дополнительная защита от XSS)
function sanitizeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Санитизация для URL
function sanitizeUrl(url) {
    if (!url) return '';
    const allowedSchemes = ['http', 'https'];
    try {
        const urlObj = new URL(url);
        if (!allowedSchemes.includes(urlObj.protocol.slice(0, -1))) {
            return '';
        }
        return url;
    } catch {
        return '';
    }
}

// Валидация рейтов (Exp, Drop, Adena и т.д.)
function validateRate(rate) {
    if (!rate) return { isValid: true, value: '' };
    
    const ratePattern = /^x\d+(?:\.\d+)?$/i;
    if (!ratePattern.test(rate)) {
        return { isValid: false, error: 'Рейт должен быть в формате x1, x10, x100.5 и т.д.' };
    }
    
    return { isValid: true, value: rate.toLowerCase() };
}

// Валидация даты открытия
function validateOpeningDate(date) {
    if (!date) return { isValid: true };
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return { isValid: false, error: 'Неверный формат даты' };
    }
    
    // Нельзя указать дату в будущем
    if (parsedDate > new Date()) {
        return { isValid: false, error: 'Дата открытия не может быть в будущем' };
    }
    
    // Нельзя указать дату старше 10 лет
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (parsedDate < tenYearsAgo) {
        return { isValid: false, error: 'Дата открытия не может быть старше 10 лет' };
    }
    
    return { isValid: true, value: parsedDate };
}

// Валидация статуса сервера
function validateServerStatus(status) {
    const validStatuses = ['VIP', 'Почти VIP', 'Не VIP, но тоже неплохой сервер'];
    if (!status) return { isValid: true, value: validStatuses[2] };
    if (validStatuses.includes(status)) {
        return { isValid: true, value: status };
    }
    return { isValid: false, error: 'Неверный статус сервера' };
}

// Валидация версии
function validateVersion(version) {
    if (!version) return { isValid: true, value: 'Interlude' };
    
    const validVersions = ['Interlude', 'High Five', 'Classic', 'Essence', 'Freya', 'Gracia', 'Epilogue'];
    if (validVersions.some(v => version.toLowerCase().includes(v.toLowerCase()))) {
        return { isValid: true, value: version };
    }
    
    // Если версия не из списка, но не пустая — пропускаем
    if (version.length <= 50) {
        return { isValid: true, value: version };
    }
    
    return { isValid: false, error: 'Название версии слишком длинное' };
}

// Комплексная валидация перед сохранением в БД
function validateServerForDb(data) {
    const results = {
        isValid: true,
        errors: [],
        sanitized: {}
    };
    
    // Обязательные поля
    if (!data.name || data.name.trim().length < 2) {
        results.isValid = false;
        results.errors.push('Название сервера обязательно (мин. 2 символа)');
    } else {
        results.sanitized.name = sanitizeHtml(data.name.trim());
    }
    
    if (!data.website) {
        results.isValid = false;
        results.errors.push('Сайт сервера обязателен');
    } else {
        const sanitizedUrl = sanitizeUrl(data.website);
        if (!sanitizedUrl) {
            results.isValid = false;
            results.errors.push('Неверный формат URL');
        } else {
            results.sanitized.website = sanitizedUrl;
        }
    }
    
    // Опциональные поля
    if (data.description) {
        results.sanitized.description = sanitizeHtml(data.description.trim()).substring(0, 1000);
    }
    
    if (data.version) {
        const versionValidation = validateVersion(data.version);
        if (!versionValidation.isValid) {
            results.isValid = false;
            results.errors.push(versionValidation.error);
        } else {
            results.sanitized.version = versionValidation.value;
        }
    }
    
    if (data.status) {
        const statusValidation = validateServerStatus(data.status);
        if (!statusValidation.isValid) {
            results.isValid = false;
            results.errors.push(statusValidation.error);
        } else {
            results.sanitized.status = statusValidation.value;
        }
    }
    
    if (data.openingDate) {
        const dateValidation = validateOpeningDate(data.openingDate);
        if (!dateValidation.isValid) {
            results.isValid = false;
            results.errors.push(dateValidation.error);
        } else {
            results.sanitized.openingDate = dateValidation.value;
        }
    }
    
    // Валидация рейтов
    const rateFields = ['exp', 'adena', 'drop', 'spoil', 'spoilChance', 'sealstone', 'raidBossExp', 'raidBossDrop', 'epicRaidBossDrop', 'questAdena', 'quest', 'questExp'];
    for (const field of rateFields) {
        if (data[field]) {
            const rateValidation = validateRate(data[field]);
            if (rateValidation.isValid) {
                results.sanitized[field] = rateValidation.value;
            } else {
                results.sanitized[field] = data[field];
            }
        }
    }
    
    return results;
}

module.exports = {
    validateServer,
    validateReview,
    validateDmca,
    validateUser,
    validateSearchQuery,
    validateRate,
    validateOpeningDate,
    validateServerStatus,
    validateVersion,
    validateServerForDb,
    isValidUrl,
    isValidEmail,
    isValidSlug,
    isValidObjectId,
    sanitizeHtml,
    sanitizeUrl
};
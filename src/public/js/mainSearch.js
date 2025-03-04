function submitCombinedSearch() {
    const data = {
        startingLocation: document.querySelector('#startingLocation')?.value.trim(),
        destinationLocation: document.querySelector('#destinationLocation')?.value.trim(),
        fromDate: document.querySelector('#fromDate')?.value,
        toDate: document.querySelector('#toDate')?.value,
        minPrice: document.querySelector('#minPrice')?.value,
        maxPrice: document.querySelector('#maxPrice')?.value,
        minDays: document.querySelector('#minDays')?.value,
        maxDays: document.querySelector('#maxDays')?.value,
        categories: Array.from(document.querySelectorAll('.categoryCheckbox:checked')).map(cb => cb.value),
        languages: Array.from(document.querySelectorAll('.languageCheckbox:checked')).map(cb => cb.value),
    };
    
    Object.keys(data).forEach(key => {
        if (!data[key] || (Array.isArray(data[key]) && data[key].length === 0)) delete data[key];
    });
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/mainSearch';
    
    for (const key in data) {
        if (Array.isArray(data[key])) {
            data[key].forEach(value => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
        } else {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        }
    }
    
    document.body.appendChild(form);
    form.submit();
}

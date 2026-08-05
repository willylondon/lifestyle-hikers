(function () {
    const query = new URLSearchParams(window.location.search);

    document.querySelectorAll('[data-query-param]').forEach(field => {
        const value = query.get(field.dataset.queryParam);
        if (!value) return;

        if (field.tagName === 'SELECT') {
            const matchingOption = Array.from(field.options).find(option => option.value.toLowerCase() === value.toLowerCase());
            if (matchingOption) field.value = matchingOption.value;
            return;
        }

        field.value = value.replace(/[-_]+/g, ' ');
    });

    document.querySelectorAll('[data-inquiry-form]').forEach(form => {
        const success = form.parentElement.querySelector('[data-form-success]');
        const error = form.querySelector('[data-form-error]');
        const submit = form.querySelector('button[type="submit"]');
        const idleLabel = submit.textContent;

        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            error.hidden = true;
            submit.disabled = true;
            submit.setAttribute('aria-busy', 'true');
            submit.textContent = 'Sending…';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) throw new Error('The enquiry service did not accept the request.');

                form.hidden = true;
                success.hidden = false;
                success.focus();
            } catch (requestError) {
                error.textContent = 'We could not send your enquiry. Try again or email lifestylehikersja@gmail.com.';
                error.hidden = false;
                submit.disabled = false;
                submit.removeAttribute('aria-busy');
                submit.textContent = idleLabel;
            }
        });
    });
})();

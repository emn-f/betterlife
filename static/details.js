document.addEventListener('DOMContentLoaded', async function () {
    const filename = document.getElementById('doc-details').dataset.filename;
    const messageDiv = document.getElementById('message');

    const docFilenameEl = document.getElementById('doc-filename');
    const downloadLink = document.getElementById('file-download-link');
    const statusSelect = document.getElementById('status-select');
    const ownerInput = document.getElementById('owner-input');
    const tagsInput = document.getElementById('tags-input');
    const dueDateInput = document.getElementById('due-date-input');

    const currentStatusEl = document.getElementById('current-status');
    const currentOwnerEl = document.getElementById('current-owner');
    const currentTagsEl = document.getElementById('current-tags');
    const currentSignatureEl = document.getElementById('current-signature');
    const currentDueDateEl = document.getElementById('current-due-date');
    const currentPermissionsEl = document.getElementById('current-permissions');
    const historyListEl = document.getElementById('history-list');

    async function fetchDetails() {
        try {
            const response = await fetch(`/api/documents/${filename}`);
            if (!response.ok) throw new Error('Documento não encontrado.');

            const doc = await response.json();

            docFilenameEl.textContent = filename;
            downloadLink.href = `/uploads/${filename}`;
            downloadLink.textContent = filename;

            currentStatusEl.textContent = doc.status;
            currentOwnerEl.textContent = doc.owner;
            currentSignatureEl.textContent = doc.is_signed ? 'Sim' : 'Não';
            currentDueDateEl.textContent = doc.due_date || 'Não definido';
            currentPermissionsEl.textContent = doc.permissions.join(', ');
            currentTagsEl.innerHTML = doc.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

            statusSelect.value = doc.status;
            ownerInput.value = doc.owner;
            tagsInput.value = doc.tags.join(', ');
            if (doc.due_date) {
                dueDateInput.value = doc.due_date;
            }

            historyListEl.innerHTML = doc.history.map(item =>
                `<li><strong>${new Date(item.timestamp).toLocaleString('pt-BR')}</strong>: ${item.event}</li>`
            ).reverse().join('');

        } catch (error) {
            docFilenameEl.textContent = 'Erro ao carregar documento.';
            console.error(error);
        }
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 4000);
    }

    async function updateDocument(payload) {
        const response = await fetch(`/api/documents/${filename}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
            showMessage(result.message, 'success');
            fetchDetails(); // Recarrega os dados
        } else {
            showMessage(`Erro: ${result.error}`, 'error');
        }
    }

    document.getElementById('update-meta-btn').addEventListener('click', () => {
        const updates = {
            status: statusSelect.value,
            owner: ownerInput.value,
            tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
            due_date: dueDateInput.value || null
        };
        updateDocument(updates);
    });

    document.getElementById('sign-btn').addEventListener('click', () => {
        if (confirm('Deseja assinar digitalmente este documento? Esta ação será registrada.')) {
            updateDocument({ is_signed: true });
        }
    });

    document.getElementById('delete-doc-btn').addEventListener('click', async function() {
        if (confirm('Tem certeza que deseja remover este documento? Esta ação não pode ser desfeita.')) {
            const filename = document.getElementById('doc-details').dataset.filename;
            const response = await fetch(`/api/delete/${encodeURIComponent(filename)}`, { method: 'DELETE' });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.href = '/';
            } else {
                alert(result.error || 'Erro ao remover documento.');
            }
        }
    });

    fetchDetails();
});

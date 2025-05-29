document.addEventListener('DOMContentLoaded', function () {
    const documentList = document.getElementById('document-list');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-csv-btn');

    async function fetchDocuments(query = '') {
        try {
            const url = query ? `/api/documents?q=${encodeURIComponent(query)}` : '/api/documents';
            const response = await fetch(url);
            const docs = await response.json();

            documentList.innerHTML = '';
            if (Object.keys(docs).length === 0) {
                documentList.innerHTML = '<li>Nenhum documento encontrado.</li>';
                return;
            }

            for (const filename in docs) {
                const meta = docs[filename];
                const li = document.createElement('li');
                li.innerHTML = `
                <a href="/details/${encodeURIComponent(filename)}" title="Ver detalhes de ${filename}">
                <strong>${filename}</strong>
                <br>
                <small>Status: ${meta.status || 'N/A'}</small>
                </a>
                <div class="doc-actions">
                    <button class="update-btn" data-filename="${filename}">Atualizar Fluxo</button>
                    <button class="delete-btn" data-filename="${filename}">Remover</button>
                </div>
                `;
                documentList.appendChild(li);
            }
        } catch (error) {
            documentList.innerHTML = '<li>Erro ao carregar documentos.</li>';
        }
    }

    // Busca inicial
    fetchDocuments();

    // Busca ao digitar
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            fetchDocuments(e.target.value);
        });
    }

    // Exportar CSV
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.location.href = '/api/report/csv';
        });
    }

    // Remover documento
    documentList.addEventListener('click', async function (e) {
        if (e.target.classList.contains('delete-btn')) {
            const filename = e.target.getAttribute('data-filename');
            if (confirm(`Remover o arquivo "${filename}"?`)) {
                const response = await fetch(`/api/delete/${encodeURIComponent(filename)}`, { method: 'DELETE' });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    window.location.href = '/dashboard';
                } else {
                    alert(result.error || 'Erro ao remover documento.');
                }
            }
        }
        // Atualizar fluxo (exemplo: redirecionar para detalhes)
        if (e.target.classList.contains('update-btn')) {
            const filename = e.target.getAttribute('data-filename');
            window.location.href = `/details/${encodeURIComponent(filename)}`;
        }
    });
});
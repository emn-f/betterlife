document.addEventListener('DOMContentLoaded', function () {
    // Só executa se existir a lista de documentos (ou seja, na tela correta)
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const documentList = document.getElementById('document-list');
    const messageDiv = document.getElementById('message');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-csv-btn');

    if (documentList) {
        // Função para buscar e exibir documentos
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
                        <button class="delete-btn" data-filename="${filename}">Remover</button>
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
                        fetchDocuments();
                    } else {
                        alert(result.error || 'Erro ao remover documento.');
                    }
                }
            }
        });
    }

    // Funções para o formulário de upload e métricas do dashboard
    async function fetchDashboardMetrics() {
        try {
            const response = await fetch('/api/dashboard-metrics');
            const metrics = await response.json();
            const metricsDiv = document.getElementById('dashboard-metrics');

            let statusHTML = '<ul>';
            for (const status in metrics.status_distribution) {
                statusHTML += `<li><strong>${status}:</strong> ${metrics.status_distribution[status]}</li>`;
            }
            statusHTML += '</ul>';

            metricsDiv.innerHTML = `
                    <p><strong>Total de Documentos:</strong> ${metrics.total_documents}</p>
                    <div><strong>Documentos por Status:</strong> ${statusHTML}</div>
                `;
        } catch (error) {
            console.error('Erro ao buscar métricas:', error);
        }
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 4000);
    }

    // Event Listeners
    uploadForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();

        if (response.ok) {
            // Use o nome do arquivo retornado pelo backend, se disponível
            const filename = result.filename || fileInput.files[0].name;
            window.location.href = `/details/${encodeURIComponent(filename)}`;
        } else {
            showMessage(`Erro: ${result.error}`, 'error');
        }
    });

    // Carregamento inicial
    fetchDashboardMetrics();
});
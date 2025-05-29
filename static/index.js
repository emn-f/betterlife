document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const documentList = document.getElementById('document-list');
    const messageDiv = document.getElementById('message');
    const searchInput = document.getElementById('search-input');

    // Funções para buscar e exibir
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
                        <a href="/details/${filename}" title="Ver detalhes de ${filename}">
                            <strong>${filename}</strong>
                            <br>
                            <small>Status: ${meta.status || 'N/A'}</small>
                        </a>
                        <button class="delete-btn" data-filename="${filename}">Remover</button>
                    `;
                documentList.appendChild(li);
            }
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
            documentList.innerHTML = '<li>Erro ao carregar documentos.</li>';
        }
    }

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
            showMessage(result.message, 'success');
            fetchDocuments();
            fetchDashboardMetrics();
            uploadForm.reset();
        } else {
            showMessage(`Erro: ${result.error}`, 'error');
        }
    });

    documentList.addEventListener('click', async function (e) {
        if (e.target.classList.contains('delete-btn')) {
            const filename = e.target.getAttribute('data-filename');
            if (confirm(`Tem certeza que deseja remover o arquivo "${filename}"?`)) {
                const response = await fetch(`/api/delete/${filename}`, { method: 'DELETE' });
                const result = await response.json();
                if (response.ok) {
                    showMessage(result.message, 'success');
                    fetchDocuments();
                    fetchDashboardMetrics();
                } else {
                    showMessage(result.error, 'error');
                }
            }
        }
    });

    searchInput.addEventListener('input', (e) => {
        fetchDocuments(e.target.value);
    });

    document.getElementById('export-csv-btn').addEventListener('click', () => {
        window.location.href = '/api/report/csv';
    });

    // Carregamento inicial
    fetchDocuments();
    fetchDashboardMetrics();
});
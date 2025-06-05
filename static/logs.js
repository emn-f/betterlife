document.addEventListener('DOMContentLoaded', function () {
    const logsList = document.getElementById('logs-list');
    const searchInput = document.getElementById('search-logs-input');

    const mockLogs = [
        {
            timestamp: "2025-06-05T10:00:00Z",
            user: "Admin",
            actionType: "criado",
            action: "Documento 'RelatorioAnual.pdf' enviado.",
            details: "Status inicial: Iniciado, Responsável: Não atribuído"
        },
        {
            timestamp: "2025-06-05T10:05:15Z",
            user: "UsuarioA",
            actionType: "alterado",
            action: "Status do documento 'RelatorioAnual.pdf' alterado para 'Em Análise'.",
            details: "Responsável atribuído: Maria Silva"
        },
        {
            timestamp: "2025-06-05T10:15:30Z",
            user: "Sistema",
            actionType: "acesso",
            action: "Backup diário dos documentos realizado com sucesso.",
            details: "Total de documentos no backup: 15"
        },
        {
            timestamp: "2025-06-05T11:00:00Z",
            user: "UsuarioB",
            actionType: "excluido",
            action: "Documento 'PropostaAntiga.docx' removido.",
            details: "Motivo: Documento obsoleto"
        },
        {
            timestamp: "2025-06-05T11:30:45Z",
            user: "Admin",
            actionType: "alterado",
            action: "Tags do documento 'RelatorioAnual.pdf' atualizadas.",
            details: "Novas tags: financeiro, Q2, urgente"
        },
        {
            timestamp: "2025-06-05T12:00:00Z",
            user: "UsuarioA",
            actionType: "alterado",
            action: "Documento 'RelatorioAnual.pdf' assinado digitalmente.",
            details: ""
        },
        {
            timestamp: "2025-06-05T14:20:10Z",
            user: "UsuarioC",
            actionType: "criado",
            action: "Documento 'ApresentacaoCliente.pptx' enviado.",
            details: "Status inicial: Iniciado"
        },
        {
            timestamp: "2025-06-05T15:00:00Z",
            user: "UsuarioB",
            actionType: "acesso",
            action: "Tentativa de login falhou para o usuário 'Visitante'.",
            details: "IP de origem: 192.168.1.100"
        },
        {
            timestamp: "2025-06-04T09:30:00Z",
            user: "Admin",
            actionType: "alterado",
            action: "Permissões do documento 'ManualInterno.pdf' atualizadas.",
            details: "Permissões de 'Leitura' para o grupo 'Colaboradores'."
        },
        {
            timestamp: "2025-06-04T14:00:00Z",
            user: "UsuarioD",
            actionType: "criado",
            action: "Fluxo 'ProcessoContratacaoXPTO' criado.",
            details: "Setores envolvidos: RH, Jurídico."
        },
        {
            timestamp: "2025-06-04T16:45:00Z",
            user: "Sistema",
            actionType: "excluido",
            action: "Documentos temporários com mais de 30 dias foram excluídos.",
            details: "Total de 5 documentos removidos."
        }
    ];

    function renderLogs(logsToRender) {
        logsList.innerHTML = '';

        if (!logsToRender || logsToRender.length === 0) {
            logsList.innerHTML = '<li>Nenhum log encontrado para os critérios de busca.</li>';
            return;
        }


        logsToRender.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));


        logsToRender.forEach(log => {
            const listItem = document.createElement('li');

            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'log-timestamp';
            timestampSpan.textContent = new Date(log.timestamp).toLocaleString('pt-BR');

            const userSpan = document.createElement('span');
            userSpan.className = 'log-user';
            userSpan.textContent = `${log.user}: `;

            const actionSpan = document.createElement('span');
            actionSpan.className = `log-action-type-${log.actionType || 'default'}`;
            actionSpan.textContent = log.action;

            listItem.appendChild(timestampSpan);
            listItem.appendChild(userSpan);
            listItem.appendChild(actionSpan);


            if (log.details) {
                const detailsSpan = document.createElement('span');
                detailsSpan.className = 'log-details';
                detailsSpan.textContent = `Detalhes: ${log.details}`;
                listItem.appendChild(document.createElement('br'));
                listItem.appendChild(detailsSpan);
            }
            logsList.appendChild(listItem);
        });
    }

    function filterLogs(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = mockLogs.filter(log => {
            return (
                log.user.toLowerCase().includes(lowerCaseSearchTerm) ||
                log.action.toLowerCase().includes(lowerCaseSearchTerm) ||
                (log.details && log.details.toLowerCase().includes(lowerCaseSearchTerm)) ||
                new Date(log.timestamp).toLocaleString('pt-BR').includes(lowerCaseSearchTerm)
            );
        });
        renderLogs(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            filterLogs(event.target.value);
        });
    }

    renderLogs(mockLogs);
});

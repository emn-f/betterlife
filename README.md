# Better Life

🌱 **Better Life** é uma aplicação web para gerenciamento de documentos, permitindo upload, controle de status, histórico de movimentações, assinatura digital e atribuição de responsáveis. O objetivo é facilitar o fluxo de trabalho e a organização documental em equipes e empresas.

## Funcionalidades

- Upload e download de documentos
- Busca e filtro de documentos
- Controle de status (Iniciado, Em Análise, Aprovado, etc.)
- Alteração de responsável
- Edição de tags e prazos
- Assinatura digital de documentos
- Histórico detalhado de operações
- Controle de permissões de acesso

## Tecnologias Utilizadas

- Python 3
- Flask
- HTML5 & CSS3
- JavaScript
- Gunicorn
- Render

## Estrutura do Projeto

betterlife/
├── app.py
├── requirements.txt
├── Procfile
├── static/
│ ├── style.css
│ └── details.js
├── templates/
│ ├── index.html
│ └── details.html
└── uploads/

## Deploy

O deploy pode ser feito pelo [Render](https://render.com/) com integração ao GitHub. Commits na branch principal acionam build e publicação automática.

## Contribuição

1. Faça um fork do projeto.
2. Crie um branch: `git checkout -b minha-feature`
3. Faça commit: `git commit -m 'Minha feature'`
4. Faça push: `git push origin minha-feature`
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais informações.
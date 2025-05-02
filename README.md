# E-commerce Microservices

Sistema de e-commerce distribuído baseado em microsserviços, implementado em Node.js (NestJS) e Go.

## Arquitetura

O sistema é composto por uma arquitetura moderna de microsserviços, onde cada componente é especializado em uma funcionalidade específica:

### Serviços em Node.js (NestJS)

- **API Gateway (porta 3000)**
  - Roteamento de requisições externas
  - Autenticação via JWT
  - Rate limiting
  - Cache com Redis
  - Tradução de protocolo HTTP/REST para gRPC
  - Circuit breaker para resiliência

- **Auth Service (porta 3001)**
  - Autenticação de usuários
  - Gestão de contas
  - Emissão e validação de JWT
  - Integração com Kafka para eventos de usuário

- **Cart Service (porta 3002)**
  - Gerenciamento do carrinho em tempo real
  - Cache com Redis
  - Validação de estoque via gRPC
  - Comunicação assíncrona via Kafka

- **Notification Service (porta 3003)**
  - Envio de e-mails transacionais
  - Notificações em tempo real
  - Templates Handlebars
  - Integração com provedores externos

### Serviços em Go

- **Product Catalog (porta 50051)**
  - API gRPC de alta performance
  - Cache distribuído
  - Busca e filtros avançados
  - Métricas com Prometheus

- **Order Service (porta 50052)**
  - Gerenciamento do ciclo de vida de pedidos
  - Consistência transacional
  - Eventos via Kafka
  - Integração com serviços de pagamento e estoque

- **Payment Service (porta 50053)**
  - Processamento seguro de pagamentos
  - Integração com gateways externos
  - Retry policies
  - Idempotência de transações

- **Inventory Service (porta 50054)**
  - Controle de estoque em tempo real
  - Sistema de reservas
  - Consistência eventual
  - Métricas de estoque

### Infraestrutura

- **Banco de Dados**
  - MongoDB: dados dos serviços
  - Redis: cache e dados temporários
  - Kafka: mensageria assíncrona

- **Monitoramento**
  - Prometheus: coleta de métricas
  - Grafana: dashboards
  - Jaeger: tracing distribuído
  - ELK Stack: logs centralizados

## Requisitos

- Docker e Docker Compose
- Node.js 18+
- Go 1.21+
- MongoDB
- Redis
- Kafka

## Setup Inicial

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/comercio_virtual.git
cd comercio_virtual
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os serviços:
```bash
docker-compose up -d
```

## Desenvolvimento

### Estrutura do Projeto
```
services/
  ├── api-gateway/          # Gateway API em NestJS
  ├── auth-service/         # Autenticação em NestJS
  ├── cart-service/         # Carrinho em NestJS
  ├── inventory-service/    # Inventário em Go
  ├── notification-service/ # Notificações em NestJS
  ├── order-service/        # Pedidos em Go
  ├── payment-service/      # Pagamentos em Go
  └── product-catalog/      # Produtos em Go
```

### Padrões de Código

- Código limpo e bem documentado
- Testes unitários e de integração
- Uso de interfaces e injeção de dependências
- Tratamento adequado de erros
- Logging estruturado

### Testes

Para executar os testes:

```bash
# Serviços Node.js
cd services/<service-name>
npm test

# Serviços Go
cd services/<service-name>
go test ./...
```

## Monitoramento

### Métricas Disponíveis

- Latência de requisições
- Taxa de erros
- Uso de recursos
- Performance de cache
- Status dos serviços

### Dashboards

- `/grafana` - Visualização de métricas
- `/prometheus` - Consulta de métricas brutas
- `/jaeger` - Tracing distribuído

## CI/CD

Pipeline configurado com:

- Testes automatizados
- Análise estática de código
- Build de containers
- Deploy automático
- Testes de integração

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça seus commits
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License - veja LICENSE para mais detalhes.
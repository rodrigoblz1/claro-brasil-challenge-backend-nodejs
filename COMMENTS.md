### Arquitetura


ExpressJS - Para lidar com a API RESTful, este framework sempre deu conta do recado, com melhorias constantes em sua performance e novas funcionalidades com suas novas versões, traz bastante flexibilidade no gerenciamento das rotas e é fácil de usar

MongoDB - Resolvi utilizá-lo para o escopo desta aplicação, pela flexibilidade e rapidez de desenvolvimento utilizando um NoSQL database, além de alta performance nas operações. Embora para este modelo de aplicação em sua totalidade talvez seja melhor um modelo híbrido.

Joi - Excelente lib para cuidar das validações feitas nas rotas com bastante precisão, também tem uma boa "conversa" com o mongoose (módulo para lidar com o MongoDB), podendo compartilhar os esquemas utilizados.

Mocha - Foi o escolhido como framework de test, possui um excelente suporte para testes assíncronos (os quais explorei bastante) de forma simples, além de bastante explorado pela comunidade.

### Libs utilizadas

express: Framework Web

mongoose: ODM para MongoDB

joi: Validação de esquemas

joi-objectid e joigoose: Complementos para validação do Joi

body-parser: Middleware de parsing para as rotas

dotenv: Módulo para carregar variáveis de ambiente de um arquivo .env

nyc: Verificar a porcentagem de cobertura dos testes

should: Assertion lib para ajudar nos tests

supertest: Fornece uma abstração excelente para testar a API

mocha: Framework para Testes

### Possíveis melhorias

Camada de autenticação dos usuários

Caso a aplicação evoluísse para um modelo real eu traria melhorias pra arquitetura de persistência, utilizando um modelo híbrido com NoSQL e SQL

Testes nunca são demais
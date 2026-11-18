# Exercício 05 - POO (TypeScript)

## Arquivos
- `cliente.ts`: classe Cliente.
- `banco.ts`: classes Conta e Banco.
- `app.ts`: classe App, menu e leitura pelo teclado.

## Instalação
Abra o terminal nesta pasta e execute:

```bash
npm install
```

O comando instala `prompt-sync`, `@types/prompt-sync`, TypeScript e os tipos do Node.

## Executar
```bash
npm start
```

## Observações sobre decisões de implementação
- Ao excluir um cliente, as contas permanecem cadastradas no banco e ficam sem titular.
- Ao excluir uma conta, ela também é removida da lista de contas do titular.
- A mudança de titularidade remove a conta do cliente antigo e a associa ao novo.
- A ordem bancária transfere o mesmo valor para cada conta de destino. O saldo total necessário é validado antes de qualquer transferência.
- Como o enunciado não especifica quais campos o método `atualizar` deve alterar, nesta implementação ele atualiza o número da conta, verificando duplicidade.
- As opções de contas usam 01 a 13 e as opções de clientes começam em 20, seguindo o menu ilustrativo do PDF.

class Cliente {
    private _id: number;
    private _nome: string;
    private _cpf: string;
    private _dataNascimento: Date;
    private _contas: Conta[];

    constructor(id: number, nome: string, cpf: string, dataNascimento: Date) {
        this._id = id;
        this._nome = nome;
        this._cpf = cpf;
        this._dataNascimento = dataNascimento;
        this._contas = [];
    }

    get id(): number {
        return this._id;
    }

    get nome(): string {
        return this._nome;
    }

    get cpf(): string {
        return this._cpf;
    }

    get dataNascimento(): Date {
        return this._dataNascimento;
    }

    get contas(): Conta[] {
        return [...this._contas];
    }

    adicionarConta(conta: Conta): void {
        for (let c of this._contas) {
            if (c.id == conta.id || c.numero == conta.numero) {
                throw new Error("Esta conta já está cadastrada para o cliente.");
            }
        }

        this._contas.push(conta);
    }

    removerConta(conta: Conta): void {
        this._contas = this._contas.filter(c => c !== conta);
    }
}


class Conta {
    private _id: number;
    private _numero: string;
    private _saldo: number;
    private _cliente: Cliente | null;
    private _dataDeAbertura: Date;

    constructor(
        id: number,
        numero: string,
        saldo: number,
        dataDeAbertura: Date = new Date()
    ) {
        this._id = id;
        this._numero = numero;
        this._saldo = saldo;
        this._cliente = null;
        this._dataDeAbertura = dataDeAbertura;
    }

    get id(): number {
        return this._id;
    }

    get numero(): string {
        return this._numero;
    }

    get saldo(): number {
        return this._saldo;
    }

    get cliente(): Cliente | null {
        return this._cliente;
    }

    get dataDeAbertura(): Date {
        return this._dataDeAbertura;
    }

    associarCliente(cliente: Cliente): void {
        if (this._cliente !== null) {
            throw new Error("Esta conta já possui um cliente.");
        }

        this._cliente = cliente;
    }

    depositar(valor: number): void {
        if (valor <= 0) {
            throw new Error("O valor do depósito deve ser positivo.");
        }

        this._saldo += valor;
    }

    sacar(valor: number): void {
        if (valor <= 0) {
            throw new Error("O valor do saque deve ser positivo.");
        }

        if (valor > this._saldo) {
            throw new Error("Saldo insuficiente.");
        }

        this._saldo -= valor;
    }

    transferir(contaDestino: Conta, valor: number): void {
        this.sacar(valor);
        contaDestino.depositar(valor);
    }
}


class Banco {
    private contas: Conta[];
    private clientes: Cliente[];

    constructor() {
        this.contas = [];
        this.clientes = [];
    }

    // Consultar conta pelo ID

    consultar(id: number): Conta | null {
        for (let conta of this.contas) {
            if (conta.id == id) {
                return conta;
            }
        }

        return null;
    }

    // Consultar índice da conta

    private consultarIndice(id: number): number {
        for (let i = 0; i < this.contas.length; i++) {
            let conta = this.contas[i];

            if (conta && conta.id == id) {
                return i;
            }
        }

        return -1;
    }

    // Consultar conta pelo número

    private consultarNumero(numero: string): Conta | null {
        for (let conta of this.contas) {
            if (conta.numero == numero) {
                return conta;
            }
        }

        return null;
    }

    // Inserir conta

    inserirConta(conta: Conta): void {
        if (this.consultar(conta.id) !== null) {
            throw new Error("Já existe uma conta com esse ID.");
        }

        if (this.consultarNumero(conta.numero) !== null) {
            throw new Error("Já existe uma conta com esse número.");
        }

        this.contas.push(conta);
    }

    // Excluir conta

    excluir(id: number): void {
        let indice = this.consultarIndice(id);

        if (indice != -1) {
            let conta = this.contas[indice];

            if (conta && conta.cliente) {
                conta.cliente.removerConta(conta);
            }

            for (let i = indice; i < this.contas.length - 1; i++) {
                this.contas[i] = this.contas[i + 1]!;
            }

            this.contas.pop();
        }
    }

    // Depositar

    depositar(id: number, valor: number): void {
        let contaProcurada = this.consultar(id);

        if (contaProcurada) {
            contaProcurada.depositar(valor);
        }
    }

    // Sacar

    sacar(id: number, valor: number): void {
        let contaProcurada = this.consultar(id);

        if (contaProcurada) {
            contaProcurada.sacar(valor);
        }
    }

    // Transferir

    transferir(idOrigem: number, idDestino: number, valor: number): void {
        let contaOrigem = this.consultar(idOrigem);
        let contaDestino = this.consultar(idDestino);

        if (contaOrigem && contaDestino) {
            contaOrigem.transferir(contaDestino, valor);
        }
    }

    // ======================================
    // MÉTODOS DE CLIENTE
    // ======================================

    // a) Inserir cliente

    inserirCliente(cliente: Cliente): void {
        for (let c of this.clientes) {
            if (c.id == cliente.id || c.cpf == cliente.cpf) {
                throw new Error("Cliente já cadastrado.");
            }
        }

        this.clientes.push(cliente);
    }

    // b) Consultar cliente pelo CPF

    consultarCliente(cpf: string): Cliente {
        for (let cliente of this.clientes) {
            if (cliente.cpf == cpf) {
                return cliente;
            }
        }

        throw new Error("Cliente não encontrado.");
    }

    // c) Associar cliente a uma conta

    associarContaCliente(numeroConta: string, cpfCliente: string): void {
        let cliente = this.consultarCliente(cpfCliente);
        let conta = this.consultarNumero(numeroConta);

        if (!conta) {
            throw new Error("Conta não encontrada.");
        }

        if (conta.cliente !== null) {
            throw new Error("Esta conta já pertence a outro cliente.");
        }

        cliente.adicionarConta(conta);
        conta.associarCliente(cliente);
    }

    // d) Listar contas de um cliente

    listarContasCliente(cpf: string): Conta[] {
        let cliente = this.consultarCliente(cpf);

        return cliente.contas;
    }

    // e) Totalizar saldo por cliente

    totalizarSaldoCliente(cpf: string): number {
        let cliente = this.consultarCliente(cpf);

        let total = 0;

        for (let conta of cliente.contas) {
            total += conta.saldo;
        }

        return total;
    }
}


let banco: Banco = new Banco();

// Criando clientes

let cliente1 = new Cliente(
    1,
    "João Silva",
    "11111111111",
    new Date(2000, 5, 15)
);

let cliente2 = new Cliente(
    2,
    "Maria Santos",
    "22222222222",
    new Date(1998, 2, 10)
);

// Criando contas

let conta1 = new Conta(1, "111-1", 1000);
let conta2 = new Conta(2, "222-2", 2000);
let conta3 = new Conta(3, "333-3", 500);

// Teste 1: Inserir clientes

banco.inserirCliente(cliente1);
banco.inserirCliente(cliente2);

console.log("Clientes cadastrados com sucesso!");

// Teste 2: Consultar cliente pelo CPF

console.log("Consulta de cliente:");
console.log(banco.consultarCliente("11111111111"));

// Teste 3: Inserir contas

banco.inserirConta(conta1);
banco.inserirConta(conta2);
banco.inserirConta(conta3);

console.log("Contas cadastradas com sucesso!");

// Teste 4: Consultar conta pelo ID

console.log("Consulta de conta:");
console.log(banco.consultar(1));

// Teste 5: Associar contas aos clientes

banco.associarContaCliente("111-1", "11111111111");
banco.associarContaCliente("222-2", "11111111111");
banco.associarContaCliente("333-3", "22222222222");

console.log("Contas associadas aos clientes!");

// Teste 6: Listar contas de um cliente

console.log("Contas do João:");
console.log(banco.listarContasCliente("11111111111"));

// Teste 7: Totalizar saldo do cliente

console.log("Saldo total do João:");
console.log(banco.totalizarSaldoCliente("11111111111"));

// Teste 8: Depositar

banco.depositar(1, 500);

console.log("Saldo após depósito:");
console.log(banco.consultar(1)?.saldo);

// Teste 9: Sacar

banco.sacar(1, 200);

console.log("Saldo após saque:");
console.log(banco.consultar(1)?.saldo);

// Teste 10: Transferir

banco.transferir(1, 2, 300);

console.log("Saldo da conta 1:");
console.log(banco.consultar(1)?.saldo);

console.log("Saldo da conta 2:");
console.log(banco.consultar(2)?.saldo);

// Teste 11: Totalizar saldo novamente

console.log("Saldo total do João após operações:");
console.log(banco.totalizarSaldoCliente("11111111111"));

// Teste 12: Excluir conta

banco.excluir(3);

console.log("Conta 3 após exclusão:");
console.log(banco.consultar(3));

// Teste 13: Verificar contas do cliente Maria

console.log("Contas da Maria:");
console.log(banco.listarContasCliente("22222222222"));


/*
Respostas dos questionamentos teóricos
a) Você concorda que o banco faz o cadastro de duas entidades e ainda faz regras de negócios?

Não concordo totalmente. A classe Banco está assumindo muitas responsabilidades, pois realiza o cadastro de clientes, o cadastro de contas e também controla as regras de negócio.

Isso pode deixar o código mais complexo e dificultar sua manutenção. O ideal seria separar as responsabilidades em classes diferentes.

b) Não seria adequado o banco ter uma classe CadastroDeClientes e CadastroDeContas e algumas regras de validação serem feitas no banco, deixando os métodos de consulta e inclusão mais simples?

Sim. Seria mais adequado criar as classes CadastroDeClientes e CadastroDeContas.

A classe CadastroDeClientes ficaria responsável pelo cadastro, consulta e validação dos clientes.

A classe CadastroDeContas ficaria responsável pelo cadastro, consulta e validação das contas.

A classe Banco ficaria responsável por coordenar essas classes e executar as operações que envolvem as duas entidades.

Dessa forma, o código ficaria mais organizado, facilitando a manutenção e evitando que uma única classe tenha muitas responsabilidades.

c) O método associar cliente a uma conta deveria estar em que classe? Banco, CadastroDeContas ou CadastroDeClientes?

Na minha opinião, o método deveria ficar na classe Banco, pois a associação envolve duas entidades diferentes: Cliente e Conta.

O Banco pode consultar os cadastros, verificar se o cliente e a conta existem e garantir que as regras de negócio sejam respeitadas.

Assim, a responsabilidade de relacionar as duas entidades fica centralizada na classe que administra o sistema.

*/
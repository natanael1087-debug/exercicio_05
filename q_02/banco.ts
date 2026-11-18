import { Cliente } from "./cliente";

export class Conta {
    private _numero: string;
    private _saldo: number;
    private _cliente: Cliente | null;
    private _dataDeAbertura: Date;

    constructor(numero: string, saldo: number = 0, dataDeAbertura: Date = new Date()) {
        this._numero = numero;
        this._saldo = saldo;
        this._cliente = null;
        this._dataDeAbertura = dataDeAbertura;
    }

    get numero(): string { return this._numero; }
    get saldo(): number { return this._saldo; }
    get cliente(): Cliente | null { return this._cliente; }
    get dataDeAbertura(): Date { return this._dataDeAbertura; }

    associarCliente(cliente: Cliente): void {
        if (this._cliente !== null) {
            throw new Error("A conta já possui titular.");
        }
        this._cliente = cliente;
    }

    retirarTitular(): void {
        this._cliente = null;
    }

    atualizarNumero(novoNumero: string): void {
        this._numero = novoNumero;
    }

    depositar(valor: number): void {
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error("O depósito deve ser maior que zero.");
        }
        this._saldo += valor;
    }

    sacar(valor: number): void {
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error("O saque deve ser maior que zero.");
        }
        if (valor > this._saldo) {
            throw new Error("Saldo insuficiente.");
        }
        this._saldo -= valor;
    }
}

export class Banco {
    private contas: Conta[];
    private clientes: Cliente[];

    constructor() {
        this.contas = [];
        this.clientes = [];
    }

    inserir(conta: Conta): void {
        this.inserirConta(conta);
    }

    inserirConta(conta: Conta): void {
        if (this.consultar(conta.numero) !== null) {
            throw new Error("Já existe uma conta com esse número.");
        }
        this.contas.push(conta);
    }

    consultar(numero: string): Conta | null {
        for (let conta of this.contas) {
            if (conta.numero === numero) return conta;
        }
        return null;
    }

    private consultarIndice(numero: string): number {
        for (let i = 0; i < this.contas.length; i++) {
            if (this.contas[i] && this.contas[i].numero === numero) return i;
        }
        return -1;
    }

    atualizar(numeroAtual: string, novoNumero: string): void {
        let conta = this.consultar(numeroAtual);
        if (!conta) throw new Error("Conta não encontrada.");
        if (numeroAtual !== novoNumero && this.consultar(novoNumero)) {
            throw new Error("Já existe outra conta com esse número.");
        }
        conta.atualizarNumero(novoNumero);
    }

    excluir(numero: string): void {
        let indice = this.consultarIndice(numero);
        if (indice === -1) throw new Error("Conta não encontrada.");

        let conta = this.contas[indice];
        if (conta.cliente) {
            conta.cliente.removerConta(conta.numero);
            conta.retirarTitular();
        }

        for (let i = indice; i < this.contas.length - 1; i++) {
            this.contas[i] = this.contas[i + 1];
        }
        this.contas.pop();
    }

    depositar(numero: string, valor: number): void {
        let conta = this.consultar(numero);
        if (!conta) throw new Error("Conta não encontrada.");
        conta.depositar(valor);
    }

    sacar(numero: string, valor: number): void {
        let conta = this.consultar(numero);
        if (!conta) throw new Error("Conta não encontrada.");
        conta.sacar(valor);
    }

    transferir(numeroOrigem: string, numeroDestino: string, valor: number): void {
        let origem = this.consultar(numeroOrigem);
        let destino = this.consultar(numeroDestino);
        if (!origem || !destino) throw new Error("Conta de origem ou destino não encontrada.");
        if (origem === destino) throw new Error("A origem e o destino devem ser contas diferentes.");
        origem.sacar(valor);
        destino.depositar(valor);
    }

    // Ordem bancária: transfere o mesmo valor para cada conta de destino.
    ordemBancaria(numeroOrigem: string, numerosDestino: string[], valor: number): void {
        let origem = this.consultar(numeroOrigem);
        if (!origem) throw new Error("Conta de origem não encontrada.");
        if (numerosDestino.length === 0) throw new Error("Informe pelo menos uma conta de destino.");
        if (!Number.isFinite(valor) || valor <= 0) throw new Error("O valor deve ser maior que zero.");

        let destinos: Conta[] = [];
        for (let numero of numerosDestino) {
            let destino = this.consultar(numero);
            if (!destino) throw new Error("Conta de destino não encontrada: " + numero);
            if (destino === origem) throw new Error("A conta de origem não pode ser destino.");
            destinos.push(destino);
        }

        let total = valor * destinos.length;
        if (origem.saldo < total) throw new Error("Saldo insuficiente para realizar toda a ordem bancária.");

        // Só efetua as operações depois de validar todos os destinos e o saldo.
        origem.sacar(total);
        for (let destino of destinos) destino.depositar(valor);
    }

    quantidadeContas(): number {
        return this.contas.length;
    }

    totalDinheiro(): number {
        let total = 0;
        for (let conta of this.contas) total += conta.saldo;
        return total;
    }

    mediaSaldo(): number {
        let quantidade = this.quantidadeContas();
        if (quantidade === 0) return 0;
        return this.totalDinheiro() / quantidade;
    }

    inserirCliente(cliente: Cliente): void {
        for (let c of this.clientes) {
            if (c.id === cliente.id || c.cpf === cliente.cpf) {
                throw new Error("Já existe cliente com esse ID ou CPF.");
            }
        }
        this.clientes.push(cliente);
    }

    consultarCliente(cpf: string): Cliente | null {
        for (let cliente of this.clientes) {
            if (cliente.cpf === cpf) return cliente;
        }
        return null;
    }

    associarContaCliente(numeroConta: string, cpfCliente: string): void {
        let conta = this.consultar(numeroConta);
        let cliente = this.consultarCliente(cpfCliente);
        if (!conta) throw new Error("Conta não encontrada.");
        if (!cliente) throw new Error("Cliente não encontrado.");
        if (conta.cliente !== null) throw new Error("Esta conta já possui titular.");

        cliente.adicionarConta(conta);
        conta.associarCliente(cliente);
    }

    listarContasCliente(cpf: string): Conta[] {
        let cliente = this.consultarCliente(cpf);
        if (!cliente) throw new Error("Cliente não encontrado.");
        return cliente.contas;
    }

    totalizarSaldoCliente(cpf: string): number {
        let contasCliente = this.listarContasCliente(cpf);
        let total = 0;
        for (let conta of contasCliente) total += conta.saldo;
        return total;
    }

    mudarTitularidade(numeroConta: string, novoCpf: string): void {
        let conta = this.consultar(numeroConta);
        let novoCliente = this.consultarCliente(novoCpf);
        if (!conta) throw new Error("Conta não encontrada.");
        if (!novoCliente) throw new Error("Novo cliente não encontrado.");
        if (conta.cliente && conta.cliente.cpf === novoCpf) {
            throw new Error("A conta já pertence a esse cliente.");
        }

        if (conta.cliente) conta.cliente.removerConta(numeroConta);
        conta.retirarTitular();
        novoCliente.adicionarConta(conta);
        conta.associarCliente(novoCliente);
    }

    excluirCliente(cpf: string): void {
        let cliente = this.consultarCliente(cpf);
        if (!cliente) throw new Error("Cliente não encontrado.");

        // Decisão: as contas continuam no banco, mas ficam sem titular.
        for (let conta of cliente.contas) conta.retirarTitular();

        let indice = this.clientes.indexOf(cliente);
        this.clientes.splice(indice, 1);
    }

    excluirConta(numero: string): void {
        this.excluir(numero);
    }

    listarContasSemCliente(): Conta[] {
        let semCliente: Conta[] = [];
        for (let conta of this.contas) {
            if (conta.cliente === null) semCliente.push(conta);
        }
        return semCliente;
    }

    carregarDados(): void {
        if (this.clientes.length > 0 || this.contas.length > 0) return;

        let c1 = new Cliente(1, "Ana Lima", "11111111111", new Date(1999, 0, 10));
        let c2 = new Cliente(2, "Bruno Sousa", "22222222222", new Date(1998, 3, 20));
        let c3 = new Cliente(3, "Carla Alves", "33333333333", new Date(2001, 6, 5));
        let c4 = new Cliente(4, "Diego Rocha", "44444444444", new Date(1997, 8, 12));
        let c5 = new Cliente(5, "Eva Costa", "55555555555", new Date(2000, 10, 2));

        this.inserirCliente(c1);
        this.inserirCliente(c2);
        this.inserirCliente(c3);
        this.inserirCliente(c4);
        this.inserirCliente(c5);

        this.inserirConta(new Conta("1001", 1500));
        this.inserirConta(new Conta("1002", 2300));
        this.inserirConta(new Conta("1003", 800));
        this.inserirConta(new Conta("1004", 1200));
        this.inserirConta(new Conta("1005", 500));

        this.associarContaCliente("1001", c1.cpf);
        this.associarContaCliente("1002", c1.cpf);
        this.associarContaCliente("1003", c2.cpf);
        this.associarContaCliente("1004", c3.cpf);
        // A conta 1005 fica inicialmente sem titular para permitir o teste de associação.
    }
}

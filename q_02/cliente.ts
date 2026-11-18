export class Cliente {
    private _id: number;
    private _nome: string;
    private _cpf: string;
    private _dataNascimento: Date;
    private _contas: import("./banco").Conta[];

    constructor(id: number, nome: string, cpf: string, dataNascimento: Date) {
        this._id = id;
        this._nome = nome;
        this._cpf = cpf;
        this._dataNascimento = dataNascimento;
        this._contas = [];
    }

    get id(): number { return this._id; }
    get nome(): string { return this._nome; }
    get cpf(): string { return this._cpf; }
    get dataNascimento(): Date { return this._dataNascimento; }
    get contas(): import("./banco").Conta[] { return [...this._contas]; }

    adicionarConta(conta: import("./banco").Conta): void {
        for (let c of this._contas) {
            if (c.numero === conta.numero) {
                throw new Error("Esta conta já está associada a este cliente.");
            }
        }
        this._contas.push(conta);
    }

    removerConta(numero: string): void {
        this._contas = this._contas.filter(conta => conta.numero !== numero);
    }
}

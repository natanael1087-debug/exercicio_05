import promptSync from "prompt-sync";
import { Banco, Conta } from "./banco";
import { Cliente } from "./cliente";

const input = promptSync();

class App {
    private banco: Banco;

    constructor() {
        this.banco = new Banco();
    }

    menu(): void {
        this.banco.carregarDados();
        let opcao = "";

        do {
            console.log("\n========== SISTEMA BANCÁRIO ==========");
            console.log("CONTAS");
            console.log("01 - Inserir conta");
            console.log("02 - Consultar conta");
            console.log("03 - Sacar");
            console.log("04 - Depositar");
            console.log("05 - Excluir conta");
            console.log("06 - Transferir");
            console.log("07 - Quantidade de contas");
            console.log("08 - Total depositado no banco");
            console.log("09 - Média dos saldos");
            console.log("10 - Atualizar número da conta");
            console.log("11 - Ordem bancária");
            console.log("12 - Mudar titularidade");
            console.log("13 - Listar contas sem cliente");
            console.log("\nCLIENTES");
            console.log("20 - Inserir cliente");
            console.log("21 - Consultar cliente");
            console.log("22 - Associar conta a cliente");
            console.log("23 - Excluir cliente");
            console.log("0 - Sair");

            opcao = input("Opção: ");

            try {
                switch (opcao) {
                    case "01": this.inserirConta(); break;
                    case "02": this.consultarConta(); break;
                    case "03": this.sacar(); break;
                    case "04": this.depositar(); break;
                    case "05": this.excluirConta(); break;
                    case "06": this.transferir(); break;
                    case "07": console.log("Quantidade de contas: " + this.banco.quantidadeContas()); break;
                    case "08": console.log("Total no banco: R$ " + this.banco.totalDinheiro().toFixed(2)); break;
                    case "09": console.log("Média dos saldos: R$ " + this.banco.mediaSaldo().toFixed(2)); break;
                    case "10": this.atualizarConta(); break;
                    case "11": this.ordemBancaria(); break;
                    case "12": this.mudarTitularidade(); break;
                    case "13": this.listarContasSemCliente(); break;
                    case "20": this.inserirCliente(); break;
                    case "21": this.consultarCliente(); break;
                    case "22": this.associarConta(); break;
                    case "23": this.excluirCliente(); break;
                    case "0": break;
                    default: console.log("Opção inválida.");
                }
            } catch (erro) {
                console.log("Erro: " + (erro instanceof Error ? erro.message : erro));
            }

            if (opcao !== "0") input("\nOperação finalizada. Pressione ENTER para continuar.");
        } while (opcao !== "0");

        console.log("Aplicação encerrada.");
    }

    private inserirConta(): void {
        let numero = input("Número da conta: ");
        let conta = new Conta(numero, 0);
        this.banco.inserirConta(conta);
        console.log("Conta cadastrada.");
    }

    private consultarConta(): void {
        let numero = input("Número da conta: ");
        let conta = this.banco.consultar(numero);
        if (conta) {
            console.log("Número: " + conta.numero);
            console.log("Saldo: R$ " + conta.saldo.toFixed(2));
            console.log("Titular: " + (conta.cliente ? conta.cliente.nome : "Sem titular"));
            console.log("Abertura: " + conta.dataDeAbertura.toLocaleDateString());
        } else {
            console.log("Conta não encontrada.");
        }
    }

    private sacar(): void {
        let numero = input("Número da conta: ");
        let valor = Number(input("Valor do saque: "));
        this.banco.sacar(numero, valor);
        console.log("Saque realizado.");
    }

    private depositar(): void {
        let numero = input("Número da conta: ");
        let valor = Number(input("Valor do depósito: "));
        this.banco.depositar(numero, valor);
        console.log("Depósito realizado.");
    }

    private excluirConta(): void {
        let numero = input("Número da conta: ");
        this.banco.excluirConta(numero);
        console.log("Conta excluída.");
    }

    private transferir(): void {
        let origem = input("Conta de origem: ");
        let destino = input("Conta de destino: ");
        let valor = Number(input("Valor: "));
        this.banco.transferir(origem, destino, valor);
        console.log("Transferência realizada.");
    }

    private atualizarConta(): void {
        let atual = input("Número atual da conta: ");
        let novo = input("Novo número da conta: ");
        this.banco.atualizar(atual, novo);
        console.log("Número da conta atualizado.");
    }

    private ordemBancaria(): void {
        let origem = input("Conta de origem: ");
        let texto = input("Números das contas de destino (separados por vírgula): ");
        let destinos = texto.split(",").map(item => item.trim()).filter(item => item.length > 0);
        let valor = Number(input("Valor para cada conta de destino: "));
        this.banco.ordemBancaria(origem, destinos, valor);
        console.log("Ordem bancária realizada.");
    }

    private mudarTitularidade(): void {
        let numero = input("Número da conta: ");
        let cpf = input("CPF do novo titular: ");
        this.banco.mudarTitularidade(numero, cpf);
        console.log("Titularidade alterada.");
    }

    private listarContasSemCliente(): void {
        let contas = this.banco.listarContasSemCliente();
        if (contas.length === 0) {
            console.log("Não existem contas sem titular.");
            return;
        }

        console.log("Contas sem titular:");
        for (let conta of contas) console.log(conta.numero + " - R$ " + conta.saldo.toFixed(2));

        let associar = input("Deseja atribuir titular a uma conta? (s/n): ");
        if (associar.toLowerCase() === "s") this.associarConta();
    }

    private inserirCliente(): void {
        let id = Number(input("ID: "));
        let nome = input("Nome: ");
        let cpf = input("CPF: ");
        let dataTexto = input("Data de nascimento (AAAA-MM-DD): ");
        let data = new Date(dataTexto + "T00:00:00");
        if (Number.isNaN(data.getTime())) throw new Error("Data inválida.");

        this.banco.inserirCliente(new Cliente(id, nome, cpf, data));
        console.log("Cliente cadastrado.");
    }

    private consultarCliente(): void {
        let cpf = input("CPF do cliente: ");
        let cliente = this.banco.consultarCliente(cpf);
        if (!cliente) {
            console.log("Cliente não encontrado.");
            return;
        }

        console.log("ID: " + cliente.id);
        console.log("Nome: " + cliente.nome);
        console.log("CPF: " + cliente.cpf);
        console.log("Nascimento: " + cliente.dataNascimento.toLocaleDateString());
        console.log("Contas: " + cliente.contas.map(c => c.numero).join(", "));
    }

    private associarConta(): void {
        let numero = input("Número da conta: ");
        let cpf = input("CPF do cliente: ");
        this.banco.associarContaCliente(numero, cpf);
        console.log("Conta associada ao cliente.");
    }

    private excluirCliente(): void {
        let cpf = input("CPF do cliente: ");
        this.banco.excluirCliente(cpf);
        console.log("Cliente excluído. As contas dele permanecem sem titular.");
    }
}

let app = new App();
app.menu();

# 📘 Conceitos Fundamentais do Projeto em Solana

## ✅ 1. System Account

* Tipo mais básico de conta na Solana.
* Criada automaticamente ao gerar uma carteira (ex: Phantom, Solana CLI).
* Contém **lamports (SOL)**.
* Propriedade do `System Program`.

**Uso:**
Para pagar taxas, enviar/receber SOL e assinar transações.

---

## ✅ 2. Token Account (SPL Token Account)

* Conta especial usada para armazenar tokens SPL (como USDC, WSOL, etc).
* Sempre associada a:

  * Um **mint** (qual token armazena)
  * Um **authority** (dono da conta)
* Criada via `Token Program`.
* Pode ser derivada com `getAssociatedTokenAddress`.

**Uso:**
Para enviar, receber e manter tokens SPL.

---

## ✅ 3. Signer / Payer

* **Signer:** quem autoriza e assina a transação.
* **Payer:** quem paga a taxa da transação (gas).
* Normalmente é a mesma conta, mas podem ser diferentes.

**Uso:**

* Signer: obrigatório em qualquer instrução que modifica dados.
* Payer: obrigatório para instruções que criam contas.

---

## ✅ 4. PDA (Program Derived Address)

* Endereço gerado pelo programa, sem chave privada.
* Seguro, previsível e usado para controlar lógica de contratos.
* Pode assinar transações via `invoke_signed`.

**Uso:**
Para criar vaults, contas de autoridade, e dados relacionados ao programa.

**Exemplo:**

```ts
const [subAccountAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from("sub_account"), subAccount.key().toBuffer()],
  subAccountProgramId
);
```

---

## 📌 Como se relacionam no projeto:

| Componente           | Tipo                | Função                               |
| -------------------- | ------------------- | ------------------------------------ |
| Carteira do usuário  | System Account      | Signer e payer                       |
| Vault de tokens      | Token Account (ATA) | Armazena tokens do usuário ou do bot |
| SubAccount Authority | PDA                 | Assina transações programaticamente  |
| LP Token             | Mint / TokenAccount | Representa participação na liquidez  |

---

## ✅ 5. Como funciona o `memcmp` no Anchor

No trecho abaixo:

```ts
const subAccounts = await subAccountsProgram.account.subAccount.all([
  {
    memcmp: {
      offset: 8 + 32, // pula discriminator + bot
      bytes: userPda.toBase58(),
    },
  },
]);
```

### 📌 O que é `memcmp`?

`memcmp` é uma **ferramenta de filtragem de contas** usada na Solana para buscar contas no blockchain que contêm determinados valores binários em posições específicas do seu layout de memória.

---

### 🔍 Análise linha por linha

```ts
offset: 8 + 32
```

* `8`: é o **discriminador** padrão que todo tipo de conta Anchor tem.
* `32`: tamanho de um `Pubkey` (bot\_address, nesse caso).
* Resultado: estamos buscando a posição onde está armazenado o próximo campo (`user_address`).

```ts
bytes: userPda.toBase58()
```

* Estamos comparando os **32 bytes do Pubkey do usuário**, codificados em base58.
* Se os bytes na posição `8 + 32` forem iguais ao Pubkey informado, essa conta é incluída no resultado.

---

### 🧠 Por que usar?

Em Solana, não dá para buscar “por campo” como em um banco de dados. Então usamos `memcmp` para dizer:

> “me traga todas as contas desse tipo em que os bytes na posição X são iguais a Y”.

---

### ✅ Uso típico

Ideal quando você precisa buscar **todas as contas de um usuário** sem conhecer os PDAs exatos. Exemplo comum:

* Buscar todas as SubAccounts vinculadas a um usuário específico.
* Filtrar Vaults ou posições de liquidez por owner.

---

### 📌 Dica importante

Use com cuidado em contas grandes: filtros `memcmp` forçam o cliente a baixar e processar várias contas. Em projetos maiores, considere indexar ou dividir contas.

## ✅ 6. Limite de tamanho de dados para uma conta

Em Solana, o limite de tamanho de dados para uma conta alocada diretamente na memória (RAM) é de aproximadamente 10.240 bytes (10 KB). Isso é importante pois:

Contas maiores que isso precisam usar contas com armazenamento em disco (off-chain data), como via Arweave ou contas múltiplas divididas.
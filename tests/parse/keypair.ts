const bs58 = require('bs58');
const fs = require('fs');

describe("Parse: necessário para fazer o deploy com uma wallet real", () => {
    it("Keypair (base58) to keypair (64 bytes)", async () => {
        const base58Key = ''; // cole aqui sua chave privada base58 (Phantom) somente para converter, depois apague antes de qualquer push para o github
        const secretKey = bs58.decode(base58Key);
        console.log("Keypair convertida:", JSON.stringify(Array.from(secretKey)));
    });
});
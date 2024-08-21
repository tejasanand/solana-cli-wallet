# 📜 Solana CLI Wallet

A simple CLI tool to manage Solana wallets and perform basic operations like creating keypairs, checking balances, airdropping SOL, and transferring SOL between wallets.

## 🚀 Usage

### 🛠 In the Root Directory:

#### **Create a Keypair**

Creates a new wallet and stores the private and public keys in a JSON file.

```bash
bun src/wallet.ts create keypair <walletname>
```

#### **Request Airdrop**

This command will airdrop <amount> SOL from devnet into the given walletname which has to be already created

```bash
bun src/wallet.ts getsol <walletname> <amount>
```

#### **Check Balance**

Checks the balance for the given wallet

```bash
bun src/wallet.ts balance <walletname>
```

#### **Transfer SOL**

Transfers <amount> SOL from walletname1(sender) to walletname2(receiver)

```bash
bun src/wallet.ts transfer <walletname1> <walletname2> <amount>
```

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
const program = new Command();

const web3 = require("@solana/web3.js");

const {
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");

const LAMPORTS_PER_SOL = 1000000000;

const connection = new web3.Connection(
  web3.clusterApiUrl("devnet"),
  "confirmed"
);

program
  .name("my-cli")
  .description("A CLI for doing something useful")
  .version("1.0.0");

program
  .command("create-keypair <name>")
  .description("Create a new keypair and save it to a JSON file")
  .action((name) => {
    // Generate a new keypair
    let keypair = Keypair.generate();

    // Get the public and secret key in base58 and Uint8Array format
    const publicKeyHash = keypair.publicKey.toBase58();
    const secretKeyArray = Array.from(keypair.secretKey);

    // Create an object to store in JSON
    const keypairData = {
      publicKey: publicKeyHash,
      secretKey: secretKeyArray,
    };

    // Define the file path
    const filePath = path.join(__dirname, `${name}.json`);

    // Write the keypair data to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(keypairData, null, 2));

    console.log(`Keypair created and saved to ${filePath}`);
  });

program
  .command("getsol <walletname> <amount>")
  .description(
    "Get an Airdrop of specified amount of SOL into the wallet provided"
  )
  .action(async (walletname, amount) => {
    try {
      const filePath = path.join(__dirname, `${walletname}.json`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Wallet file ${walletname}.json does not exist.`);
      }

      const keypairData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const secretKey = Uint8Array.from(keypairData.secretKey);
      const keypair = Keypair.fromSecretKey(secretKey);

      const lamports = parseFloat(amount) * web3.LAMPORTS_PER_SOL;

      let airdropSignature = await connection.requestAirdrop(
        keypair.publicKey,
        lamports
      );

      await connection.confirmTransaction({ signature: airdropSignature });

      console.log(
        `Sending ${amount} SOL from wallet ${walletname} (${keypair.publicKey.toBase58()})...`
      );
    } catch (error) {
      console.error("Error during transaction:", error);
    }
  });

program
  .command("balance <walletname>")
  .description("Check your wallet balance")
  .action(async (walletname) => {
    const filePath = path.join(__dirname, `${walletname}.json`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Wallet file ${walletname}.json does not exist.`);
    }

    const keypairData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const secretKey = Uint8Array.from(keypairData.secretKey);
    const keypair = Keypair.fromSecretKey(secretKey);

    const balance = await connection.getBalance(keypair.publicKey);
    console.log(
      "Balance (" + walletname + "): " + balance / web3.LAMPORTS_PER_SOL
    );
  });

program
  .command("transfer <walletname1> <walletname2> <amount>")
  .description(
    "Transfer SOL from 1 wallet to another, 1st wallet will be the sender and 2nd the receiver"
  )
  .action(async (walletname1, walletname2, amount) => {
    const senderFilePath = path.join(__dirname, `${walletname1}.json`);

    if (!fs.existsSync(senderFilePath)) {
      throw new Error(`Wallet file ${walletname1}.json does not exist.`);
    }

    const senderKeypairData = JSON.parse(
      fs.readFileSync(senderFilePath, "utf-8")
    );
    const senderSecretKey = Uint8Array.from(senderKeypairData.secretKey1);
    const senderKeypair = Keypair.fromSecretKey(senderSecretKey);

    const receiverFilePath = path.join(__dirname, `${walletname2}.json`);

    if (!fs.existsSync(receiverFilePath)) {
      throw new Error(`Wallet file ${walletname2}.json does not exist.`);
    }

    const receiverKeypairData = JSON.parse(
      fs.readFileSync(receiverFilePath, "utf-8")
    );
    const receiverSecretKey = Uint8Array.from(receiverKeypairData.secretKey2);
    const receiverKeypair = Keypair.fromSecretKey(receiverSecretKey);

    const amountToTransfer = parseFloat(amount);

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: receiverKeypair.publicKey,
        lamports: amount * web3.LAMPORTS_PER_SOL,
      })
    );

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = senderKeypair.publicKey;
    tx.partialSign(receiverKeypair);

    const serializedTx = tx.serialize();
    const signature = await connection.sendRawTransaction(serializedTx);
    console.log("Signature: ", signature);
  });
program.parse(process.argv);

import { Command } from "commander";

const program = new Command();

const solanaWeb3 = require("@solana/web3.js");

const { Keypair } = require("@solana/web3.js");

program
  .name("my-cli")
  .description("A CLI for doing something useful")
  .version("1.0.0");

program
  .command("create-keypair")
  .description("Create a new keypair")
  .action(() => {
    let keypair = Keypair.generate();
    const publicKeyHash = keypair.publicKey.toBase58();
    console.log("Public Key Hash:", publicKeyHash);
    console.log("Secret Key Hash:", keypair.secretKey);
    console.log("Keypair created!");
  });

program.parse(process.argv);

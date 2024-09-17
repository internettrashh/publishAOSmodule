const Arweave = require('arweave');
const fs = require('fs');

// Initialize Arweave
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

async function loadJwkAndCheckBalance() {
    try {
        // Load JWK from file
        const rawJwk = fs.readFileSync('/Users/nischalnaik/Documents/artest/Wallet.json');
        const jwk = JSON.parse(rawJwk);

        // Get wallet address
        const address = await arweave.wallets.getAddress(jwk);
        console.log('Wallet address:', address);

        // Check wallet balance
        const balance = await arweave.wallets.getBalance(address);
        const arBalance = arweave.ar.winstonToAr(balance);

        console.log('Wallet balance:', arBalance, 'AR');

    } catch (error) {
        console.error('Error:', error);
    }
}

async function uploadWasmFile(jwk, filePath) {
    try {
        // Read the WASM file
        const fileData = fs.readFileSync(filePath);

        // Create the transaction
        const transaction = await arweave.createTransaction({ data: fileData }, jwk);

        // Add tags
        transaction.addTag('Content-Type', 'application/wasm');
        transaction.addTag('Data-Protocol', 'ao');
        transaction.addTag('Type', 'Module');
        transaction.addTag('Variant', 'ao.TN.1');
        transaction.addTag('Module-Format', 'wasm64-unknown-emscripten-draft_2024_02_15');
        transaction.addTag('Input-Encoding', 'JSON-1');
        transaction.addTag('Output-Encoding', 'JSON-1');
        transaction.addTag('Memory-Limit', '1-gb');
        transaction.addTag('Compute-Limit', '9000000000000');

        // Sign the transaction
        await arweave.transactions.sign(transaction, jwk);

        // Submit the transaction
        const response = await arweave.transactions.post(transaction);

        console.log('File uploaded successfully. Transaction ID:', transaction.id);
        console.log('Status:', response.status);

    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

async function main() {
    try {
        const rawJwk = fs.readFileSync('/Users/nischalnaik/Documents/artest/Wallet.json');
        const jwk = JSON.parse(rawJwk);

        await loadJwkAndCheckBalance();

        // Replace with the path to your WASM file
        const wasmFilePath = '/Users/nischalnaik/Documents/artest/process.wasm';
        await uploadWasmFile(jwk, wasmFilePath);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
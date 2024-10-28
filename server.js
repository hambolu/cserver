require('dotenv').config(); // Load environment variables
const express = require('express');
const Web3 = require('web3').default; // Correct import for Web3
const axios = require('axios');
const WebSocket = require('ws');

const app = express();
const port = 5000;

// Middleware to parse JSON
app.use(express.json());

// Connect to Ethereum network
const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);

// Create a wallet
app.post('/wallet', (req, res) => {
    const account = web3.eth.accounts.create();
    res.json({
        address: account.address,
        privateKey: account.privateKey,
    });
});

// Get balance
app.get('/balance/:address', async (req, res) => {
    try {
        const balance = await web3.eth.getBalance(req.params.address);
        res.json({ balance: web3.utils.fromWei(balance, 'ether') + ' ETH' });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Could not retrieve balance' });
    }
});

// Send tokens
app.post('/send', async (req, res) => {
    const { senderPrivateKey, recipientAddress, amount } = req.body;
    try {
        const senderAccount = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
        const nonce = await web3.eth.getTransactionCount(senderAccount.address);
        
        const transaction = {
            to: recipientAddress,
            value: web3.utils.toWei(amount.toString(), 'ether'),
            gas: 2000000,
            nonce: nonce,
        };

        const signedTx = await web3.eth.accounts.signTransaction(transaction, senderPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        res.json({ transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ error: 'Transaction failed' });
    }
});

// Get real-time prices via WebSocket
app.get('/prices', (req, res) => {
    const ws = new WebSocket('wss://ws.coincap.io/prices?assets=ALL');
    
    ws.on('message', (event) => {
        const priceData = JSON.parse(event);
        res.json(priceData);
        ws.close(); // Close connection after getting the first update
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        res.status(500).json({ error: 'WebSocket error' });
    });
});

// Swap tokens (using an external API, e.g., Uniswap)
app.post('/swap', async (req, res) => {
    const { tokenFrom, tokenTo, amount } = req.body;
    try {
        // Placeholder for swap logic
        const response = await axios.post('https://api.uniswap.org/v1/swap', {
            tokenFrom,
            tokenTo,
            amount,
        });
        res.json(response.data);
    } catch (error) {
        console.error('Swap error:', error);
        res.status(500).json({ error: 'Swap failed' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

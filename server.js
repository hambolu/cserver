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
// List of token contract addresses and their names
const tokens = {
    'bnb_balance': null,  // Native BNB token does not require contract address
    'busd_balance': '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    'cake_balance': '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    'usdt_balance': '0x55d398326f99059ff775485246999027b3197955',
    'eth_balance': '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    'btc_balance': '0x7130d2a12b9acbfdcef7f1f2eaac9474b2a1cbd0',

    // Additional popular tokens
    'ada_balance': '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
    'dot_balance': '0x7083609fce4d1d8dc0c979aab8c869ea2c873402',
    'xrp_balance': '0x1d2f0da169ceb9fa6a1c1e2ca40a32e14d5e365d',
    'link_balance': '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
    'ltc_balance': '0x4338665cbb7b2485a8855a139b75d5e34ab0db94',
    'uni_balance': '0xbf5140a22578168fd562dccf235e5d43a02ce9b1',
    'doge_balance': '0xba2ae424d960c26247dd6c32edc70b295c744c43',
    'shib_balance': '0x285b609a3690598dccc3e2c6e46ae6fdb18793e9',

    // Gaming and Metaverse tokens
    'axs_balance': '0x715d400f88c167884bbcc41c5feb68f17f5fbf8e',
    'sxp_balance': '0x8ce6edb10bbf7e7f27a7c8c5d07b695af4f77ad6',
    'mana_balance': '0x7d56c76c7ab8e40531503f2c537d9dc9e6b871f3',
    'sand_balance': '0x72685e33f8c5d5f4fb3d69b9b98eec5299784d16',

    // DeFi tokens
    'ftm_balance': '0xad29abb318791d579433d831ed122afeaf29dcfe',
    'atom_balance': '0x0eb3a705fc54725037cc9e008bdede697f62f335',
    'sol_balance': '0x570a1e4a5b7c7f61c37c8851f3eb9de14c6fa798',
    'avax_balance': '0x1d8bb4a43c4bd93a0e013fa99ce8fdb6e0cf6347',
    'matic_balance': '0xcc42724c6683b7e57334c4e856f4c9965ed682bd',

    // Utility tokens
    'near_balance': '0x1fa4a73a3f0133f0025378af00236f3abdee5d63',
    'bake_balance': '0xe02df9e3e622debdd69fb838bb799e3f168902c5',
    'xvs_balance': '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    'twt_balance': '0x4b0f1812e5df2a09796481ff14017e6005508003',
    'alpaca_balance': '0x8f0528ce5ef7b51152a59745befdd91d97091d2f',

    // Additional DeFi tokens
    'belt_balance': '0xe0e514c71282b6f4e823703a39374cf58dc3ea4f',
    'auto_balance': '0xa184088a740c695e156f91f5cc086a06bb78b827',
    'nuls_balance': '0xb41f8e0fd50f0fdaf8af06b9e6d1d1a0c3e3a83f',
    'bnbx_balance': '0x2e8b72301a6eb6eae23cf940f28e10de91f8d6fa',
    'dai_balance': '0x1af3f329e8be154074d8769d1ffa4ee058b1dbd5',
    'fil_balance': '0x0b9d9d4bc405a146e3bda3b4bfa14c60e96b2ec4',

    // Gaming and Metaverse
    'hero_balance': '0xc0eff7749b125444953ef89682201fb8c6a917cd',
    'dar_balance': '0x7c632e54c6f6bc5dd8a3d788c6f073a9e9b7e6ab',
    'chr_balance': '0xb8a422c41a0dd5b2db7f8e1c9bb2359e35173157',
    'gala_balance': '0x7d5b88fbd33b1640f25ff446cbabc40fe6a083f5',
    'enj_balance': '0x5a12b6e42b59eb43dba6c8b6d267792e27fcf3f1',

    // More Utility tokens
    'band_balance': '0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18',
    'perp_balance': '0xb5b00e11b5c08ef18a3a18a4b6879cdb19d69c2c',
    'coti_balance': '0xadbdb7f4e27da13dd71b4cafe5c701b63b4f0099',
    'ocean_balance': '0xdce07662ca8ebc241316a15b611c89711414dd1a',
    'rune_balance': '0xa9776b590bfc2f956711b3419910a5ec1f63153e',
    'zil_balance': '0x7f9b4d73bd57c7889c7fced0142f6d6bdb508376',
    'hbar_balance': '0x47ec6e8e5e263d399f16f9b1f84c4b45492b4209',
    'ont_balance': '0xafd3d4ef7e6c2bffb5bfe0fdf5bafaa9fe2fbfbc',
    'one_balance': '0x03c5f8d05a92e7d4b4ec5f978d09b5f9c1b4d7ed',
    'ctk_balance': '0x8ab893e29fa2735bc5d91f79da14f20442a7a9c5',
    'theta_balance': '0x3ea1f43d8c4c69d7278d7e909f18d8325b08caa4',
    'vet_balance': '0x6f163d147c4fa7e03f3a1ccfd2a57b4d5b7b5d2c',
    'nkn_balance': '0x9e54fb8d8e6dabe7b2f1e1d2e7f514b9b8fbb56f'
};

const erc20Abi = [
    // balanceOf function ABI
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    }
];
// Get balance
// app.get('/balance/:address', async (req, res) => {
//     try {
//         const balance = await web3.eth.getBalance(req.params.address);
//         res.json({ balance: web3.utils.fromWei(balance, 'ether') + ' ETH' });
//     } catch (error) {
//         console.error('Error fetching balance:', error);
//         res.status(500).json({ error: 'Could not retrieve balance' });
//     }
// });
app.get('/balance/:address', async (req, res) => {
    const address = req.params.address;
    let balances = {};

    try {
        // Get the native BNB balance
        const bnbBalance = await web3.eth.getBalance(address);
        balances['bnb_balance'] = web3.utils.fromWei(bnbBalance, 'ether') + ' BNB';

        // Iterate over tokens and get each balance
        for (const [tokenName, tokenAddress] of Object.entries(tokens)) {
            if (tokenAddress) {
                // Create a contract instance for the token
                const contract = new web3.eth.Contract(erc20Abi, tokenAddress);

                // Call balanceOf for the user's address
                const balance = await contract.methods.balanceOf(address).call();
                balances[tokenName] = web3.utils.fromWei(balance, 'ether');
            }
        }

        res.json(balances);
    } catch (error) {
        console.error('Error fetching balances:', error);
        res.status(500).json({ error: 'Could not retrieve balances' });
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

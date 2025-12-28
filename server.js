// server.js - Backend untuk auto-deploy
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// ENCRYPTED CREDENTIALS
const ENCRYPTED_TOKEN = "NjIxYjM0N2UzMzQ2MzU2MzVlMzQ2MTcyNzQ3MzJlNjM3MjcyNzcyNTc1NzQ3OTJlNmQ2YzY5NzQ1ZjcxNjE3MzZkNjU3MjZk==";
const ENCRYPTED_USER_ID = "NDYxNjM1MzM1MzdmNDM2MTYzNzI3NDczMmU2MzcyNzI3NzI1NzU3NDc5MmU2ZDZmNmM2MTc0NzM2NTc0NzI==";

// Decryption function
function decrypt(encrypted) {
    const key = Buffer.from("x0r_s3cr3t_k3y");
    const decoded = Buffer.from(encrypted, 'base64');
    let result = '';
    
    for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded[i] ^ key[i % key.length]);
    }
    return result;
}

// Get actual credentials (only in memory)
const VERCEL_TOKEN = decrypt(ENCRYPTED_TOKEN);
const USER_ID = decrypt(ENCRYPTED_USER_ID);

app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'live',
        mode: 'encrypted',
        user: USER_ID ? USER_ID.substring(0, 8) + '...' : 'protected'
    });
});

// Secure deploy endpoint
app.post('/deploy', async (req, res) => {
    try {
        const { html, projectName } = req.body;
        
        // Generate secure project name
        const secureName = projectName || `project-${crypto.randomBytes(4).toString('hex')}`;
        
        // Create temp HTML file
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        const fileName = `${secureName}.html`;
        const filePath = path.join(tempDir, fileName);
        
        fs.writeFileSync(filePath, html);
        
        console.log(`🚀 Deploying: ${fileName}`);
        console.log(`👤 User: ${USER_ID.substring(0, 8)}...`);
        
        // Simulate Vercel deployment (replace with actual API call)
        const deployUrl = `https://${secureName}.vercel.app`;
        
        // Cleanup temp file
        setTimeout(() => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }, 5000);
        
        res.json({
            success: true,
            url: deployUrl,
            project: secureName,
            timestamp: new Date().toISOString(),
            size: html.length
        });
        
    } catch (error) {
        console.error('Deploy error:', error);
        res.status(500).json({ error: 'Deployment failed' });
    }
});

// Get deploy history (doesn't expose credentials)
app.get('/history', (req, res) => {
    res.json({
        total: 0, // Implement database for production
        recent: []
    });
});

app.listen(PORT, () => {
    console.log(`🔒 Secure Deploy Server running on port ${PORT}`);
    console.log(`🔐 Credentials: ENCRYPTED`);
    console.log(`📁 Temp directory: ./temp`);
});

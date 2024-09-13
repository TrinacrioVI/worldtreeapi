const express = require('express');
const { get } = require('http');
const app = express();
const PORT = 5000;

//Middleware
app.use(express.json());

// GET api
app.get('/dice', (req, res) => {
    
    const currentTimeStamp = getCurrentTimeStamp();
    const userID = req.query.userID;
    const timeStamp = req.query.timeStamp; 
    // timeStamp format 'YYMMDDHHMMSS' //
    const dice = req.query.dice;
    const authToken = req.query.authToken;

    function getCurrentTimeStamp() {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const currentTimeStamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    
        return currentTimeStamp;
    }
    // currentTimeStamp format 'YYMMDDHHMMSS' //

    //parse authToken to extract timeStamp (it's embeeded in authToken)
    if(currentTimeStamp - timeStamp > 300){
        return res.status(400).send('Please reauthenticate token');
    }

    //add callDB to confirm userID and token are registered as active in diceRollActiveUserIDs

    //verify input data
    if (!dice || !Array.isArray(dice)) {
        return res.status(400).send('Please provide a valid array of numbers for the number of faces.');
    } else if (!dice.every(item => Number.isInteger(Number(item)) && item > 0 && item < 241)) {
        return res.status(400).send('Each face count must be a positive integer less than 241.');
    }

    const result = [];
    for (let i = 0; i < dice.length; i++) {
        const face = dice[i];
        const roll = Math.floor(Math.random() * face) + 1;
        result.push(roll);
    }

    const response = {userID, timeStamp, currentTimeStamp, dice, result}

    res.send({response});
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


app.post('/dice', (req, res) => {
    const userID = req.body.userID || 'Unknown User ID';
    const timeStamp = req.query.timeStamp; 
    const currentAuthToken = req.body.authToken || 'No Auth Token';

    //add call  to database to check userID and token in diceRollActiveUserIDs
    if (currentAuthToken !== 'oldAUTH_TOKEN') {
        return res.status(400).json({ message: 'Invalid authentication token' });
    }

    //generateToken()
    // (salt +) ? randomprefix + |marker| + timeStamp 'YYMMDDHHMMSS'
    // 
    
    let newAuthToken = `newAUTH_TOKEN|marker|${timeStamp}`; //replace with generateToken()
    res.json({
        userID: userID,
        authToken: newAuthToken
    });
});

  

const express = require('express');
const axios = require('axios');
const { performance } = require('perf_hooks');

const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;
const THIRD_PARTY_API_TIMEOUT = 500;
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ2Njg5NDc4LCJpYXQiOjE3NDY2ODkxNzgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVmNGJiMDliLWJlMzYtNDE4OS04MmQ2LTAxZGI1N2E5ZTkwZSIsInN1YiI6ImFyeWFuc2h1OTE5QGdtYWlsLmNvbSJ9LCJlbWFpbCI6ImFyeWFuc2h1OTE5QGdtYWlsLmNvbSIsIm5hbWUiOiJhcnlhbiBrdW1hciIsInJvbGxObyI6IjIxMDQ5MjAxMDAwMzkiLCJhY2Nlc3NDb2RlIjoiYmFxaFdjIiwiY2xpZW50SUQiOiI1ZjRiYjA5Yi1iZTM2LTQxODktODJkNi0wMWRiNTdhOWU5MGUiLCJjbGllbnRTZWNyZXQiOiJEY1dTQkNDZEFnVWd3UmJSIn0.jr-ERZrdHMGGghPrhyKJT6OQWl3TnrH09oW-Uryv_9s";


const numberWindows = {
    p: [], 
    f: [], 
    e: [],
    r: [] 
};


const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
};


const fetchNumbers = async (type) => {
    const thirdPartyUrls = {
        p: 'http://20.244.56.144/evaluation-service/primes',
        f: 'http://20.244.56.144/evaluation-service/fibo',
        e: 'http://20.244.56.144/evaluation-service/even',
        r: 'http://20.244.56.144/evaluation-service/rand'
    };

    try {
        console.log(thirdPartyUrls[type]);
        const startTime = performance.now();
        const response = await axios.get(thirdPartyUrls[type], {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            timeout: THIRD_PARTY_API_TIMEOUT
        });
        const elapsed = performance.now() - startTime;
        if (elapsed > THIRD_PARTY_API_TIMEOUT) {
            console.log(`Timeout exceeded for ${type} numbers`);
            return [];
        }

        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
};

const processNumbers = (type, newNumbers) => {
    const prevState = [...numberWindows[type]];
    const currentWindow = numberWindows[type];
    
    newNumbers.forEach(num => {
        if (!currentWindow.includes(num)) {
            if (currentWindow.length >= WINDOW_SIZE) {
                currentWindow.shift();
            }
            currentWindow.push(num);
        }
    });

    return {
        windowPrevState: prevState,
        windowCurrState: [...currentWindow],
        numbers: newNumbers,
        avg: calculateAverage(currentWindow)
    };
};


app.get('/numbers/:numberid', async (req, res) => {
    const type = req.params.numberid.toLowerCase();
    if (!['p', 'f', 'e', 'r'].includes(type)) {
        return res.status(400).json({ error: 'Invalid number type' });
    }

    try {
        const newNumbers = await fetchNumbers(type);
        console.log("logging new no", newNumbers);
        const result = processNumbers(type, newNumbers);
        res.json(result);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/",(req,res) =>{
    res.send("you are at home routes")
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
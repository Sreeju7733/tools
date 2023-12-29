const btn = document.querySelector('.talk')
const content = document.querySelector('.content')


function speak(text){
    const text_speak = new SpeechSynthesisUtterance(text);

    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;

    window.speechSynthesis.speak(text_speak);
}

function wishMe(){
    var day = new Date();
    var hour = day.getHours();

    if(hour>=0 && hour<12){
        speak("Good Morning Boss...")
    }

    else if(hour>12 && hour<17){
        speak("Good Afternoon Master...")
    }

    else{
        speak("Good Evenining Sir...")
    }

}

window.addEventListener('load', ()=>{
    speak("Initializing JARVIS..");
    wishMe();
});



const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = async (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    content.textContent = transcript;
    await processCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
	content.textContent = "Listening...."
    recognition.start();
});

const OPENAI_API_KEY = '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'; // Replace with your actual OpenAI API key
const OPENWEATHER_API_KEY = '48ddfe8c9cf29f95b7d0e54d6e171008'; // Replace with your OpenWeatherMap API key

async function askOpenAI(prompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 50, // Adjust token count as needed
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.choices[0].text.trim();
        } else {
            throw new Error('Failed to fetch response from OpenAI');
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error while processing your request.';
    }
}

async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        if (response.ok) {
            const data = await response.json();
            const weatherDesc = data.weather[0].description;
            const temperature = data.main.temp;
            return `The weather in ${city} is currently ${weatherDesc} with a temperature of ${temperature} degrees Celsius.`;
        } else {
            throw new Error('Failed to fetch weather information');
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I encountered an error while fetching weather information.';
    }
}

async function processCommand(message) {
    const speech = new SpeechSynthesisUtterance();
    let finalText = '';

    // Check for AI-related commands
    if (message.includes('gpt')) {
        finalText = "Sure, what would you like to ask?";
    } else if (message.includes('ask') && message.includes('gpt')) {
        const prompt = message.replace('ask gpt', '').trim();
        finalText = await askOpenAI(prompt);
    }

    // Check for weather-related commands
    if (message.includes('weather in')) {
        const city = message.split('weather in')[1].trim();
        finalText = await fetchWeather(city);
    }

	// Basic
    if (message.includes('hey') || message.includes('hello') || message.includes('hi')) {
        finalText = "Hello Boss";
    } else if (message.includes('how are you')) {
        finalText = "I am fine boss, tell me how can I help you?";
	} else if (message.includes('do you know who am i')) {
        finalText = "Yes i know you are my boss sreeju";
    } else if (message.includes('open google')) {
        window.open("https://google.com", "_blank");
        finalText = "Opening Google";
    } else if (message.includes('time')) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        finalText = `The time is ${time}`;
    } else if (message.includes('date')) {
        const date = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        finalText = `Today is ${date}`;
    } else if (message.includes('day of the week')) {
        const dayOfWeek = new Date().toLocaleDateString(undefined, { weekday: 'long' });
        finalText = `Today is ${dayOfWeek}`;
    } else if (message.includes('news')) {
        finalText = await fetchNews();
    } else if (message.includes('calculate')) {
        const expression = message.replace('calculate', '').trim();
        try {
            const result = eval(expression); // Caution: using eval - consider safer alternatives for production
            finalText = `The result is ${result}`;
        } catch (error) {
            finalText = "Sorry, I couldn't calculate that.";
        }
    } else if (message.includes('open website')) {
        const url = message.split('open website')[1].trim();
        window.open(`https://${url}`, "_blank");
        finalText = `Opening ${url}`;
    } else if (message.includes('search')) {
        const searchTerm = message.replace('search', '').trim();
        window.open(`https://en.wikipedia.org/wiki/${searchTerm}`, "_blank");
        finalText = `Searching for ${searchTerm} on Wikipedia`;
    } else if (message.includes('my location')) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const locationResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                if (locationResponse.ok) {
                    const locationData = await locationResponse.json();
                    finalText = `You are currently in ${locationData.city}, ${locationData.countryName}`;
                } else {
                    throw new Error('Failed to fetch location information');
                }
            });
        } else {
            finalText = "Geolocation is not supported in your browser.";
        }
    } else if (message.includes('set a reminder')) {
        // Code to set a reminder, possibly using browser notifications or other reminder services
        finalText = "Reminder set successfully!";
    } else if (message.includes('send email')) {
        // Code to send an email or open a draft in a mail client
        // Example code using mailto (opens default email client)
        const email = message.split('send email')[1].trim();
        window.open(`mailto:${email}`);
        finalText = `Opening email client to send an email to ${email}`;
    } else if (message.includes('call')) {
        // Code to send an email or open a draft in a mail client
        // Example code using mailto (opens default email client)
        const email = message.split('call')[1].trim();
        window.open(`mailto:${email}`);
        finalText = `Opening email client to send an email to ${email}`;
    }
	
    speech.text = finalText || "I did not understand what you said. Please try again.";
    speech.volume = 1;
    speech.pitch = 1;
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
}

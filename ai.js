const API_URL = 'https://withered-poetry-2bc7.clcelextine310.workers.dev/'; 

const aiToggleBtn = document.getElementById('ai-toggle-btn');
const aiChatBox = document.getElementById('ai-chat-box');
const closeAiBtn = document.getElementById('close-ai');
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');
const aiMessages = document.getElementById('ai-messages');
const aiSaveBtn = document.getElementById('save-btn');
const aiResultPanel = document.getElementById('ai-result-panel');

// 悬浮窗开关
if (aiToggleBtn) {
    aiToggleBtn.addEventListener('click', () => {
        if (aiChatBox.style.display === 'none' || aiChatBox.style.display === '') {
            aiChatBox.style.display = 'block';
            aiToggleBtn.style.transform = 'scale(0.9)';
        } else {
            aiChatBox.style.display = 'none';
            aiToggleBtn.style.transform = 'scale(1)';
        }
    });
}

if (closeAiBtn) {
    closeAiBtn.addEventListener('click', () => {
        aiChatBox.style.display = 'none';
        aiToggleBtn.style.transform = 'scale(1)';
    });
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.innerText = text;
    if (sender === 'user') {
        msgDiv.style.cssText = "background: rgba(58, 159, 237, 0.3); padding: 8px 12px; border-radius: 8px; border-bottom-right-radius: 0; align-self: flex-end; max-width: 85%; color: #fff; margin-bottom: 10px;";
    } else {
        msgDiv.style.cssText = "background: rgba(58, 159, 237, 0.2); padding: 8px 12px; border-radius: 8px; border-bottom-left-radius: 0; align-self: flex-start; max-width: 85%; border: 1px solid rgba(58, 159, 237, 0.3); margin-bottom: 10px;";
    }
    aiMessages.appendChild(msgDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

async function callAI(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        // 🌟 核心亮点：让 AI 自行联网/利用知识库去判定脏话（哪怕拼写变体也能认出）
                        content: "You are a NASA flight director. Answer concisely. SECURITY PROTOCOL: You must analyze the user's input. If it contains any profanity, hate speech, or inappropriate words (including deliberate misspellings or slang), you must abort and reply EXACTLY with: '⚠️ Inappropriate language detected. Please maintain professional communication.' If clean, answer normally in 1 or 2 sentences." 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!response.ok) return `Network Error: Status ${response.status}.`;
        const data = await response.json();
        if (data.error) return `API Error: ${data.error.message}`;
        
        if (data.choices && data.choices.length > 0) {
            let text = data.choices[0].message.content;
            if (!text || text.trim() === "") return "AI returned an empty response.";
            return text.trim();
        }
        return "Error: Invalid format from AI.";
    } catch (error) {
        console.error(error);
        return "Connection Error. Check your Cloudflare URL or CORS.";
    }
}

async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;
    
    appendMessage(userText, 'user');
    aiInput.value = '';

    const simData = window.getCurrentSimData ? window.getCurrentSimData() : null;
    let context = "No site selected.";
    if (simData) {
        context = `Current site: ${simData.site.name}, Illumination: ${simData.lightScore}%, Slope: ${simData.site.slope}.`;
    }

    const msgDiv = document.createElement('div');
    msgDiv.innerText = "AI is thinking...";
    msgDiv.id = "ai-loading";
    msgDiv.style.cssText = "background: rgba(58, 159, 237, 0.2); padding: 8px 12px; border-radius: 8px; border-bottom-left-radius: 0; align-self: flex-start; max-width: 85%; font-style: italic; margin-bottom: 10px;";
    aiMessages.appendChild(msgDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    const prompt = `Context: ${context} \nUser Question: ${userText}`;
    const reply = await callAI(prompt);
    
    const loading = document.getElementById('ai-loading');
    if(loading) loading.remove();
    appendMessage(reply, 'bot');
}

if (aiSendBtn) {
    aiSendBtn.addEventListener('click', sendMessage);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

if (aiSaveBtn && aiResultPanel) {
    aiSaveBtn.addEventListener('click', async () => {
        const simData = window.getCurrentSimData ? window.getCurrentSimData() : null;
        if (!simData) { alert("Please select a landing site first!"); return; }

        aiResultPanel.style.display = 'block';
        aiResultPanel.style.borderColor = "#3a9fed";
        aiResultPanel.innerHTML = "<span style='color:#3a9fed;'>🤖 AI is analyzing mission telemetry...</span>";

        let isSuccess = true;
        let failReason = "";

        if (simData.lightScore < 60) {
            isSuccess = false;
            failReason = "Insufficient solar illumination (below 60%) for stable power generation.";
        } else if (simData.site.slope.includes("Unknown") || simData.site.slope.includes("exceeding") || simData.site.slope.includes("12") || simData.site.slope.includes("14")) {
            isSuccess = false;
            failReason = "The terrain slope is too steep for a safe landing.";
        }

        let prompt = isSuccess 
            ? `Commander, the landing at ${simData.site.name} is a success. Illumination is ${simData.lightScore}% and slope is ${simData.site.slope}. Write one very short sentence confirming the safe landing. No Markdown.`
            : `Commander, the landing at ${simData.site.name} failed. Illumination is ${simData.lightScore}% and slope is ${simData.site.slope}. Reason: ${failReason}. Write one very short sentence explaining this failure to the crew. No Markdown.`;

        let reply = await callAI(prompt);
        
        reply = reply.replace(/^(STATUS:|REASON:).*/gim, '').replace(/[\r\n]+/g, ' ').trim();
        
        if (!reply || reply.includes("Error") || reply.includes("empty") || reply.includes("inappropriate")) {
            reply = isSuccess ? "All systems nominal. Safe to land." : failReason;
        }

        if (isSuccess) {
            aiResultPanel.style.borderColor = "#00ffcc"; 
            aiResultPanel.innerHTML = `
                <strong style="color:#00ffcc; font-size: 20px;">✅ MISSION SUCCESS</strong><br><br>
                <span style="font-size: 14px; line-height: 1.5; color: #e2e8f0;">${reply}</span>
            `;
        } else {
            aiResultPanel.style.borderColor = "#ff4444"; 
            aiResultPanel.innerHTML = `
                <strong style="color:#ff4444; font-size: 20px;">❌ MISSION FAILED</strong><br><br>
                <span style="font-size: 14px; line-height: 1.5; color: #e2e8f0;"><strong>Reason:</strong> ${reply}</span>
            `;
        }
    });
}
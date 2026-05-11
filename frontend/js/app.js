if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado', reg.scope))
            .catch(err => console.error('Fallo en Service Worker:', err));
    });
}

document.getElementById('sendBtn').addEventListener('click', async () => {
    const text = document.getElementById('userInput').value.trim();
    if (!text) return;

    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.innerText = "Sintiendo...";

    try {
        const response = await fetch('http://localhost:8000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) throw new Error("Error en el servidor");

        const data = await response.json();
        
        document.getElementById('validationText').innerText = data.validation;
        document.getElementById('messageText').innerText = data.message;
        document.getElementById('songText').innerText = data.song;
        document.getElementById('actionText').innerText = data.action;
        
        document.getElementById('response-area').style.display = 'block';
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Compartir";
    }
});

let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById('startRecord');
const stopBtn = document.getElementById('stopRecord');
const sendBtn = document.getElementById('sendAudio');
const playback = document.getElementById('playback');

export function setupAudioRecorder() {
    
    startBtn.onclick = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
    
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
    
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' });
            const audioUrl = URL.createObjectURL(audioBlob);
            playback.src = audioUrl;
            playback.style.display = 'block';
            sendBtn.disabled = false;
    
            // Salva o blob para envio posterior
            sendBtn.onclick = () => sendAudio(audioBlob);
        };
    
        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    };
    
    stopBtn.onclick = () => {
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };
    
    function sendAudio(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, `recorded-${Date.now()}.ogg`);
        formData.append('to', '5511999999999'); // <-- Substitua pelo número desejado
    
        fetch('http://192.168.0.243:5000/send-audio', {
            method: 'POST',
            body: formData
        }).then(res => res.json())
          .then(data => {
              alert('Áudio enviado com sucesso!');
              console.log(data);
          }).catch(err => {
              console.error('Erro ao enviar áudio:', err);
          });
    
        sendBtn.disabled = true;
        playback.style.display = 'none';
    }
}

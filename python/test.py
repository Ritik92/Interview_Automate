import sounddevice as sd
import numpy as np
import wave
import requests
import time
import json
import pyttsx3
ASSEMBLYAI_API_KEY = 'dadc0c26f6a947acb363a7a9e46424f2'

# Initialize text-to-speech engine
engine = pyttsx3.init()

def fetch_questions():
    try:
        # Make POST request with access code
        response = requests.post(
            'http://localhost:3000/api/questions',
            json={'accessCode': 'DEV2023'},  # Use your actual access code parameter name if different
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            # Extract question content from the API response
            questions_data = response.json()
            return [q['content'] for q in questions_data['questions']]
            
        print(f"API request failed with status {response.status_code}")
        
    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
    
    # Fallback questions if API fails
    return [
        "What is your name?",
        "How are you today?",
        "What is your favorite programming language?"
    ]

def speak_question(question):
    print(f"Question: {question}")
    engine.say(question)
    engine.runAndWait()
    time.sleep(1)  # Pause after speaking

def record_audio(filename, duration=5, samplerate=44100):
    print(f"Recording answer... ({duration} seconds)")
    recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype=np.int16)
    sd.wait()
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit PCM
        wf.setframerate(samplerate)
        wf.writeframes(recording.tobytes())
    
    print("Recording saved\n")

def transcribe_audio(filename):
    print("Transcribing audio...")
    
    # Upload audio file
    upload_url = "https://api.assemblyai.com/v2/upload"
    headers = {'authorization': ASSEMBLYAI_API_KEY}
    
    with open(filename, 'rb') as f:
        response = requests.post(upload_url, headers=headers, data=f)
    
    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")
    
    audio_url = response.json()['upload_url']

    # Start transcription
    transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    data = {
        "audio_url": audio_url,
        "language_code": "en_us"
    }
    
    response = requests.post(transcript_endpoint, json=data, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Transcription failed: {response.text}")
    
    transcript_id = response.json()['id']
    polling_url = f"{transcript_endpoint}/{transcript_id}"
    
    # Poll for transcription result
    while True:
        response = requests.get(polling_url, headers=headers)
        status = response.json()['status']
        
        if status == 'completed':
            return response.json()['text']
        elif status == 'error':
            raise Exception(f"Transcription error: {response.json()['error']}")
        
        time.sleep(1)

def main():
    questions = fetch_questions()
    qa_pairs = []
    
    for i, question in enumerate(questions):
        speak_question(question)
        
        filename = f"answer_{i+1}.wav"
        record_audio(filename, duration=5)
        
        # Transcribe recording
        answer = transcribe_audio(filename)
        qa_pairs.append({
            "question": question,
            "answer": answer.strip()
        })
    
    # Save to JSON file
    with open('qa_data.json', 'w') as f:
        json.dump(qa_pairs, f, indent=2)
    
    print("Successfully saved Q&A data to qa_data.json")
    print(qa_pairs)

if __name__ == "__main__":
    main()
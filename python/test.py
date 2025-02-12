import sounddevice as sd
import numpy as np
import wave
import requests
import time
import json
import pyttsx3
import os
from datetime import datetime

ASSEMBLYAI_API_KEY = 'dadc0c26f6a947acb363a7a9e46424f2'
API_BASE_URL = 'http://localhost:3000/api'
DEVICE_ID = 'PI_DEVICE_001'  # Unique identifier for this Raspberry Pi

# Initialize text-to-speech engine
engine = pyttsx3.init()

class InterviewSession:
    def __init__(self):
        self.interview_id = None
        self.questions = []
        self.test_title = None
        self.total_questions = 0

def fetch_questions(access_code):
    try:
        # Make POST request with access code and device ID
        response = requests.post(
            f'{API_BASE_URL}/questions',
            json={
                'accessCode': access_code,
                'deviceId': DEVICE_ID
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            session = InterviewSession()
            session.interview_id = data['interviewId']
            session.questions = data['questions']
            session.test_title = data['testTitle']
            session.total_questions = data['totalQuestions']
            return session
            
        print(f"API request failed with status {response.status_code}: {response.json()['error']}")
        return None
        
    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
        return None

def speak_question(question):
    print(f"\nQuestion: {question['content']}")
    print(f"Time limit: {question['timeLimit']} seconds")
    engine.say(question['content'])
    engine.runAndWait()
    time.sleep(1)  # Pause after speaking

def record_audio(filename, duration, samplerate=44100):
    print(f"Recording answer... ({duration} seconds)")
    print("Recording will start in 3 seconds...")
    time.sleep(3)  # Countdown
    
    recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype=np.int16)
    
    # Show progress bar
    for i in range(duration):
        print(f"Recording: {('■' * (i+1)) + ('□' * (duration-i-1))} {i+1}/{duration}s", end='\r')
        time.sleep(1)
    print("\nRecording complete!")
    
    sd.wait()
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit PCM
        wf.setframerate(samplerate)
        wf.writeframes(recording.tobytes())
    
    print("Recording saved\n")

def transcribe_audio(filename):
    print("Transcribing audio...")
    
    upload_url = "https://api.assemblyai.com/v2/upload"
    headers = {'authorization': ASSEMBLYAI_API_KEY}
    
    with open(filename, 'rb') as f:
        response = requests.post(upload_url, headers=headers, data=f)
    
    if response.status_code != 200:
        raise Exception(f"Upload failed: {response.text}")
    
    audio_url = response.json()['upload_url']

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
    
    while True:
        response = requests.get(polling_url, headers=headers)
        status = response.json()['status']
        
        if status == 'completed':
            return response.json()['text']
        elif status == 'error':
            raise Exception(f"Transcription error: {response.json()['error']}")
        
        time.sleep(1)

def submit_response(interview_id, question_id, audio_url, transcript):
    try:
        response = requests.post(
            f'{API_BASE_URL}/responses',
            json={
                'interviewId': interview_id,
                'questionId': question_id,
                'audioUrl': audio_url,
                'transcript': transcript,
                'deviceId': DEVICE_ID
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 200:
            print(f"Failed to submit response: {response.json()['error']}")
            return False
            
        return True
        
    except Exception as e:
        print(f"Error submitting response: {str(e)}")
        return False

def update_interview_status(interview_id, status, candidate_name=None):
    try:
        data = {
            'interviewId': interview_id,  # Changed to include interview_id in body
            'status': status,
            'deviceId': DEVICE_ID
        }
        if candidate_name:
            data['candidateName'] = candidate_name
            
        response = requests.patch(
            f'{API_BASE_URL}/interviews',  # Changed route to /interviews
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error updating interview status: {str(e)}")
        return False
def generate_report(interview_id):
    try:
        response = requests.post(
            f'{API_BASE_URL}/reports',
            json={
                'interviewId': interview_id,
                'deviceId': DEVICE_ID
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            report = response.json()
            print("\n=== Interview Report Generated ===")
            print(f"Total Score: {report['totalScore']:.1f}/10")
            print("\nFeedback:")
            print(report['feedback'])
            return True
            
        print(f"Failed to generate report: {response.json()['error']}")
        return False
        
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        return False    
def main():
    print("=== Interview Recording System ===")
    access_code = input("Please enter the test access code: ")
    
    session = fetch_questions(access_code)
    if not session:
        print("Failed to start interview session")
        return
        
    print(f"\nTest: {session.test_title}")
    print(f"Total questions: {session.total_questions}")
    
    candidate_name = input("\nPlease enter candidate's name: ")
    if not update_interview_status(session.interview_id, 'IN_PROGRESS', candidate_name):
        print("Failed to update interview status")
        return
    
    print("\nStarting interview...\n")
    
    recordings_dir = f"recordings_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(recordings_dir, exist_ok=True)
    
    try:
        for i, question in enumerate(session.questions, 1):
            print(f"\nQuestion {i} of {session.total_questions}")
            speak_question(question)
            
            filename = os.path.join(recordings_dir, f"answer_{i}.wav")
            record_audio(filename, duration=question['timeLimit'])
            
            print("Transcribing your answer...")
            transcript = transcribe_audio(filename)
            
            # For demo purposes, using local file path as audio URL
            audio_url = f"file://{os.path.abspath(filename)}"
            
            
            
            print(f"\nTranscript: {transcript}\n")
            print("-" * 50)

            if not submit_response(session.interview_id, question['id'], audio_url, transcript):
                print("Failed to submit response, but continuing with interview...")
        
        if update_interview_status(session.interview_id, 'COMPLETED'):
            print("\nInterview completed successfully!")
            print("\nGenerating interview report...")
            if generate_report(session.interview_id):
                print("\nReport generated successfully!")
            else:
                print("\nFailed to generate report")
        else:
            print("\nInterview completed but failed to update final status")
            
    except Exception as e:
        print(f"\nError during interview: {str(e)}")
        update_interview_status(session.interview_id, 'FAILED')
        
    print(f"\nAll recordings saved in: {recordings_dir}")

if __name__ == "__main__":
    main()
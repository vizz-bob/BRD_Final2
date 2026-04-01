# integrations/services/chatbot/openai_voice_service.py
import openai

# Directly assign the secret key (wrap it in quotes!)
openai.api_key = "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"

def transcribe_audio(file_path, model="whisper-1"):
    """
    Transcribe an audio file to text using OpenAI Whisper model
    :param file_path: path to audio file
    :param model: model name, default "whisper-1"
    :return: dict with status and text
    """
    try:
        with open(file_path, "rb") as audio_file:
            response = openai.audio.transcriptions.create(
                model=model,
                file=audio_file
            )
        return {"status": "success", "text": response.text}
    except Exception as e:
        return {"status": "error", "error": str(e)}
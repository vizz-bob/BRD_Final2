# integrations/services/chatbot/openai_service.py
import openai

# ⚠️ Use quotes around the key
openai.api_key = "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"

def get_chat_response(prompt, model="gpt-4o-mini"):
    """
    Send a prompt to OpenAI Chat API and get response
    """
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message.content
        return {"status": "success", "response": answer}
    except Exception as e:
        return {"status": "error", "error": str(e)}
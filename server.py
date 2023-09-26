import os
import appdirs
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

from rich import print
from llama_cpp import Llama
from typing_extensions import TypedDict, Literal
from typing import List

Role = Literal["system", "user", "assistant"]


class Message(TypedDict):
    role: Role
    content: str


B_INST, E_INST = "[INST]", "[/INST]"
B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"
DEFAULT_SYSTEM_PROMPT = """\
You are a helpful, respectful and honest assistant. Always answer as helpfully as possible.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information."""


def make_prompt_llama2(llm, messages: List[Message]) -> List[int]:
    if messages[0]["role"] != "system":
        messages = [
            {
                "role": "system",
                "content": DEFAULT_SYSTEM_PROMPT,
            }
        ] + messages

    messages = [
        {
            "role": messages[1]["role"],
            "content": B_SYS + messages[0]["content"] + E_SYS + messages[1]["content"],
        }
    ] + messages[2:]

    assert all([msg["role"] == "user" for msg in messages[::2]]) and all(
        [msg["role"] == "assistant" for msg in messages[1::2]]
    ), (
        "model only supports 'system', 'user' and 'assistant' roles, "
        "starting with 'system', then 'user' and alternating (u/a/u/a/u...)"
    )

    dialog_tokens = sum(
        [
            llm.tokenize(
                bytes(
                    f"{B_INST} {(prompt['content']).strip()} {E_INST} {(answer['content']).strip()} ",
                    "utf-8",
                ),
                add_bos=True,
            )
            + [llm.token_eos()]
            for prompt, answer in zip(
                messages[::2],
                messages[1::2],
            )
        ],
        [],
    )

    assert messages[-1]["role"] == "user", f"Last message must be from user, got {messages[-1]['role']}"

    dialog_tokens += llm.tokenize(
        bytes(
            f"{B_INST} {(messages[-1]['content']).strip()} {E_INST}", "utf-8"),
        add_bos=True,
    )

    return dialog_tokens


class LLMChatBot:
    def __init__(self, model_path):
        if not os.path.exists(model_path):
            print("Model not found at the specified path.")
            return

        self.llama = Llama(model_path=model_path, n_ctx=1024, n_gpu_layers=-1)
        print("Local LLM loaded successfully.")

    def get_response(self, user_message):
        print("User message:", user_message)
        print("Generating response...")
        messages: List[Message] = [
            Message(role="user", content=user_message),
        ]

        tokens = make_prompt_llama2(self.llama, messages)

        completion = self.llama.generate(tokens=tokens, temp=0.01)

        response_text = ""

        for token in completion:
            if token == self.llama.token_eos():
                break
            response_text += self.llama.detokenize([token]).decode("utf-8")
        print("Response:", response_text)
        return response_text


# Flask app initialization
app = Flask(__name__)

# Enable CORS
CORS(app)

# File path to store the selected model information
selected_model_path = os.path.join(os.path.expanduser(
    "~"), ".Llama_extension", "selected_model.json")

# Function to save the selected model information to a JSON file
def save_selected_model(model_path):
    try:
        os.makedirs(os.path.dirname(selected_model_path), exist_ok=True)
        with open(selected_model_path, "w") as file:
            json.dump({"modelPath": model_path}, file)
    except Exception as e:
        print(f'Error while saving selected model information: {str(e)}')

# Function to load the selected model information from the JSON file
def load_selected_model():
    try:
        if os.path.exists(selected_model_path):
            with open(selected_model_path, "r") as file:
                data = json.load(file)
                return data.get("modelPath", None)
    except Exception as e:
        print(f'Error while loading selected model information: {str(e)}')
    return None


# Check if a default model is already selected, otherwise prompt for selection
if not load_selected_model():
    # Prompt the user to select the default model and store it
    default_model_path = input(
        "Please enter the path to the default model: ").strip()
    save_selected_model(default_model_path)

# Use the selected default model path
model_path = load_selected_model()

bot = LLMChatBot(model_path=model_path)


@app.route('/set_selected_folder', methods=['POST'])
def set_selected_folder():
    global selected_folder
    try:
        data = request.get_json()
        selected_folder = data.get('selectedFolder', '')
        print(f'Selected folder path: {selected_folder}')
        return jsonify({'status': 'Folder path set successfully'})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/get_selected_folder', methods=['GET'])
def get_selected_folder():
    global selected_folder
    try:
        return jsonify({'selectedFolder': selected_folder})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/get_current_model', methods=['GET'])
def get_current_model():
    try:
        return jsonify({'current_model': model_path})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/load_model', methods=['POST'])
def load_model():
    try:
        data = request.get_json()
        model_path_file = os.path.dirname(model_path)
        print(f'Loading model: {model_path_file}')
        print(f'Loading model: {data}')
        model_path_new = os.path.join(model_path_file, data.get('model', ''))
        bot = LLMChatBot(model_path=model_path_new)
        return jsonify({'status': 'Model loaded successfully'})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

# Route to get the list of .gguf files in the model directory
@app.route('/get_gguf_files', methods=['GET'])
def get_gguf_files():
    try:
        gguf_files = []
        if model_path:
            # remove the file name from the path
            model_path_file = os.path.dirname(model_path)
            for file in os.listdir(model_path_file):
                if file.endswith(".gguf"):
                    gguf_files.append(file)
        return jsonify({'gguf_files': gguf_files})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def handle_query():
    try:
        data = request.get_json()
        user_message = data.get('query', '')
        print(f'Received query: {user_message}')
        response = bot.get_response(user_message)
        print(f'Sending response: {response}')
        return jsonify({'response': response})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        return jsonify({'status': 'healthy'})
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500



if __name__ == "__main__":
    print("API endpoint available.")
    app.run(host='127.0.0.1', port=5000)
# Local LLama Chrome Extension
## What is this?

This is a chrome extension that allows you to query the llama-cpp-python models while in the browser. It uses a local server to handle the queries and display the results in a popup.

## Showcase

![showcase](./screenshots/animate-use.gif)

## Prerequisites

llama-cpp-python must be installed and some models must be downloaded. See [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) for more information.
Models available for download from huggingface:
- [TheBlokeAI](
https://huggingface.co/TheBloke/)
i'v been using:
- [TheBlokeAI/Llama-2-7B](https://huggingface.co/TheBloke/Llama-2-7b-Chat-GGUF)
for my testing but most of the gguf models should work.
obviously the bigger the model the slower the query. and the more ram it will use.


## How to use it?

1. Clone this repo
2. Open Chrome and go to `chrome://extensions/`
3. Enable developer mode
4. Click on `Load unpacked` and select the folder where you cloned this repo
5. Go to any page and click on the extension icon
6. start the server with `python3 server.py`
7. Type in the query and press enter
8. The results will be displayed in the popup

## TODO

- [x] add a server to handle the queries
- [x] add a popup to display the results
- [x] store and retrieve conversations
- [x] clear saved conversations
- [ ] add a settings page
- [ ] add a way to change the server address
- [ ] add a way to change the model easily
- [ ] add a way to download models from huggingface
- [ ] add a way to start the server from the extension

## 
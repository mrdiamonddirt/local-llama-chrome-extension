document.addEventListener('DOMContentLoaded', function () {
  const queryInput = document.getElementById('queryInput');
  const submitButton = document.getElementById('submitButton');
  const resultDiv = document.getElementById('result');
  const serverCheckButton = document.getElementById('serverCheck');
  const creatorButton = document.getElementById('creatorButton');
  const creatorWindow = document.getElementById('creator-wrapper');
  const creatorClose = document.getElementById('creatorClose');
  const helpWrapper = document.getElementById('help-wrapper');
  const helpButton = document.getElementById('helpButton');
  const helpClose = document.getElementById('helpClose');
  const clearConvo = document.getElementById('ClearConvo');
  const settingsButton = document.getElementById('settingMenuBtn');
  const settingsWindow = document.getElementById('settings-wrapper');
  const settingsClose = document.getElementById('settingsClose');
  const modelSelect = document.getElementById('modelSelect');
  const changeModelButton = document.getElementById('changeModel');
//   const serverStart = document.getElementById('serverStart');

  var creatorContentOpen = false;
  var helpContentOpen = false;
  var code_response = null;

  // if the settings are open get the current model selected in modelSelect and send it to the server to be loaded
    changeModelButton.addEventListener('click', function () {
        var model = modelSelect.options[modelSelect.selectedIndex].value;
        console.log(model);
        fetch('http://127.0.0.1:5000/load_model', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ model: model }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Received data:", data);

            // Check if data.current_model is defined
            if (data.current_model) {
                // change the current model
                document.getElementById('modelLoaded').innerText = data.current_model;
            } else {
                console.log("No current_model data found.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

  function saveQuestionAndResponse(question, response) {
    const savedData = JSON.parse(localStorage.getItem('savedCoversation')) || [];
    savedData.push({ question, response });
    localStorage.setItem('savedCoversation', JSON.stringify(savedData));
  }

  // Function to recover and display saved questions and responses
  function displaySavedData() {
    const savedData = JSON.parse(localStorage.getItem('savedCoversation')) || [];
    for (const entry of savedData) {
      resultDiv.innerHTML += `<div class="user">You said: ${entry.question}</div>`;
      resultDiv.innerHTML += `<div class="bot">Response: ${entry.response}</div>`;
    }
  }

  function clearSavedData() {
    localStorage.removeItem('savedCoversation');
    resultDiv.innerHTML = '';
  }

  // Call this function to display saved data when the window is opened
  displaySavedData();

  resultDiv.addEventListener('click', function (event) {
    if (event.target.id === 'copyCode') {
      console.log('copying code');
      // Code to copy the text when the copy button is clicked
      var div = event.target.parentNode;
      console.log(div);
      var code = div.innerText;
      // replace the last word copy with nothing
      code = code.slice(0, -4);
      console.log(code);
      navigator.clipboard.writeText(code);
    }
  });

  queryInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        if (queryInput.value === '') {
            return;
        } else {
            submitButton.click();
            queryInput.value = '';
        }
    }
  });

  clearConvo.addEventListener('click', function () {
    clearSavedData();
    resultDiv.innerHTML = '';
  });

  creatorButton.addEventListener('click', function () {
      if (creatorContentOpen) {
          creatorContentOpen = false;
          creatorWindow.style.display = 'none';
      } else {
          creatorContentOpen = true;
          creatorWindow.style.display = 'block';
      }
  });

  creatorClose.addEventListener('click', function () {
      creatorContentOpen = false;
      creatorWindow.style.display = 'none';
  });

  helpButton.addEventListener('click', function () {
      if (helpContentOpen) {
          helpContentOpen = false;
          helpWrapper.style.display = 'none';
      } else {
          helpContentOpen = true;
          helpWrapper.style.display = 'block';
      }
  });

  helpClose.addEventListener('click', function () {
      helpContentOpen = false;
      helpWrapper.style.display = 'none';
  });

  settingsButton.addEventListener('click', function () {
      if (settingsWindow.style.display === 'block') {
          settingsWindow.style.display = 'none';
      } else {
          settingsWindow.style.display = 'block';
          
        get_current_model();

        get_ggufs();
    }
});

  function get_current_model() {
     // get the current model from the server
        fetch('http://127.0.0.1:5000/get_current_model', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log("Received data:", data);

            // Check if data.current_model is defined
            if (data.current_model) {
                // set the current model
                document.getElementById('modelLoaded').innerText = data.current_model;
            } else {
                console.log("No current_model data found.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
  }

  function get_ggufs() {
        // get models from the server
        fetch('http://127.0.0.1:5000/get_gguf_files', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log("Received data:", data);

            // Check if data.gguf_files is defined
            if (data.gguf_files && data.gguf_files.length) {
                // remove the current options
                var select = document.getElementById('modelSelect');
                var length = select.options.length;
                for (i = length-1; i >= 0; i--) {
                    select.options[i] = null;
                }

                // add the new options
                for (var i = 0; i < data.gguf_files.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = data.gguf_files[i];
                    opt.innerHTML = data.gguf_files[i];
                    select.appendChild(opt);
                }
            } else {
                console.log("No gguf_files data found.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
  }

  settingsClose.addEventListener('click', function () {
      settingsWindow.style.display = 'none';
  });


  serverCheckButton.addEventListener('click', function () {
    // guery the server to check if it is running
    // if you get a response then turn the button green
    // if you don't get a response then turn the button red
    fetch('http://127.0.0.1:5000/health', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        })
        .then(response => response.json())
        .then(data => {
            serverCheckButton.style.backgroundColor = 'green';
        })
        .catch(error => {
            serverCheckButton.style.backgroundColor = 'red';
        });
    })
    
//   serverStart.addEventListener('click', function () {
//     chrome.runtime.sendNativeMessage('com.local.llama', { command: 'run_python_script' }, function(response) {
//   // Handle the response from the Native Host application (if needed)
//     });
//   });



  submitButton.addEventListener('click', function () {
    const query = queryInput.value;
    your_prompt = queryInput.value
    resultDiv.innerHTML += `<div class="user">You said: ${your_prompt}</div>`;

    resultDiv.innerHTML += `<div class="loading">"Llama is thinking..."</div>`;
    resultDiv.scrollTop = resultDiv.scrollHeight;

    fetch('http://127.0.0.1:5000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query }),
    })
      .then(response => response.json())
      .then(data => {
        // remove the loading text
        const loading = document.querySelector('.loading');
        loading.parentNode.removeChild(loading);

        // resultDiv.textContent = `Response from the local model: ${data.response}`;
        data.response = data.response.replace(/(?:\r\n|\r|\n)/g, '<br>');
        // if * or a number follows a period and a space before
        data.response = data.response.replace(/\. \*/g, '\n');
        // also handle numbered lists
        data.response = data.response.replace(/\. \d/g, '\n');
        // get the code between the 3 backticks
        code_response = data.response.match(/```(.*?)```/g);
        // on the the ''' if there is a <br> before the code remove it
        if (code_response) {
            // remove the first <br> if it exists
            data.response = data.response.replace(/```<br>/g, '```');
            data.response = data.response.replace(/```(.*?)```/g, '<div class="code"><pre>$1</pre><div id="copyCode">copy</div></div>');
        }
        resultDiv.innerHTML += `<div class="bot">Response: ${data.response}</div>`;	
        // Scroll to the bottom of the div
        resultDiv.scrollTop = resultDiv.scrollHeight;
        saveQuestionAndResponse(query, data.response);
        queryInput.value = '';
      })
      .catch(error => {
        const loading = document.querySelector('.loading');
        loading.parentNode.removeChild(loading);

        resultDiv.innerHTML += `<div class="error">${error}, is the server up?</div>`;	 
        // console.error(error);
      });
  });
});

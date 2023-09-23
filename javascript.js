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
//   const serverStart = document.getElementById('serverStart');

  var creatorContentOpen = false;
  var helpContentOpen = false;

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
            data.response = data.response.replace(/```(.*?)```/g, '<div class="code">$1</div>');
        }
        resultDiv.innerHTML += `<div class="bot">Response: ${data.response}</div>`;	
        // Scroll to the bottom of the div
        resultDiv.scrollTop = resultDiv.scrollHeight;
        saveQuestionAndResponse(query, data.response);

      })
      .catch(error => {
        const loading = document.querySelector('.loading');
        loading.parentNode.removeChild(loading);

        resultDiv.innerHTML += `<div class="error">${error}, is the server up?</div>`;	 
        // console.error(error);
      });
  });
});

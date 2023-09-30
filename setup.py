from setuptools import setup, find_packages

setup(
    name='local-llama',  # Change this to a suitable name for your script
    version='1.0.2',
    description='A flask server for a chrome extension that querys llm models',
    long_description='A flask server for a chrome extension that querys llm models for use with this chrome extention: https://chrome.google.com/webstore/detail/local-llama-llm-ai-chat-q/ekobbgdgkocdnnjoahoojakmoimfjlbm',
    url='https: // github.com/mrdiamonddirt/local-llama-chrome-extension',
    author='Rowan Wood',
    author_email='mrdiamonddirt@gmail.com',
    packages=find_packages(),
    install_requires=[
        'Flask',
        'flask-cors',
        'rich',
        'llama-cpp-python',
        'typing-extensions',
    ],
    entry_points={
        'console_scripts': [
            'local-llama = Cli.cli:main',
        ],
    },
)

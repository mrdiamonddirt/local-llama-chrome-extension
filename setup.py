from setuptools import setup, find_packages

setup(
    name='local-llama',  # Change this to a suitable name for your script
    version='1.0.1',
    description='A flask server for a chrome extension that querys llm models',
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

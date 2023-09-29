import argparse
from localLlama.server import app


def start_server(ip='127.0.0.1', port=8000):
    print(f"API endpoint available at http://{ip}:{port}/")
    app.run(host=ip, port=port)


def main():
    parser = argparse.ArgumentParser(
        description="Start the server with optional IP and port arguments.")
    parser.add_argument("--ip", default="127.0.0.1",
                        help="The IP address to bind to (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000,
                        help="The port to listen on (default: 8000)")
    args = parser.parse_args()

    start_server(ip=args.ip, port=args.port)


if __name__ == "__main__":
    main()

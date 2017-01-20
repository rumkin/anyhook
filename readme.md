# Anyhook

Capture web hooks from github and bitbucket and call associated bash scripts.

## Installation

Install via npm:
```bash
npm i anyhook -g
```

## Usage

Create `webhook.json`:
```json
{
    "repoName": {
        "token": "8ecc7e51-b2d6-4f75-ad32-2971ca04a76f",
        "enabled": true,
        "exec": [
            "echo \"Updated: $WEBHOOK_REPO\" > /var/log/repo-name.log",
            {
                "cmd": "bash",
                "args": ["-c", "echo \"Updated: $WEBHOOK_REPO\""],
                "stdio": "/var/log/repo-name.log",
            }
        ]
    }
}
```

**NOTE** Both commands in example are equivalent.

Then run anyhook app:
```bash
anyhook --port=8080
```

Now it will listen `0.0.0.0:8080` address. Webhooks URL is
`/api/webhook/:repoName`.

## License

MIT.

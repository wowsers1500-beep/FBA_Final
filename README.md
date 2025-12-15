# FBA_Final

## Run locally (Live Server)

Open this project in VS Code and use the Live Server extension (right-click on `index.html` -> "Open with Live Server"). Alternatively you can run a simple HTTP server from the project root and open the site in your browser:

```bash
cd /path/to/FBA_Final
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

If you open files directly (file:///) some features (like fetching the CSV) may not work due to browser security restrictions — use Live Server or a local HTTP server.
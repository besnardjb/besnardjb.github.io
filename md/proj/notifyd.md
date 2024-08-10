**Notifyd**
================

A Rust daemon for sending notifications from a REST interface to a network of Google Homes.

[Github](https://github.com/besnardjb/notifyd/)

**Overview**
------------

Notifyd is a simple daemon that listens for incoming requests on a specified port and sends corresponding notifications to one or more Google Home devices. This can be useful for automating various tasks, such as alerting users to new messages, reminders, or other events.

**Dependency**
--------------

- For casting to google homes: [go-chromecast](https://github.com/vishen/go-chromecast)

```bash
# Use to find devices UID on your network
go-chromecast  ls
```

- For tts: [pipertts](https://github.com/rhasspy/piper) (or other see below)

Sample wrapper script to implement pipertts:
```bash
#!/bin/sh

if test -z "${TTSMODEL}"; then
    TTSMODEL=fr_FR-siwis-medium
fi

VPATH=/opt/venvs/piper_tts/voices/

piper -m ${VPATH}/${TTSMODEL}.onnx -c ${VPATH}/${TTSMODEL}.onnx.json "$@"
```

**Usage**
---------

To use Notifyd, simply run the binary with the desired options:
```bash
notifyd -c <CHROMECAST_UUID> [-h|--help] [-l|--lang <LANG>] [-p|--port <PORT>] [-t|--engine <ENGINE>]
```

Rest endpointd:
- `/notify` : main entrypoing taking a single json object with text

```bash
#!/bin/sh

NOW="Ding Dong ! Il est $(date +%H:%M)."
curl -s http://localhost:8090/notify\
      -H "Content-Type: application/json" \
        -d "{\"text\" : \"$NOW\"}"
```

- `action/cast` takes `text` and `uid` in a JSON post to choose the Chromecast ID to be used


- `action/speak` : same as notify but uses local speakers

**Options**
------------

* `-c`, `--chromecast-uuid <CHROMECAST_UUID>`: The UUID of the Chromecast device to target. If not specified, Notifyd will use the "Use Local Speaker" feature (i.e., it will speak directly on the machine running the daemon).
* `-h`, `--help`: Print this help message and exit.
* `-l`, `--lang <LANG>`: The language to use for Text-to-Speech (TTS). Currently supported languages are English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese Simplified, Chinese Traditional, Japanese, Korean, and Polish.
* `-p`, `--port <PORT>`: The port on which the webserver should listen. Defaults to 8090.
* `-t`, `--engine <ENGINE>`: The TTS engine to use for generating speech from text in the REST request, will try to autodetect. Currently supported engines are:
	+ `pipertts`: Use PIPER TTS (recommended).
	+ `pico2wave`: Use Pico2Wave.
	+ `espeak`: Use eSpeak.
	+ `espeak-ng`: Use eSpeak-ng.


**Example Use Cases**
---------------------

1. **Simple alert system**: Run Notifyd with a specific Chromecast UUID and have it send notifications when new emails arrive in your inbox.
2. **Home automation**: Integrate Notifyd with other home automation systems (e.g., Home Assistant) to receive voice notifications about various events (e.g., doorbell presses, motion sensors).
3. **Custom application integrations**: Use the REST interface of Notifyd to send custom notifications from your own applications or scripts.

**Build and Run**
-----------------

To build and run Notifyd, simply execute:
```bash
cargo run -c <CHROMECAST_UUID> [-h|--help] [-l|--lang <LANG>] [-p|--port <PORT>] [-t|--engine <ENGINE>]
```
Replace `<CHROMECAST_UUID>` with the actual UUID of your Chromecast device if desired.

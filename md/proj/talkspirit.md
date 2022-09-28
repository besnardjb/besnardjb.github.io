# Talkspirit Webhook Proxy

Convert Mattermost Notififications to Talkspirit ones in order to support more services.

## Install

```sh
git clone https://github.com/besnardjb/talkspiritproxy.git
cd talkspiritproxy
pip install .
```

## Config Example

```yaml
# Port to listen ON
listen: 9999
# Where to forward
forward: https://webhook.talkspirit.com/v1/incoming/XXXXXX
# How to display the messages
ident:
    title: "Post title"
    name: "Talkspirit Proxy"
    url: "http://mypost_link.com"
    icon: ""
```

And run:

```
tsproxy  -c ./conf.yml
```

## Tested with:

Mostly intended to forward Gitlab events to Talkspirit using the native mattermost integration.
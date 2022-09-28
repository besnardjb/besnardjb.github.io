# Second Brain

This is a helper to redact and maintain Second Brain notes from the Command Line Interface.

## Install

```
git clone https://github.com/besnardjb/sbr.git
cd ./sbr/
pip install --user .
```

## Configure

Generate config file:

```
sb
```

Edit config file in `~/.config/sbr/config.yaml` :

```yaml
# Where you located your notes
brain_location: ~/Dropbox/Obsidian/My Notes
# Date format to use for daily notes see https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes
daily_format: Daily/%Y/%m/%d
```

## Templates

If a `Template.md` file is present in one of the parent directory it will be used to create new notes. For example you may create `Template.md` in your Daily directory to automatically spawn a note with initial content when doing `sb -de`.

## Usage

Show daily note:

        sb -d

Edit daily node (uses `$EDITOR` or by default `vim`):

        sb -de

Show previous daily note:

        sb -p

Edit previous daily node:

        sb -pe

Open a note at a given path:

        sb -eo Project/moon/launch.md

Show a note matching a word (add `-e` to edit it):

        sb -f launch

List existing notes:

        sb -l

# License

CECILL-C (LGPL)


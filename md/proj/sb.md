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

If you include the specific marker "%tasks%" in your template all the pending tasks as listed by `sb -t` will be copied in the newly edited notes. It is then  convenient to use this marker in the daily template to automagically copy pending tasks not done the previous day to the new day. Note a task is simply a markdown checkbox in a daily note:

```md
* [ ] my fancy task
```

And a task is considered done if it has an instance of it with the box checked:

```md
* [x] my fancy task
```

Sample daily template with tasks:

```md
# Daily Note

# Todos

%tasks%

# My Day


```

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

## Help

```
usage: sb [-h] [-d] [-e] [-f FIND] [-g GREP] [-l] [-n] [-o OPEN] [-p] [-t] [-T] [-v]

Second BRain.

optional arguments:
  -h, --help            show this help message and exit
  -d, --daily           Target daily note
  -e, --edit            Open target for eddition
  -f FIND, --find FIND  Open file matching pattern
  -g GREP, --grep GREP  List files matching a pattern
  -l, --list            List notes
  -n, --nextdaily       Target next daily note
  -o OPEN, --open OPEN  Target existing node
  -p, --prevdaily       Target previous daily note
  -t, --tasks           List unchecked items in daily notes (last 360 days)
  -T, --alltasks        List all items in daily notes with their locations (last 360
                        days)
  -v, --view            View target content (default)
```

# License

CECILL-C (LGPL)


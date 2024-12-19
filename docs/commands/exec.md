# Command exec

- [Command exec](#command-exec)
  - [Description](#description)
  - [Usage](#usage)
  - [Configuration](#configuration)

## Description

## Usage

```sh
mhd exec --help
```

```txt
mhd exec <script>

Exec some script from ".mhdrc"

Positionals:
  script  script to execute               [required] [choices: "test", "diff", "update", "backup", "restore", "extract"]

Options:
      --version    Show version number                                                                         [boolean]
  -h, --help       Show help                                                                                   [boolean]
  -l, --logLevel   Severity of the log output           [choices: "error", "info", "verbose", "debug"] [default: "info"]
  -i, --intFolder  Integration folder of the collection                                          [string] [default: "."]

Examples:
  mhd exec diff     Show differences between INT and PROD
  mhd exec update   Update PROD with the files from INT
  mhd exec backup   Backup PROD to BKUP
  mhd exec restore  Restore BKUP to PROD
  mhd exec extract  Extract MDs from PROD to INT
```

## Configuration

There are no special configuration options apart from the standard options *logLevel* and *intFolder*.
Everything else is configured within the scripts and variables of `.mhdrc`.

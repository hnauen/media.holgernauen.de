# media.holgernauen.de

Tools to maintain the media collection.

> [!NOTE]
> All the stuff here is for my media collection and only tested on my devices and with my software.
> Feel free to ask, but I'm afraid I don't have the capacity for extensive support.

- [media.holgernauen.de](#mediaholgernauende)
  - [Concept](#concept)
  - [Required tools](#required-tools)
  - [Installation](#installation)
    - [Configure mhd](#configure-mhd)
  - [Usage](#usage)
  - [Development](#development)
    - [Development in China](#development-in-china)

## Concept



## Required tools

Install tools

- [Rclone](https://rclone.org/) is used for file transfer between INT, PROD, and BKUP.

```sh
brew install rclone
```

Configure tools

- Rclone
  - `rclone config`: Add remotes for PROD and BKUP.
  - Use `type = alias` for local drives, e.g. usb disks, and set `remote = /Volumes/[Name]`
  - Test the config via `rclone rcd --rc-web-gui`

## Installation

```sh
nvm use
npm install
npm run build
npm link
```

### Configure mhd

- `mhd init`
- Edit `.mhdrc`
  - Enter Rclone *remote:path* for PROD and BKUP

## Usage

## Development

### Development in China

NPM is very, very slow in China.
The remedy is [npmmirror](https://npmmirror.com/).

```sh
alias cnpm="npm --registry=https://registry.npmmirror.com  --cache=$HOME/.npm/.cache/cnpm  --disturl=https://npmmirror.com/mirrors/node  --userconfig=$HOME/.cnpmrc"
cnpm install [Name]
```

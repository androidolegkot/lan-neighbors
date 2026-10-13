# IP Neighbors

Version 1.0 — a Node.js and React web application for discovering responsive devices on a local IPv4 network.

## Features

- Select an active IPv4 network interface.
- Discover neighbors with ARP first (arp-scan and the Linux neighbor table), then ping each discovered address.
- Ping-sweep the remaining addresses in the subnet.
- Show IP, reverse hostname, MAC, IEEE manufacturer, ping latency, TTL, heuristic OS estimate, mDNS name, NetBIOS name, and configured TCP port status.
- Add any number of unique TCP ports and optional column names.
- Save interface, timeout, ports, language, theme, and English/Russian translations in config/settings.json. Toggle light/dark theme in the header.
- System language is the default. Progress is split into 0–50% ARP discovery and 50–100% subnet sweep.
- About: IP Neighbors, version 1.0, author chatgpt.com.

## Requirements

Debian 13 or similar, Node.js 20+, npm, iproute2, and iputils-ping. Optional packages improve discovery:

    sudo apt update
    sudo apt install iproute2 iputils-ping arp-scan avahi-utils samba-common-bin

The IEEE OUI vendor database is downloaded once from the IEEE public endpoint and cached per user at ~/.cache/ip-neighbors/oui.txt. The cache parser recognizes IEEE's hyphenated OUI prefixes. If unavailable, scanning continues without vendor names. mDNS uses avahi-resolve-address; NetBIOS uses nmblookup.

## Install

    git clone https://github.com/androidolegkot/lan-neighbors.git
    cd lan-neighbors
    npm install
    npm run build
    npm start

Open http://DEBIAN-IP:8787 in a browser on the trusted LAN. The API server listens on all interfaces. Do not expose it directly to the public internet: authentication is not included.

For UI development, run npm start and npm run dev in separate terminals. Vite listens on port 5173 and proxies API calls to port 8787.

## Notes

- Only devices replying to ping are displayed. Firewalls may block ping even when a device is online.
- OS is estimated from TTL and is not definitive identification.
- The app supports IPv4 prefixes /16 through /30. Ping timeout is 100–10000 ms. Port entries are limited by practical browser, JSON request, and operating-system resources rather than an application-level port-count setting.
- ARP scanning may require root or suitable arp-scan capabilities.
- MAC randomization and unassigned IEEE prefixes may have no manufacturer result.

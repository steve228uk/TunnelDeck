# TunnelDeck [![Chat](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/ZU74G2NJzk)

TunnelDeck allows you to access any OpenVPN or WireGuard connections from the Network Manager. Any connections that are added in desktop mode or from the command line will be available to connect to from the TunnelDeck menu.

If you want to get in contact with the developers, we can be found in the **[SteamDeckHomebrew Discord](https://discord.gg/ZU74G2NJzk)**.

## Disclaimer

Using a VPN to access Steam is against their terms of service and the developers of TunnelDeck take no responsibility for any action Valve may take against your account. It's unlikely that you will be banned but we'd recommend avoiding purchasing games while connected to the VPN.

You will also likely be logged out from Steam and will need to log back in if you remain connected to their servers while using a VPN.

## Usage

Connecting to a VPN in TunnelDeck currently requires it to be setup in desktop mode — usually with a `.conf` or `.ovpn` file provided my your VPN provider.

### VPN Connection Creation/Import

From desktop mode, open the **System Settings** and select **Connections** in the **Network** section from the sidebar.

// PHOTO OF PANEL

To create a new VPN connection, click the **+** button and scroll down to the **Other** section. Select the **Import VPN connection...** option and select the `.conf` or `.ovpn` file provided by your VPN provider.

// PHOTO OF PLUS PANEL

Some VPN connections required a username and password. These should be entered in the **VPN** tab of the newly created connection. It's important that the **Store password for all users (not encrypted)** option is selected as TunnelDeck establishes the VPN connection as the root user.

### Connecting to a VPN

Once the connection has been created and saved in Desktop Mode, TunnelDeck is ready to be used in Gaming Mode.

Open the quick access menu by clicking the **...** on your Steam Deck and select TunnelDeck from the Decky Plugins panel. Here you'll be able to see all of the connections you have in Network Manager and simply click on the toggle to connect or disconnect from the VPN.

## Credits

- [Stephen Radford](https://twitter.com/steve228uk) - Developer
- [AAGaming](https://aa.catvibers.me) - Answering my annoying questions
- [Kevin Wammer](https://overkill.wtf) - Idea and name

## Building the Plugin Manually

```bash
pnpm i
pnpm run build
```
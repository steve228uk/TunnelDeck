import subprocess
import logging
from os import path
from settings import SettingsManager
from helpers import get_user

USER = get_user()
HOME_PATH = "/home/" + USER
HOMEBREW_PATH = HOME_PATH + "/homebrew"

logging.basicConfig(filename="/tmp/tunneldeck.log",
                    format='[TunnelDeck] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO)

def connection_mapper(xn):
    components = xn.split()
    return {
        "name": components[0],
        "uuid": components[1],
        "type": components[2],
        "device": components[3],
        "connected": False if components[3] == '--' else True
    }

def get_active_connection():
    result = subprocess.run(["nmcli", "connection", "show", "--active"], text=True, capture_output=True).stdout
    connections = result.splitlines()
    connections.pop(0)
    mapped = map(connection_mapper, connections)
    return next(filter(lambda xn: xn["type"] == 'wifi' or xn["type"] == 'ethernet', mapped), None)

def run_install_script():
    logger.info("Running Install Script")
    subprocess.run(["bash", path.dirname(__file__) + "/extensions/install"], cwd=path.dirname(__file__) + "/extensions")

def run_uninstall_script():
    logger.info("Running Uninstall Script")
    subprocess.run(["bash", path.dirname(__file__) + "/extensions/uninstall"], cwd=path.dirname(__file__) + "/extensions")

class Plugin:

    settings: SettingsManager = SettingsManager("tunneldeck", path.join(HOMEBREW_PATH, "settings"))

    async def _main(self):
        logger.info("Loading OpenVPN setting")
        openvpn_enabled = self.settings.getSetting("openvpn_enabled", False)
        if openvpn_enabled:
            logger.info("OpenVPN enabled: " + "yes" if openvpn_enabled else "no")
            run_install_script()

    # Lists the connections from network manager.
    # If device is -- then it's disconnected.
    async def show(self):
        result = subprocess.run(["nmcli", "connection", "show"], text=True, capture_output=True).stdout
        connections = result.splitlines()
        connections.pop(0)        
        mapped = map(connection_mapper, connections)
        return list(mapped)

    # Establishes a connection to a VPN
    async def up(self, uuid):
        logger.info("OPENING connection to: " + uuid)
        result = subprocess.run(["nmcli", "connection", "up", uuid], text=True, capture_output=True).stdout
        return result

    # Closes a connection to a VPN
    async def down(self, uuid):
        logger.info("CLOSING connection to: " + uuid)
        result = subprocess.run(["nmcli", "connection", "down", uuid], text=True, capture_output=True).stdout
        return result

    # Checks if IPV6 is disabled on Wi-Fi
    async def active_connection(self):
        connection = get_active_connection()
        if connection == None:
            return None

        result = subprocess.run(["nmcli", "connection", "show", connection["uuid"], "|", "grep", "ipv6.method"], text=True, capture_output=True).stdout
        connection["ipv6_disabled"] = True if "disabled" in result else False
        return connection

    # Disables IPV6 on currently active connection
    async def disable_ipv6(self):
        connection = get_active_connection()
        if connection == None:
            return True
        
        logger.info("DISABLING IPV6 for: " + connection["uuid"])
        subprocess.run(["nmcli", "connection", "modify", connection["uuid"], "ipv6.method", "disabled"])
        subprocess.run(["systemctl", "restart", "NetworkManager"])
        return True

    # Enable IPV6 on currently active connection
    async def enable_ipv6(self):
        connection = get_active_connection()
        if connection == None:
            return True
        
        logger.info("ENABLING IPV6 for: " + connection["uuid"])
        subprocess.run(["nmcli", "connection", "modify", connection["uuid"], "ipv6.method", "auto"])
        subprocess.run(["systemctl", "restart", "NetworkManager"])
        return True

    # The OpenVPN setting
    async def is_openvpn_enabled(self):
        return self.settings.getSetting("openvpn_enabled", False)

    # Enable OpenVPN
    async def enable_openvpn(self):
        logger.info("Enabling OpenVPN")
        self.settings.setSetting("openvpn_enabled", True)
        run_install_script()
        return True

    # Disable OpenVPN
    async def disable_openvpn(self):
        logger.info("Disabling OpenVPN")
        self.settings.setSetting("openvpn_enabled", False)
        run_uninstall_script()
        return True

    # Clean-up on aisle 5
    async def _unload(self):
        subprocess.run(["bash", path.dirname(__file__) + "/extensions/uninstall"], cwd=path.dirname(__file__) + "/extensions")
        pass
import subprocess
import logging
import os

logging.basicConfig(filename="/tmp/tunneldeck.log",
                    format='[TunnelDeck] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.DEBUG) # can be changed to logging.DEBUG for debugging issues


class Plugin:

    # Lists the connections from network manager.
    # If defive is ---- 
    async def show(self):
        result = subprocess.run(["nmcli", "connection", "show"], text=True, capture_output=True).stdout
        connections = result.splitlines()
        connections.pop(0)

        def mapper(xn):
            components = xn.split()
            return {
                "name": components[0],
                "uuid": components[1],
                "type": components[2],
                "connected": False if components[3] == '--' else True
            }

        mapped = map(mapper, connections)
        return list(mapped)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    #async def _main(self):

    
    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass

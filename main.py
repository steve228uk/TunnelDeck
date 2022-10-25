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
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
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
                "device": components[3]
            }

        mapped = map(mapper, connections)
        return list(mapped)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    #async def _main(self):

    
    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass

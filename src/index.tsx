import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  ToggleField
} from "decky-frontend-lib";

import {
  VFC,
  useEffect,
  useState
} from "react";

import { FaShieldAlt } from "react-icons/fa";


type Connection = {
  name: string,
  uuid: string,
  type: string,
  connected: boolean
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {

  const [ loaded, setLoaded ] = useState(false);
  const [ connections, setConnections ] = useState<Connection[]>([]);

  const loadConnections = async () => {
    const response = await serverAPI.callPluginMethod<{}, Connection[]>('show', {});
    const connections = response.result as Connection[];
    const filtered = connections
    .filter((connection) =>['vpn', 'wireguard'].includes(connection.type))
    .sort((a, b) => {
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });
    setConnections(filtered);
    setLoaded(true);
  }

  const toggleConnection = async (connection: Connection, switchValue: boolean) => {
    const response = await serverAPI.callPluginMethod((switchValue) ? 'up' : 'down', { uuid: connection.uuid });
    console.log(response);
    // Send a toast?
  }

  useEffect(() => {
    loadConnections();
  }, []);

  return (
    <PanelSection title="Connections">

      {loaded && connections.length == 0 && <PanelSectionRow>
        No Connections Found
      </PanelSectionRow>}

      {connections.length > 0 && connections.map((connection) => (
        <PanelSectionRow>
          <ToggleField
          bottomSeparator='standard'
          checked={connection.connected}
          label={connection.name}
          description={`Type: ${connection.type}`}
          onChange={(switchValue: boolean) => {
            toggleConnection(connection, switchValue);
          }} />
        </PanelSectionRow>
      ))}

    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {

  // TODO: check here if a VPN connection is active and send a toast

  return {
    title: <div className={staticClasses.Title}>TunnelDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShieldAlt />,
  };
});

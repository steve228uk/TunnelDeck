import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  ToggleField,
  ButtonItem,
  Router
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
    await serverAPI.callPluginMethod((switchValue) ? 'up' : 'down', { uuid: connection.uuid });
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

      <PanelSectionRow>
        <ButtonItem onClick={() => Router.NavigateToExternalWeb('https://github.com/steve228uk/TunnelDeck#readme')}>
          How Do I Add Connections?
        </ButtonItem>
      </PanelSectionRow>

    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>TunnelDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShieldAlt />,
  };
});

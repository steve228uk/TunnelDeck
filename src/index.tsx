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
  connected: boolean,
  ipv6_disabled?: boolean
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {

  const [ loaded, setLoaded ] = useState(false);
  const [ connections, setConnections ] = useState<Connection[]>([]);
  const [ activeConnection, setActiveConnection ] = useState<Connection>();
  const [ ipv6Disabled, setIpv6Disabled ] = useState(false);

  const loadConnections = async () => {

    try {
      const response = await serverAPI.callPluginMethod<{}, Connection[]>('show', {});
      const connections = response.result as Connection[];
      const filtered = connections
      .filter((connection) => ['vpn', 'wireguard'].includes(connection.type))
      .sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });

      setConnections(filtered);
    } catch (error) {
      console.error(error);
    }

    try {
      const activeConnectionResponse = await serverAPI.callPluginMethod<{}, Connection>('active_connection', {});
      const activeConnection = activeConnectionResponse.result as Connection;

      console.log(activeConnectionResponse);

      setActiveConnection(activeConnection);
      setIpv6Disabled((activeConnection.ipv6_disabled) ? true : false);
    } catch (error) {
      console.error(error);
    }

    setLoaded(true);
  }

  const toggleConnection = async (connection: Connection, switchValue: boolean) => {
    await serverAPI.callPluginMethod((switchValue) ? 'up' : 'down', { uuid: connection.uuid });
  }

  const toggleIpv6 = async(switchValue: boolean) => {
    setIpv6Disabled(switchValue);
    await serverAPI.callPluginMethod((switchValue) ? 'disable_ipv6' : 'enable_ipv6', {});
  }

  useEffect(() => {
    loadConnections();
  }, []);

  return (
    <>
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
      <PanelSection title="Settings">
          <PanelSectionRow>
            <ToggleField
            bottomSeparator='standard'
            checked={ipv6Disabled}
            label='Disable IPV6'
            disabled={!activeConnection}
            description='Disables IPV6 support for the current connection. Required for some VPNs.'
            onChange={toggleIpv6} />
          </PanelSectionRow>
      </PanelSection>
    </>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>TunnelDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaShieldAlt />,
  };
});

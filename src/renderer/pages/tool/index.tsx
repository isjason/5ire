import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Empty from 'renderer/components/Empty';
import TooltipIcon from 'renderer/components/TooltipIcon';
import useMCPStore from 'stores/useMCPStore';
import Grid from './Grid';
import NewButton from './NewButton';
import { Button } from '@fluentui/react-components';
import { ArrowSyncCircleRegular } from '@fluentui/react-icons';
import { set } from 'lodash';

export default function Tools() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const config = useMCPStore((state) => state.config);
  const builtinConfig = useMCPStore((state) => state.builtinConfig);
  const activeServerNames = useMCPStore((state) => state.activeServerNames);

  const loadConfig = async (force: boolean, animate: boolean) => {
    try {
      animate && setLoading(true);
      await Promise.all([
        useMCPStore.getState().fetchConfig(),
        useMCPStore.getState().loadConfig(force),
        useMCPStore.getState().getActiveServerNames(),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      animate && setLoading(false);
    }
  };

  const servers = useMemo(() => {
    const mergedServers = [...builtinConfig.servers];
    config.servers.forEach((configServer) => {
      if (activeServerNames.includes(configServer.key)) {
        configServer.isActive = true;
      } else {
        configServer.isActive = false;
      }
      const index = mergedServers.findIndex(
        (remoteServer) => remoteServer.key === configServer.key,
      );
      if (index !== -1) {
        mergedServers[index] = configServer;
      } else {
        mergedServers.push(configServer);
      }
    });
    return mergedServers;
  }, [builtinConfig, config, activeServerNames]);

  useEffect(() => {
    loadConfig(false, true);
  }, []);

  return (
    <div className="page h-full">
      <div className="page-top-bar"></div>
      <div className="page-header w-full">
        <div className="flex flex-col items-start w-full">
          <div className="flex justify-between items-baseline w-full">
            <h1 className="text-2xl flex-shrink-0 mr-6">{t('Common.Tools')}</h1>
            <div className="flex justify-end w-full items-center gap-2">
              <Button
                icon={
                  <ArrowSyncCircleRegular
                    className={loading ? 'animate-spin' : ''}
                  />
                }
                onClick={() => {
                  setLoading(true);
                  loadConfig(true, false);
                  setTimeout(() => setLoading(false), 1000);
                }}
                appearance="subtle"
                title={t('Common.Action.Reload')}
              />
              <NewButton />
            </div>
          </div>
          <div className="tips flex justify-start items-center">
            {t('Common.MCPServers')}
            <TooltipIcon
              tip={t('Tools.Description') + '\n' + t('Common.MCPDescription')}
            />
          </div>
          <div className="tip mt-0.5">{t('Tools.PrerequisiteDescription')}</div>
        </div>
      </div>
      <div className="mt-2.5 pb-12 h-full -mr-5 overflow-y-auto">
        {servers.length === 0 ? (
          <Empty image="tools" text={t('Tool.Info.Empty')} />
        ) : (
          <Grid servers={servers} />
        )}
      </div>
    </div>
  );
}
